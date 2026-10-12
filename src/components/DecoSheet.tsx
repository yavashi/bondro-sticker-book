"use client";

import React, { useState, useRef } from "react";
import { UserSticker } from "@/types";
import { Sparkles, Trash2, RotateCcw, Download, Share2, Check } from "lucide-react";
import { sounds } from "@/lib/sound";

interface PlacedSticker {
  id: string;
  userSticker: UserSticker;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface DecoSheetProps {
  myStickers: UserSticker[];
}

export default function DecoSheet({ myStickers }: DecoSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([
    {
      id: "placed-init-1",
      userSticker: myStickers[0],
      x: 35,
      y: 25,
      rotation: -8,
      scale: 1,
    },
    {
      id: "placed-init-2",
      userSticker: myStickers[1] || myStickers[0],
      x: 65,
      y: 40,
      rotation: 12,
      scale: 1.1,
    },
  ]);

  const [selectedStickerToAdd, setSelectedStickerToAdd] =
    useState<UserSticker | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 台紙をタップしてシールを貼る (ペタッ！音つき)
  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedStickerToAdd) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlaced: PlacedSticker = {
      id: `placed-${Date.now()}`,
      userSticker: selectedStickerToAdd,
      x: Math.round(x),
      y: Math.round(y),
      rotation: Math.floor(Math.random() * 24) - 12,
      scale: 1,
    };

