"use client";

import React, { useState } from "react";
import { useStickers } from "@/context/StickerContext";
import StickerCard from "@/components/StickerCard";
import StickerDetailModal from "@/components/StickerDetailModal";
import DecoSheet from "@/components/DecoSheet";
import SeriesPokedex from "@/components/SeriesPokedex";
import ProfileEditModal from "@/components/ProfileEditModal";
import { UserSticker } from "@/types";
import { Sparkles, Repeat, Camera, Copy, Check, LayoutGrid, Palette, BookMarked, Gift, Settings, ArrowUpDown, Volume2, VolumeX, UserPen } from "lucide-react";
import Link from "next/link";
import { sounds } from "@/lib/sound";

export default function StickerBookPage() {
  const { myProfile, friends, masters, giftMessages, openGift } = useStickers();
  const [selectedSticker, setSelectedSticker] = useState<UserSticker | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEW" | "QTY" | "NAME">("QTY");
  const [viewMode, setViewMode] = useState<"GRID" | "DECO" | "POKEDEX">("GRID");
  const [copied, setCopied] = useState(false);
  const [showGiftBox, setShowGiftBox] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playStick();
    }
  };

  // 未開封のプレゼント
  const unreadGifts = giftMessages.filter(
    (g) => g.receiverId === myProfile.id && g.status === "UNOPENED"
  );

  // ダブり総数
  const duplicateCount = myProfile.stickers.filter(
    (s) => s.quantity >= 2
  ).length;
  // 交換可能数
  const tradeableCount = myProfile.stickers.filter(
    (s) => s.quantity >= 2 && s.isTradeable
  ).length;

  // フィルタリング & ソート処理
  const filteredStickers = myProfile.stickers
    .filter((s) => {
      if (activeFilter === "DUPLICATES") return s.quantity >= 2;
      if (activeFilter === "TRADEABLE") return s.isTradeable;
      if (activeFilter === "SWEETS") return s.sticker.motif === "スイーツ";
      if (activeFilter === "ANIMAL") return s.sticker.motif === "動物";
      if (activeFilter === "STAR_HEART")
        return s.sticker.motif === "星" || s.sticker.motif === "ハート";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "QTY") return b.quantity - a.quantity;
      if (sortBy === "NAME") return a.sticker.name.localeCompare(b.sticker.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myProfile.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ユーザープロファイル & ステータスヘッダー */}
      <header className="px-4 pt-5 pb-3 bg-gradient-to-b from-pink-100/70 to-pink-50/40 border-b border-pink-100">
        <div className="flex items-center justify-between gap-2">
          {/* 左側: プロフィールアイコン ＆ お名前 */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsProfileEditOpen(true)}
              className="relative group cursor-pointer focus:outline-none shrink-0"
              title="プロフィールを変更"
            >
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-pink-200 flex items-center justify-center text-2xl select-none group-hover:scale-105 transition-transform">
                {myProfile.avatarUrl}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-0.5 rounded-full shadow-xs text-xs">
                <UserPen size={10} />
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="text-sm font-black text-slate-800 truncate">
                  {myProfile.username}のシール帳
                </h1>
                <button
                  type="button"
                  onClick={() => setIsProfileEditOpen(true)}
                  className="text-pink-400 hover:text-pink-600 transition p-0.5 shrink-0"
                  title="プロフィールを変更"
                >
                  <UserPen size={12} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-white/90 px-2 py-0.5 rounded-full border border-pink-200 shadow-2xs hover:bg-white transition max-w-full"
                  title="クリックしてフレンドコードをコピー"
                >
                  <span className="font-mono tracking-tight truncate">ID: {myProfile.friendCode}</span>
                  {copied ? <Check size={10} className="shrink-0 text-emerald-500" /> : <Copy size={10} className="shrink-0" />}
                </button>
              </div>
            </div>
          </div>

          {/* 右側: ツールボタン群 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* サウンドON/OFFボタン */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 bg-white rounded-xl border border-pink-200 text-slate-500 shadow-2xs hover:text-pink-600 hover:bg-pink-50 transition"
              title={isMuted ? "音を出す" : "ミュート"}
            >
              {isMuted ? <VolumeX size={15} className="text-slate-400" /> : <Volume2 size={15} className="text-pink-500" />}
            </button>

            {/* プレゼントBOXボタン */}
            <button
              onClick={() => setShowGiftBox(true)}
              className="relative p-1.5 bg-white rounded-xl border border-pink-200 text-pink-500 shadow-2xs hover:bg-pink-50 transition"
              title="プレゼント・交換メモBOX"
            >
              <Gift size={15} />
              {unreadGifts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-sm">
                  {unreadGifts.length}
                </span>
              )}
            </button>

            {/* 設定ボタン */}
            <Link
              href="/settings"
              className="p-1.5 bg-white rounded-xl border border-pink-200 text-slate-500 shadow-2xs hover:text-pink-600 hover:bg-pink-50 transition"
              title="設定・データ管理"
            >
              <Settings size={15} />
            </Link>

            <Link
              href="/scan"
              className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-sm hover:opacity-95 transition"
            >
              <Camera size={13} />
              <span className="text-[11px]">撮影</span>
            </Link>
          </div>
        </div>

        {/* 表示モード切り替え (一覧 vs デコ台紙 vs 図鑑) */}
        <div className="flex bg-pink-100/60 p-1 rounded-2xl mt-4 border border-pink-200/60">
          <button
            onClick={() => setViewMode("GRID")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              viewMode === "GRID"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-pink-600"
            }`}
          >
            <LayoutGrid size={12} />
            <span>一覧</span>
          </button>
          <button
            onClick={() => setViewMode("DECO")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              viewMode === "DECO"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-pink-600"
            }`}
          >
            <Palette size={12} />
            <span>デコ台紙</span>
          </button>
          <button
            onClick={() => setViewMode("POKEDEX")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              viewMode === "POKEDEX"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-slate-500 hover:text-pink-600"
            }`}
          >
            <BookMarked size={12} />
            <span>図鑑コンプ</span>
          </button>
        </div>
      </header>

      {viewMode === "DECO" ? (
        <div className="flex-1 p-4">
          <DecoSheet myStickers={myProfile.stickers} />
        </div>
      ) : viewMode === "POKEDEX" ? (
        <div className="flex-1 p-4">
          <SeriesPokedex
            masters={masters}
            myStickers={myProfile.stickers}
            friends={friends}
          />
        </div>
      ) : (
        <>
          {/* 絞り込みタブ & 並び替えセレクター */}
          <div className="px-3 py-2 flex items-center justify-between gap-1 bg-white/40 border-b border-pink-100/50">
            <div className="overflow-x-auto flex gap-1 no-scrollbar flex-1">
              {[
                { id: "ALL", label: "ぜんぶ" },
                { id: "DUPLICATES", label: "✨ ダブり" },
                { id: "TRADEABLE", label: "🤝 交換OK" },
                { id: "SWEETS", label: "🍓 スイーツ" },
                { id: "ANIMAL", label: "🐰 動物" },
                { id: "STAR_HEART", label: "⭐ 星・ハート" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                    activeFilter === tab.id
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-white/80 text-slate-600 hover:bg-pink-100/50 border border-pink-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ソートセレクター */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-pink-200 shadow-2xs shrink-0">
              <ArrowUpDown size={11} className="text-pink-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="QTY">枚数順</option>
                <option value="NEW">新しい順</option>
                <option value="NAME">名前順</option>
              </select>
            </div>
          </div>

          {/* シール帳グリッド (ドットノート風背景) */}
          <div className="flex-1 p-4 sticker-book-pattern">
            {filteredStickers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">🍬</span>
                <p className="text-xs font-bold text-slate-600">
                  シールが見つかりませんでした
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  写真撮影から新しいボンボンドロップシールを登録してみよう！
                </p>
                <Link
                  href="/scan"
                  className="mt-4 px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-2xl shadow hover:bg-pink-600 transition"
                >
                  シールの写真を撮る
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredStickers.map((userSticker) => (
                  <StickerCard
                    key={userSticker.id}
                    userSticker={userSticker}
                    onClick={() => setSelectedSticker(userSticker)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 詳細モーダル */}
      <StickerDetailModal
        userSticker={selectedSticker}
        onClose={() => setSelectedSticker(null)}
      />

      {/* プレゼントBOXモーダル */}
      {showGiftBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full border border-pink-200 shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-2">
              <Gift size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-800">プレゼントBOX 🎁</h3>
            <p className="text-[11px] text-slate-400 text-center mt-0.5">
              お友達から贈られたシールが届いています
            </p>

            <div className="w-full mt-4 flex flex-col gap-2.5 max-h-60 overflow-y-auto">
              {giftMessages.filter((g) => g.receiverId === myProfile.id).length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs">
                  届いているプレゼントはありません 📭
                </div>
              ) : (
                giftMessages
                  .filter((g) => g.receiverId === myProfile.id)
                  .map((gift) => (
                    <div
                      key={gift.id}
                      className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                        gift.status === "UNOPENED"
                          ? "bg-rose-50/80 border-rose-300 ring-1 ring-rose-200"
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{gift.senderAvatar}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {gift.senderUsername}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {gift.status === "UNOPENED" ? "未開封" : "受け取り済み"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl italic">
                        &quot;{gift.message}&quot;
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-black text-pink-600 flex items-center gap-1">
                          🎁 {gift.stickerMaster.name}
                        </span>

                        {gift.status === "UNOPENED" ? (
                          <button
                            onClick={() => {
                              openGift(gift.id);
                              sounds.playSparkle();
                            }}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xs hover:opacity-95 transition"
                          >
                            受け取る ✨
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">
                            受取完了
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button
              onClick={() => setShowGiftBox(false)}
              className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition"
            >
              とじる
            </button>
          </div>
        </div>
      )}

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
      />
    </div>
  );
}
