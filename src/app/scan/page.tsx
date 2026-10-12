"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStickers } from "@/context/StickerContext";
import { Camera, Image as ImageIcon, Sparkles, Check, ArrowLeft, Loader2, Plus, Minus, Trash2, Info } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { FinishType, MotifType } from "@/types";

interface DraftSticker {
  id: string;
  name: string;
  series: string;
  motif: MotifType;
  color: string;
  finishType: FinishType;
  quantity: number;
}

/**
 * クライアントサイドでの画像リサイズ・圧縮処理
 * 最大長辺1280px、JPEG Quality 0.8 に変換してペイロード超過(413)を防止
 */
function compressImage(file: File, maxDim = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 保存用の超軽量サムネイル生成 (最大長辺240px, Quality 0.6)
 * LocalStorageの5MB容量枯渇(QuotaExceededError)を恒久的に防止
 */
function generateThumbnailFromBase64(
  base64: string,
  maxDim = 240,
  quality = 0.6
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export default function ScanStickerPage() {
  const router = useRouter();
  const { addStickerFromDraft } = useStickers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draftStickers, setDraftStickers] = useState<DraftSticker[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 画像ファイル読み込み（自動圧縮）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);
      setDraftStickers([]); // リセット
      setIsMockMode(false);
    } catch (err) {
      console.error("画像圧縮エラー", err);
      setErrorMessage("画像の読み込みに失敗しました。別の写真をお試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  // サンプル画像で試す (テスト用)
  const handleLoadSample = () => {
    setImagePreview("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23FFE4E1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='24'>🍓 🍬 ⭐</text></svg>");
    setDraftStickers([]);
    setIsMockMode(false);
    setErrorMessage(null);
  };

  // Gemini AI 認識リクエスト
  const handleAnalyzeImage = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/stickers/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (data.isMock) {
        setIsMockMode(true);
      }

      if (data.stickers && Array.isArray(data.stickers)) {
        const formatted: DraftSticker[] = data.stickers.map((s: {
          name_candidate?: string;
          series_candidate?: string;
          motif?: string;
          primary_color?: string;
          finish_type?: string;
          estimated_count?: number;
        }, idx: number) => ({
          id: `draft-${Date.now()}-${idx}`,
          name: s.name_candidate || "ぷっくりシール",
          series: s.series_candidate || "スイートコレクション",
          motif: (s.motif as MotifType) || "スイーツ",
          color: s.primary_color || "#FF69B4",
          finishType: (s.finish_type as FinishType) || "クリアドロップ",
          quantity: s.estimated_count || 1,
        }));
        setDraftStickers(formatted);
      } else {
        setErrorMessage("シールを検出できませんでした。手動でシールを追加できます。");
      }
    } catch (err) {
      console.error("Failed to analyze image", err);
      setErrorMessage("通信に失敗しました。ネットワーク状況をご確認ください。");
    } finally {
      setIsLoading(false);
    }
  };

  // ドラフトの削除（ゴミ箱）
  const removeDraft = (id: string) => {
    setDraftStickers((prev) => prev.filter((s) => s.id !== id));
  };

  // 手動でシール枠を追加
  const addManualDraft = () => {
    const newDraft: DraftSticker = {
      id: `draft-${Date.now()}`,
      name: "あたらしシール",
      series: "マイコレクション",
      motif: "スイーツ",
      color: "#FFB6C1",
      finishType: "クリアドロップ",
      quantity: 1,
    };
    setDraftStickers((prev) => [...prev, newDraft]);
  };

  // ドラフトの数量調整
  const updateDraftQuantity = (id: string, delta: number) => {
    setDraftStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
      )
    );
  };

  // ドラフトの名前編集
  const updateDraftName = (id: string, name: string) => {
    setDraftStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // ドラフトのモチーフ編集
  const updateDraftMotif = (id: string, motif: MotifType) => {
    setDraftStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, motif } : s))
    );
  };

  // シール帳へ登録確定 (サムネイル軽量化で保存)
  const handleSaveAll = async () => {
    let photoThumbnail: string | undefined = undefined;
    if (imagePreview) {
      try {
        photoThumbnail = await generateThumbnailFromBase64(imagePreview, 240, 0.6);
      } catch {
        photoThumbnail = imagePreview;
      }
    }

    draftStickers.forEach((draft) => {
      addStickerFromDraft({
        name: draft.name,
        series: draft.series,
        motif: draft.motif,
        color: draft.color,
        finishType: draft.finishType,
        quantity: draft.quantity,
        userPhotoUrl: photoThumbnail,
      });
    });
    setIsDone(true);
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <header className="px-5 py-4 bg-white/80 border-b border-pink-100 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-500 hover:text-pink-600 font-bold text-xs"
        >
          <ArrowLeft size={16} />
          <span>シール帳へもどる</span>
        </Link>
        <h2 className="text-sm font-black text-slate-800">シールの撮影・登録</h2>
        <div className="w-16" />
      </header>

      <div className="p-5 flex flex-col gap-5">
        {/* カメラ・ファイル選択エリア */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {!imagePreview ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-pink-50/60 to-white rounded-3xl border-2 border-dashed border-pink-200 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-100/80 flex items-center justify-center text-pink-500 mb-3 shadow-inner">
              <Camera size={28} />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              ボンボンドロップシールの写真を撮影
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              買ったシールやシール帳のページを撮影すると、AIがシールを自動認識します
            </p>

            <div className="flex gap-2.5 mt-5 w-full max-w-xs">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs rounded-2xl shadow-md hover:opacity-95 flex items-center justify-center gap-1.5 transition"
              >
                <Camera size={16} />
                <span>カメラを起動</span>
              </button>
              <button
                onClick={handleLoadSample}
                className="px-3.5 py-3 bg-white border border-pink-200 text-pink-600 font-bold text-xs rounded-2xl shadow-2xs hover:bg-pink-50 transition"
              >
                デモ写真
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* プレビュー表示 */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-pink-200 bg-black/5 max-h-56 flex items-center justify-center">
                {/* Optimized image using next/image */}
                <NextImage
                  src={imagePreview}
                  alt="撮影プレビュー"
                  width={240}
                  height={240}
                  className="w-full h-auto max-h-56 object-contain"
                  priority={false}
                />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setDraftStickers([]);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
              >
                撮り直す
              </button>
            </div>

            {/* エラーメッセージ表示 */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-600 text-xs">
                <Info size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* AI解析ボタン */}
            {draftStickers.length === 0 && (
              <button
                onClick={handleAnalyzeImage}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 text-white font-black text-sm rounded-2xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Gemini AIがシールを鑑定中...✨</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Gemini AIでシールを認識する</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* 認識結果ドラフトリスト (ユーザー修正UI) */}
        {draftStickers.length > 0 && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* モックモード明示バッジ */}
            {isMockMode && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-700 text-[11px] font-bold">
                <Info size={15} className="shrink-0 text-amber-500" />
                <span>💡 デモモード動作中（Gemini APIキー未設定のためサンプル認識結果を表示しています）</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Sparkles size={14} className="text-pink-500" />
                認識されたシール ({draftStickers.length}件)
              </span>
              <span className="text-[10px] text-slate-400">
                名前・枚数修正や不要なシールの削除ができます
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {draftStickers.map((draft) => (
                <div
                  key={draft.id}
                  className="p-3 bg-white rounded-2xl border border-pink-100 shadow-2xs flex items-center justify-between gap-2.5"
                >
                  {/* シールアイコン */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                    style={{ backgroundColor: draft.color }}
                  >
                    {draft.motif === "スイーツ" && "🍓"}
                    {draft.motif === "動物" && "🐰"}
                    {draft.motif === "星" && "⭐"}
                    {draft.motif === "ハート" && "💖"}
                    {draft.motif === "フラワー" && "🌸"}
                    {draft.motif === "ジュエリー" && "💎"}
                    {draft.motif === "キャラクター" && "✨"}
                    {draft.motif === "その他" && "🍬"}
                  </div>

                  {/* 編集フォーム */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => updateDraftName(draft.id, e.target.value)}
                      className="text-xs font-bold text-slate-800 border-b border-pink-200 focus:border-pink-500 outline-none pb-0.5 bg-transparent"
                    />
                    <div className="flex gap-1.5 items-center">
                      <select
                        value={draft.motif}
                        onChange={(e) => updateDraftMotif(draft.id, e.target.value as MotifType)}
                        className="text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200 outline-none"
                      >
                        <option value="スイーツ">🍓 スイーツ</option>
                        <option value="動物">🐰 動物</option>
                        <option value="星">⭐ 星</option>
                        <option value="ハート">💖 ハート</option>
                        <option value="フラワー">🌸 フラワー</option>
                        <option value="ジュエリー">💎 ジュエリー</option>
                        <option value="キャラクター">✨ キャラ</option>
                        <option value="その他">🍬 その他</option>
                      </select>
                      <span className="text-[10px] text-slate-400">
                        {draft.finishType}
                      </span>
                    </div>
                  </div>

                  {/* 数量カウンター */}
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-xl shrink-0">
                    <button
                      onClick={() => updateDraftQuantity(draft.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-black text-pink-600 min-w-3 text-center">
                      {draft.quantity}
                    </span>
                    <button
                      onClick={() => updateDraftQuantity(draft.id, 1)}
                      className="w-6 h-6 rounded-lg bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition active:scale-95"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* 削除（ゴミ箱）ボタン */}
                  <button
                    onClick={() => removeDraft(draft.id)}
                    title="このシールを削除"
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* 手動追加ボタン */}
            <button
              onClick={addManualDraft}
              className="py-2.5 px-3 border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-50 text-pink-600 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={15} />
              <span>シールを手動で追加する</span>
            </button>

            {/* 一括保存ボタン */}
            <button
              onClick={handleSaveAll}
              disabled={isDone}
              className={`w-full mt-2 py-3.5 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:opacity-95"
              }`}
            >
              {isDone ? (
                <>
                  <Check size={18} />
                  <span>シール帳に保存しました！</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>シール帳に登録する ({draftStickers.length}件)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