    sounds.playStick(); // タクタイル音再生！
    setPlacedStickers((prev) => [...prev, newPlaced]);
    setSelectedStickerToAdd(null);
  };

  // 貼ったシールを剥がす
  const handleRemovePlaced = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  // 全て剥がす
  const handleClear = () => {
    setPlacedStickers([]);
  };

  // Canvas描画による画像エクスポート (PNG保存)
  const handleExportImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 750;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 背景描画
    ctx.fillStyle = "#FFF5F7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ドットパターン
    ctx.fillStyle = "#FDE2E4";
    for (let x = 12; x < canvas.width; x += 24) {
      for (let y = 12; y < canvas.height; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // タイトル
    ctx.fillStyle = "#FF69B4";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ BonDrop Sticker Book Deco Sheet ✨", canvas.width / 2, 35);

    // 各シールの描画
    placedStickers.forEach((placed) => {
      const posX = (placed.x / 100) * canvas.width;
      const posY = (placed.y / 100) * canvas.height;
      const size = 70 * placed.scale;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((placed.rotation * Math.PI) / 180);

      // シールの円形ベース
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = placed.userSticker.sticker.color || "#FFB6C1";
      ctx.shadowColor = "rgba(255, 105, 180, 0.4)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fill();

      // 絵文字モチーフ
      ctx.shadowColor = "transparent";
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const motif = placed.userSticker.sticker.motif;
      let emoji = "🍬";
      if (motif === "スイーツ") emoji = "🍓";
      if (motif === "動物") emoji = "🐰";
      if (motif === "星") emoji = "⭐";
      if (motif === "ハート") emoji = "💖";
      if (motif === "フラワー") emoji = "🌸";

      ctx.fillText(emoji, 0, 2);
      ctx.restore();
    });

    // ダウンロードトリガー
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `bondro-deco-sheet-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setSavedSuccess(true);
    sounds.playSparkle();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // SNSシェア (Web Share API)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "わたしのボンドロシール帳デコシート ✨",
          text: `ボンボンドロップシールを${placedStickers.length}枚貼ってデコりました！一緒に交換しよ！🍬`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      handleExportImage();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 操作ガイド & シェアボタン */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-pink-600 flex items-center gap-1">
          <Sparkles size={12} />
          シールを選んでタップでペタッ！
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportImage}
            className="flex items-center gap-1 text-[10px] font-bold bg-white text-pink-600 px-2 py-1 rounded-xl border border-pink-200 shadow-2xs hover:bg-pink-50 transition"
          >
            {savedSuccess ? <Check size={11} className="text-emerald-500" /> : <Download size={11} />}
            <span>{savedSuccess ? "保存完了！" : "画像保存"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-[10px] font-bold bg-pink-500 text-white px-2 py-1 rounded-xl shadow-2xs hover:bg-pink-600 transition"
          >
            <Share2 size={11} />
            <span>シェア</span>
          </button>
        </div>
      </div>

      {/* 貼るシールのパレット (手持ちシール一覧) */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-pink-50/70 rounded-2xl border border-pink-100 no-scrollbar">
        {myStickers.map((s) => {
          const isSelected = selectedStickerToAdd?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStickerToAdd(isSelected ? null : s)}
              className={`flex flex-col items-center p-1.5 rounded-xl border transition-all shrink-0 ${
                isSelected
                  ? "bg-pink-500 text-white border-pink-600 scale-105 shadow-md"
                  : "bg-white text-slate-700 border-pink-200 hover:bg-pink-100"
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-inner"
                style={{ backgroundColor: s.sticker.color }}
              >
                {s.sticker.motif === "スイーツ" && "🍓"}
                {s.sticker.motif === "動物" && "🐰"}
                {s.sticker.motif === "星" && "⭐"}
                {s.sticker.motif === "ハート" && "💖"}
                {s.sticker.motif === "フラワー" && "🌸"}
                {s.sticker.motif === "その他" && "🍬"}
              </div>
              <span className="text-[9px] font-bold mt-1 truncate max-w-[50px]">
                {s.sticker.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* デコレーション台紙キャンバス */}
      <div
        ref={sheetRef}
        onClick={handleSheetClick}
        className={`relative w-full aspect-[4/5] rounded-3xl border-2 shadow-inner overflow-hidden cursor-crosshair transition-all ${
          selectedStickerToAdd
            ? "border-pink-400 ring-4 ring-pink-200 bg-pink-50/40"
            : "border-pink-200 bg-white"
        } sticker-book-pattern`}
      >
        {/* 台紙の可愛いヘッダー風装飾 */}
        <div className="absolute top-2 left-4 right-4 flex justify-between items-center opacity-40 pointer-events-none">
          <span className="text-[10px] font-black tracking-widest text-pink-400 uppercase">
            BonDrop My Collection Deco Sheet
          </span>
          <span className="text-xs">✨🍬</span>
        </div>

        {/* 貼られたシールたち */}
        {placedStickers.map((placed) => (
          <div
            key={placed.id}
            onClick={(e) => handleRemovePlaced(placed.id, e)}
            style={{
              left: `${placed.x}%`,
              top: `${placed.y}%`,
              transform: `translate(-50%, -50%) rotate(${placed.rotation}deg) scale(${placed.scale})`,
            }}
            className="group absolute cursor-pointer hover:scale-125 transition-transform duration-200"
          >
            <div
              className="sticker-drop w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg"
              style={{ backgroundColor: placed.userSticker.sticker.color }}
            >
              <div className="sticker-shine" />
              <span className="text-2xl filter drop-shadow select-none">
                {placed.userSticker.sticker.motif === "スイーツ" && "🍓"}
                {placed.userSticker.sticker.motif === "動物" && "🐰"}
                {placed.userSticker.sticker.motif === "星" && "⭐"}
                {placed.userSticker.sticker.motif === "ハート" && "💖"}
                {placed.userSticker.sticker.motif === "フラワー" && "🌸"}
                {placed.userSticker.sticker.motif === "その他" && "🍬"}
              </span>

              {/* ホバー時の剥がすアイコン */}
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-1 rounded-full shadow-md transition-opacity">
                <Trash2 size={10} />
              </div>
            </div>
          </div>
        ))}

        {placedStickers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none select-none">
            <span className="text-3xl mb-1">📖✨</span>
            <span className="text-xs font-bold">まっさらなシール台紙</span>
            <span className="text-[10px]">上のパレットからシールを選んでタップして貼ってね</span>
          </div>
        )}
      </div>

      {placedStickers.length > 0 && (
        <div className="flex justify-end px-1">
          <button
            onClick={handleClear}
            className="text-[10px] text-slate-400 hover:text-rose-500 font-bold flex items-center gap-0.5"
          >
            <RotateCcw size={10} />
            <span>台紙のシールをぜんぶはがす</span>
          </button>
        </div>
      )}
    </div>
  );
}
