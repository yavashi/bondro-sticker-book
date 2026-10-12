import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

// 市販ボンボンドロップシール公式カタログ概要（AI照合用）
const CATALOG_REFERENCE_TEXT = `
【公式市販カタログ一覧】
■ フルーツ＆スイーツドロップ (FD):
- FD-01: とろける完熟いちごドロップ (赤・ピンク / クリアドロップ)
- FD-02: ぷっくりフレッシュチェリー (濃い赤 / クリアドロップ)
- FD-03: シャインマスカットジュレ (黄緑 / クリアドロップ)
- FD-04: ハニーレモンキャンディ (黄 / ラメ入り)
- FD-05: ピーチネクターハート (ピンク / パール)
- FD-06: ブルーハワイソーダドロップ (水色 / ラメ入り)
- FD-07: メロンクリームソーダ (緑 / クリアドロップ)
- FD-08: ショコラベリーボンボン (茶・チョコ / ぷっくりマット)

■ ゆめかわアニマルドロップ (YA):
- YA-01: パステルみるくうさぎ (白・パステルピンク / パール)
- YA-02: ラベンダーこねこキャンディ (薄紫 / オーロラ)
- YA-03: もこもこクラウドベア (水色 / ラメ入り)
- YA-04: いちごみるくハムスター (ピンク / クリアドロップ)
- YA-05: レインボーユニコーン (紫・虹色 / オーロラ)
- YA-06: チョコミントわんこ (ミントグリーン / クリアドロップ)
- YA-07: シュガーピンクひつじ (ピンク / パール)
- YA-08: きらきらペンギンドロップ (青 / ラメ入り)

■ キラキラジュエル＆魔法 (KJ):
- KJ-01: ルビークラウンハート (深紅 / オーロラ)
- KJ-02: サファイアスターナイト (青 / ラメ入り)
- KJ-03: エメラルドドロップ (深緑 / クリアドロップ)
- KJ-04: アメジストクリスタル (紫 / オーロラ)
- KJ-05: ダイヤティアラドロップ (白・クリア / パール)
- KJ-06: トパーズサンシャイン (橙・黄 / ラメ入り)
- KJ-07: オーロラプリズムスター (多色 / オーロラ)
- KJ-08: ローズクォーツペンダント (薄ピンク / パール)
`;

// Gemini API 構造化JSONスキーマ
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stickers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          catalog_code: {
            type: Type.STRING,
            description: "該当する市販カタログコード (例: FD-01, YA-03, KJ-02)。該当なし・不明なら 'CUSTOM'",
          },
          name_candidate: {
            type: Type.STRING,
            description: "シールの名称または特徴的な愛称 (市販シールならその公式名)",
          },
          series_candidate: {
            type: Type.STRING,
            description: "シリーズ名 (フルーツ＆スイーツドロップ, ゆめかわアニマルドロップ, キラキラジュエル＆魔法, または推測名)",
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
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "シールが写っている領域の矩形バウンディングボックス [ymin, xmin, ymax, xmax] (0〜1000の整数)",
          },
        },
        required: [
          "catalog_code",
          "name_candidate",
          "motif",
          "primary_color",
          "finish_type",
          "estimated_count",
          "box_2d",
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
      catalog_code: "FD-01",
      name_candidate: "とろける完熟いちごドロップ",
      series_candidate: "フルーツ＆スイーツドロップ",
      motif: "スイーツ",
      primary_color: "#FF1493",
      finish_type: "クリアドロップ",
      estimated_count: 2,
      confidence_score: 0.98,
      box_2d: [150, 150, 850, 850],
    },
    {
      catalog_code: "YA-03",
      name_candidate: "もこもこクラウドベア",
      series_candidate: "ゆめかわアニマルドロップ",
      motif: "動物",
      primary_color: "#87CEEB",
      finish_type: "ラメ入り",
      estimated_count: 1,
      confidence_score: 0.92,
      box_2d: [200, 200, 800, 800],
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

    // APIキーが存在しない場合は開発用モックを返却
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

    const prompt = `あなたは「ボンボンドロップシール（立体・ぷっくりした樹脂ドロップシール）」の鑑定AIエキスパートです。
提供された写真から、写っているボンボンドロップシールを特定・鑑識してください。
写真に写っている個々のシールについて、必ず以下の手順を実行してください：

1. 【市販カタログとの照合】
以下の市販カタログ一覧を参照し、写真のシールが該当する場合はそのカタログコード（FD-01など）と正式名称・シリーズ名を割り当ててください。カタログにない場合は 'CUSTOM' とし、見た目に合わせた愛称をつけてください。
${CATALOG_REFERENCE_TEXT}

2. 【輪郭・位置の特定 (box_2d)】
画像全体を縦0〜1000、横0〜1000とした時の、そのシールが写っている矩形バウンディングボックス [ymin, xmin, ymax, xmax] を正確に特定してください。この座標を元にクライアント側でシールの実物写真を切り抜いてシール帳に貼ります。

3. 【質感の識別】
光の反射やツヤ、ラメ、パール、オーロラ、ぷっくりマット加工を注意深く識別し、指定のJSONスキーマに従って出力してください。`;

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
    return NextResponse.json({
      ...MOCK_RECOGNITION_FALLBACK,
      isMock: true,
      errorDetail: String(error),
    });
  }
}
