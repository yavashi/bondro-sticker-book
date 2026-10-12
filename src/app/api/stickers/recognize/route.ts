import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

// Gemini API 構造化JSONスキーマ
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stickers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name_candidate: {
            type: Type.STRING,
            description: "シールの名称または特徴的な愛称 (例: ぷっくりイチゴ, ソーダドロップ)",
          },
          series_candidate: {
            type: Type.STRING,
            description: "推測されるシリーズ名 (不明なら スイートコレクション 等)",
          },
          motif: {
            type: Type.STRING,
            enum: [
              "ハート",
              "星",
              "スイーツ",
              "動物",
              "フラワー",
              "ジュエリー",
              "キャラクター",
              "その他",
            ],
            description: "シールのモチーフ分類",
          },
          primary_color: {
            type: Type.STRING,
            description: "主要カラーのHEXカラーコード (例: #FF69B4, #87CEEB, #FFFACD)",
          },
          finish_type: {
            type: Type.STRING,
            enum: [
              "クリアドロップ",
              "ラメ入り",
              "オーロラ",
              "パール",
              "ぷっくりマット",
            ],
            description: "シールの質感・光沢タイプ",
          },
          estimated_count: {
            type: Type.INTEGER,
            description: "画像内で確認できる同一シールの個数",
          },
          confidence_score: {
            type: Type.NUMBER,
            description: "認識の確信度 (0.0〜1.0)",
          },
        },
        required: [
          "name_candidate",
          "motif",
          "primary_color",
          "finish_type",
          "estimated_count",
        ],
      },
    },
  },
  required: ["stickers"],
};

// APIキー未設定時またはオフライン用のモックフォールバック
const MOCK_RECOGNITION_FALLBACK = {
  stickers: [
    {
      name_candidate: "きらきらチェリードロップ",
      series_candidate: "フルーツドロップ",
      motif: "スイーツ",
      primary_color: "#FF1493",
      finish_type: "クリアドロップ",
      estimated_count: 2, // ダブりテスト用
      confidence_score: 0.95,
    },
    {
      name_candidate: "パステルクラウンスター",
      series_candidate: "ドリーミースカイ",
      motif: "星",
      primary_color: "#BA55D3",
      finish_type: "オーロラ",
      estimated_count: 1,
      confidence_score: 0.9,
    },
    {
      name_candidate: "ぷっくりベアキャンディ",
      series_candidate: "ファンシーアニマル",
      motif: "動物",
      primary_color: "#FFB6C1",
      finish_type: "ラメ入り",
      estimated_count: 1,
      confidence_score: 0.88,
    },
  ],
};

// レートリミット管理 (1分間に最大5リクエスト / IP, specs/architecture.md 6.2項)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before scanning again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { imageBase64, mimeType = "image/jpeg" } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // APIキーが存在しない場合は開発用モックを返却 (AGENTS.md 2.4規約)
    if (!apiKey) {
      console.warn(
        "GEMINI_API_KEY is not set. Falling back to mock recognition result."
      );
      return NextResponse.json({
        ...MOCK_RECOGNITION_FALLBACK,
        isMock: true,
      });
    }

    // Google Gen AI SDK による呼び出し
    const ai = new GoogleGenAI({ apiKey });

    // Base64プレフィックスの除去
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `あなたは「ボンボンドロップシール（立体・透明感のあるドロップ型シール）」の鑑識AIエキスパートです。
提供された写真から、写っているボンボンドロップシールを可能な限り正確に特定・分類してください。
写真に複数のシールがある場合は、見つかったシールをすべてリストアップしてください。
光の反射やツヤ、ラメ、パール加工を注意深く識別し、指定のJSONスキーマに従って出力してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(rawText);
    return NextResponse.json({
      ...parsed,
      isMock: false,
    });
  } catch (error) {
    console.error("Gemini recognition error:", error);
    // エラー時もユーザー体験を阻害しないようモックで安全にフォールバック
    return NextResponse.json({
      ...MOCK_RECOGNITION_FALLBACK,
      isMock: true,
      errorDetail: String(error),
    });
  }
}
