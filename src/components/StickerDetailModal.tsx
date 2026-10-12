"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserSticker } from "@/types";
import { X, Plus, Minus, Repeat, Sparkles } from "lucide-react";
import Image from "next/image";
import { useStickers } from "@/context/StickerContext";

interface StickerDetailModalProps {
  userSticker: UserSticker | null;
  onClose: () => void;
  isReadOnly?: boolean;
}

export default function StickerDetailModal({
  userSticker,
  onClose,
  isReadOnly = false,
}: StickerDetailModalProps) {
  const { myProfile, updateStickerQuantity, toggleTradeable, toggleWishlist } = useStickers();

  if (!userSticker) return null;

  const { sticker, quantity, isTradeable } = userSticker;
  const isDuplicate = quantity >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 450 }}
        className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 flex flex-col items-center"
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        {/* ぷっくりシール拡大表示 */}
        <div className="relative w-28 h-28 my-3 flex items-center justify-center">
          {userSticker.userPhotoUrl ? (
            <div className="w-full h-full rounded-3xl overflow-hidden border-2 border-pink-200 shadow-md relative">
              <Image
                src={userSticker.userPhotoUrl}
                alt={sticker.name}
                width={112}
                height={112}
                unoptimized
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                撮影写真
              </span>
            </div>
          ) : (
            <div
              className="sticker-drop w-full h-full flex items-center justify-center rounded-3xl"
              style={{ backgroundColor: sticker.color || "#FFB6C1" }}
            >
              <div className="sticker-shine" />
              <span className="text-5xl filter drop-shadow select-none">
                {sticker.motif === "スイーツ" && "🍓"}
                {sticker.motif === "動物" && "🐰"}
                {sticker.motif === "星" && "⭐"}
                {sticker.motif === "ハート" && "💖"}
                {sticker.motif === "フラワー" && "🌸"}
                {sticker.motif === "ジュエリー" && "💎"}
                {sticker.motif === "キャラクター" && "✨"}
                {sticker.motif === "その他" && "🍬"}
              </span>
            </div>
          )}
        </div>

        {/* シール情報 */}
        <div className="text-center mt-2 w-full">
          <span className="text-xs text-pink-500 font-semibold bg-pink-50 px-2.5 py-1 rounded-full">
            {sticker.seriesName}
          </span>
          <h3 className="text-lg font-black text-slate-800 mt-2">
            {sticker.name}
          </h3>
          <div className="flex justify-center gap-2 mt-2 text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
              質感: {sticker.finishType}
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
              モチーフ: {sticker.motif}
            </span>
          </div>
        </div>

        {/* 所持数変更 & 交換設定 */}
        {!isReadOnly && (
          <div className="w-full mt-6 pt-4 border-t border-slate-100 flex flex-col gap-4">
            {/* 数量カウンター */}
            <div className="flex items-center justify-between bg-pink-50/60 p-2 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 ml-2">
                持っている枚数
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateStickerQuantity(sticker.id, -1)}
                  className="w-8 h-8 rounded-full bg-white shadow-sm border border-pink-200 flex items-center justify-center text-pink-600 hover:bg-pink-100 active:scale-95 transition"
                >
                  <Minus size={16} />
                </button>
                <span className="font-black text-base text-pink-600 min-w-4 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateStickerQuantity(sticker.id, 1)}
                  className="w-8 h-8 rounded-full bg-pink-500 shadow-sm flex items-center justify-center text-white hover:bg-pink-600 active:scale-95 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ダブり・トレード可能トグル */}
            <div className="flex items-center justify-between px-1">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Repeat size={14} className="text-pink-500" />
                  フレンドと交換OK
                </span>
                <span className="text-[10px] text-slate-400">
                  {isDuplicate
                    ? "ダブっているので交換・譲渡候補になります"
                    : "1枚だけ持っている状態です"}
                </span>
              </div>
              <button
                onClick={() => toggleTradeable(sticker.id)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isTradeable ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isTradeable ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* 欲しいものリスト (Wishlist) トグルボタン */}
        <button
          onClick={() => toggleWishlist(sticker.id)}
          className={`w-full mt-3 py-2 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            (myProfile.wishlistMasterIds || []).includes(sticker.id)
              ? "bg-rose-50 border-rose-300 text-rose-600"
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Sparkles
            size={13}
            className={
              (myProfile.wishlistMasterIds || []).includes(sticker.id)
                ? "fill-rose-500 text-rose-500"
                : "text-slate-400"
            }
          />
          <span>
            {(myProfile.wishlistMasterIds || []).includes(sticker.id)
              ? "★ 欲しいものリストに登録中"
              : "欲しいものリストに追加"}
          </span>
        </button>

        {isReadOnly && (
          <div className="w-full mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs font-bold text-slate-600">
              相手の所持数: {quantity}枚
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold text-sm rounded-2xl shadow-md hover:opacity-95 transition"
        >
          とじる
        </button>
      </motion.div>
    </div>
  );
}
