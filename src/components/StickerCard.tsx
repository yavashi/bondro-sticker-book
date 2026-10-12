"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserSticker } from "@/types";
import { Sparkles, Repeat } from "lucide-react";

interface StickerCardProps {
  userSticker: UserSticker;
  onClick: () => void;
  showTradeBadge?: boolean;
}

export default function StickerCard({
  userSticker,
  onClick,
  showTradeBadge = true,
}: StickerCardProps) {
  const { sticker, quantity, isTradeable } = userSticker;
  const isDuplicate = quantity >= 2;

  // 質感ごとのエフェクトクラス
  const getFinishEffect = (finish: string) => {
    switch (finish) {
      case "ラメ入り":
        return "after:absolute after:inset-0 after:bg-[radial-gradient(#fff_1px,transparent_1px)] after:bg-[size:8px_8px] after:opacity-60";
      case "オーロラ":
        return "bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300";
      case "パール":
        return "bg-gradient-to-r from-pink-100 via-white to-pink-200";
      case "クリアドロップ":
      default:
        return "";
    }
  };

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      className="group relative flex flex-col items-center p-3 rounded-2xl bg-white/80 hover:bg-white border border-pink-100/80 shadow-sm hover:shadow-md cursor-pointer"
    >
      {/* ダブりバッジ */}
      {isDuplicate && (
        <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-0.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce-subtle">
          <Sparkles size={11} className="fill-white" />
          <span>×{quantity}</span>
        </div>
      )}

      {/* 交換可能バッジ */}
      {showTradeBadge && isTradeable && (
        <div className="absolute -top-1.5 -left-1.5 z-10 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5">
          <Repeat size={10} />
          <span>交換OK</span>
        </div>
      )}

      {/* 実物写真ありバッジ */}
      {userSticker.userPhotoUrl && (
        <div className="absolute bottom-1 right-1 z-10 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm backdrop-blur-sm flex items-center gap-0.5">
          <span>📷 実写</span>
        </div>
      )}

      {/* ぷっくりシール本体 */}
      <div className="relative w-20 h-20 my-2 flex items-center justify-center">
        <div
          className={`sticker-drop w-full h-full flex items-center justify-center rounded-3xl ${getFinishEffect(
            sticker.finishType
          )}`}
          style={{
            backgroundColor: sticker.color || "#FFB6C1",
          }}
        >
          {/* 反射光ハイライト */}
          <div className="sticker-shine pointer-events-none" />

          {/* 実写画像 または モチーフアイコン */}
          {userSticker.userPhotoUrl ? (
            <div className="relative z-10 w-full h-full p-2 flex items-center justify-center">
              <img
                src={userSticker.userPhotoUrl}
                alt={sticker.name}
                className="w-full h-full object-contain filter drop-shadow-md transform group-hover:scale-110 transition-transform duration-200 rounded-2xl"
              />
            </div>
          ) : (
            <span className="text-3xl filter drop-shadow-sm select-none transform group-hover:scale-110 transition-transform duration-200">
              {sticker.motif === "スイーツ" && "🍓"}
              {sticker.motif === "動物" && "🐰"}
              {sticker.motif === "星" && "⭐"}
              {sticker.motif === "ハート" && "💖"}
              {sticker.motif === "フラワー" && "🌸"}
              {sticker.motif === "ジュエリー" && "💎"}
              {sticker.motif === "キャラクター" && "✨"}
              {sticker.motif === "その他" && "🍬"}
            </span>
          )}
        </div>
      </div>

      {/* シール名 & カタログコード */}
      <div className="w-full text-center mt-1">
        <div className="flex items-center justify-center gap-1">
          {sticker.code && (
            <span className="text-[9px] font-black bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded shrink-0">
              {sticker.code}
            </span>
          )}
          <h4 className="text-xs font-bold text-slate-800 truncate">
            {sticker.name}
          </h4>
        </div>
        <span className="text-[10px] text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
          {sticker.finishType}
        </span>
      </div>
    </motion.div>
  );
}
