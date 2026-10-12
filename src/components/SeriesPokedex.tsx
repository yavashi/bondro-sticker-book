"use client";

import React, { useState } from "react";
import { StickerMaster, UserProfile, UserSticker } from "@/types";
import { Sparkles, Trophy, Users, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";

interface SeriesPokedexProps {
  masters: StickerMaster[];
  myStickers: UserSticker[];
  friends: UserProfile[];
}

export default function SeriesPokedex({
  masters,
  myStickers,
  friends,
}: SeriesPokedexProps) {
  const [selectedMissingMaster, setSelectedMissingMaster] =
    useState<StickerMaster | null>(null);

  // シリーズ名でグループ化
  const seriesGroups = masters.reduce((acc, master) => {
    const sName = master.seriesName || "その他";
    if (!acc[sName]) acc[sName] = [];
    acc[sName].push(master);
    return acc;
  }, {} as Record<string, StickerMaster[]>);

  const myOwnedMasterIds = new Set(
    myStickers.filter((s) => s.quantity > 0).map((s) => s.stickerMasterId)
  );

  // 特定のマスターシールを持っているフレンドを検索
  const findFriendsWithSticker = (masterId: string) => {
    return friends.filter((f) =>
      f.stickers.some((s) => s.stickerMasterId === masterId && s.quantity > 0)
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(seriesGroups).map(([seriesName, stickerList]) => {
        const totalCount = stickerList.length;
        const ownedCount = stickerList.filter((m) =>
          myOwnedMasterIds.has(m.id)
        ).length;
        const progressPercent = Math.round((ownedCount / totalCount) * 100);
        const isComplete = ownedCount === totalCount;

        return (
          <div
            key={seriesName}
            className={`p-4 rounded-3xl border transition-all ${
              isComplete
                ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-pink-50 border-amber-300 shadow-sm"
                : "bg-white/90 border-pink-100 shadow-2xs"
            }`}
          >
            {/* シリーズヘッダー & プログレスバー */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">
                  {seriesName}
                </span>
                {isComplete && (
                  <span className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                    <Trophy size={10} />
                    コンプリート！🎉
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-pink-600">
                {ownedCount}/{totalCount}種 ({progressPercent}%)
              </span>
            </div>

            {/* 進捗プログレスバー */}
            <div className="w-full h-2.5 bg-pink-100 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete
                    ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                    : "bg-gradient-to-r from-pink-400 to-rose-400"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* シール一覧グリッド */}
            <div className="grid grid-cols-3 gap-2.5">
              {stickerList.map((master) => {
                const isOwned = myOwnedMasterIds.has(master.id);
                const userSticker = myStickers.find(
                  (s) => s.stickerMasterId === master.id
                );
                const hasDuplicate = userSticker && userSticker.quantity >= 2;

                return (
                  <div
                    key={master.id}
                    onClick={() => !isOwned && setSelectedMissingMaster(master)}
                    className={`relative p-2 rounded-2xl flex flex-col items-center text-center transition-all ${
                      isOwned
                        ? "bg-pink-50/50 border border-pink-200"
                        : "bg-slate-50 border border-dashed border-slate-300 cursor-pointer hover:bg-pink-50/30"
                    }`}
                  >
                    {/* 所持バッジ */}
                    {isOwned ? (
                      <div className="absolute top-1.5 right-1.5 text-emerald-500">
                        <CheckCircle2 size={13} />
                      </div>
                    ) : (
                      <div className="absolute top-1.5 right-1.5 text-slate-300">
                        <HelpCircle size={13} />
                      </div>
                    )}

                    {/* シールアイコン */}
                    <div className="w-12 h-12 my-1 flex items-center justify-center">
                      {isOwned ? (
                        <div
                          className="sticker-drop w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm p-1 overflow-hidden"
                          style={{ backgroundColor: master.color }}
                        >
                          <div className="sticker-shine pointer-events-none" />
                          {userSticker?.userPhotoUrl ? (
                            <img
                              src={userSticker.userPhotoUrl}
                              alt={master.name}
                              className="w-full h-full object-contain filter drop-shadow-sm rounded-xl"
                            />
                          ) : (
                            <span>
                              {master.motif === "スイーツ" && "🍓"}
                              {master.motif === "動物" && "🐰"}
                              {master.motif === "星" && "⭐"}
                              {master.motif === "ハート" && "💖"}
                              {master.motif === "フラワー" && "🌸"}
                              {master.motif === "その他" && "🍬"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-slate-200/80 flex items-center justify-center text-slate-400 text-lg">
                          ？
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold truncate max-w-full mt-0.5 ${
                        isOwned ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {master.code ? `${master.code} ${master.name}` : master.name}
                    </span>

                    {/* 未所持時のヒント */}
                    {!isOwned && (
                      <span className="text-[8px] text-pink-500 font-bold mt-0.5">
                        持ってる友達を探す
                      </span>
                    )}

                    {hasDuplicate && (
                      <span className="text-[8px] font-bold text-rose-500 bg-rose-50 px-1 rounded-full mt-0.5">
                        余り {userSticker.quantity}枚
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 未所持シール逆引きモーダル */}
      {selectedMissingMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full border border-pink-200 shadow-2xl flex flex-col items-center">
            <span className="text-3xl mb-1">🔍</span>
            <h3 className="text-sm font-black text-slate-800">
              {selectedMissingMaster.name} のコンプ支援
            </h3>
            <p className="text-[11px] text-slate-500 text-center mt-1">
              このシールを持っているフレンドを探しました！
            </p>

            <div className="w-full mt-4 flex flex-col gap-2">
              {findFriendsWithSticker(selectedMissingMaster.id).length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs">
                  まだ持っているフレンドはいません 😢
                </div>
              ) : (
                findFriendsWithSticker(selectedMissingMaster.id).map((friend) => {
                  const friendSticker = friend.stickers.find(
                    (s) => s.stickerMasterId === selectedMissingMaster.id
                  );
                  const isDuplicate = friendSticker && friendSticker.quantity >= 2;

                  return (
                    <div
                      key={friend.id}
                      className="p-2.5 bg-pink-50/70 rounded-2xl border border-pink-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{friend.avatarUrl}</span>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {friend.username}
                          </span>
                          <span className="text-[9px] text-pink-600 font-bold">
                            {isDuplicate ? "★ダブりあり！交換チャンス" : "所持中 (1枚)"}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/friends/${friend.id}`}
                        className="text-[10px] font-bold text-white bg-pink-500 px-2.5 py-1 rounded-xl shadow-2xs hover:bg-pink-600"
                      >
                        シール帳へ
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setSelectedMissingMaster(null)}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
