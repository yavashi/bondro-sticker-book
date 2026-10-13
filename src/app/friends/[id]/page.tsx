"use client";

import React, { useState, use } from "react";
import { useStickers } from "@/context/StickerContext";
import StickerCard from "@/components/StickerCard";
import StickerDetailModal from "@/components/StickerDetailModal";
import { UserSticker } from "@/types";
import { ArrowLeft, Gift, Repeat, Sparkles } from "lucide-react";
import Link from "next/link";
import { findGiftableStickers, calculateTradeMatch } from "@/lib/matcher";

export default function FriendStickerBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { myProfile, friends, sendGift } = useStickers();
  const [selectedSticker, setSelectedSticker] = useState<UserSticker | null>(
    null
  );
  const [giftTargetSticker, setGiftTargetSticker] = useState<UserSticker | null>(
    null
  );
  const [giftMessageText, setGiftMessageText] = useState(
    "いつもありがとう！持っていないシールをプレゼントするね🎁✨"
  );
  const [giftSentSuccess, setGiftSentSuccess] = useState(false);

  const friend = friends.find((f) => f.id === resolvedParams.id);

  if (!friend) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-sm font-bold text-slate-600">
          フレンドが見つかりませんでした
        </p>
        <Link
          href="/friends"
          className="mt-4 text-xs font-bold text-pink-600 bg-pink-50 px-4 py-2 rounded-xl"
        >
          フレンド一覧へもどる
        </Link>
      </div>
    );
  }

  // プレゼント可能シール (自分がダブっていて、相手が未所持)
  const giftableStickers = findGiftableStickers(myProfile, friend);
  // 交換可能マッチング
  const tradeMatch = calculateTradeMatch(myProfile, friend);

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <header className="px-5 pt-5 pb-4 bg-gradient-to-b from-pink-100/70 to-pink-50/40 border-b border-pink-100">
        <Link
          href="/friends"
          className="flex items-center gap-1 text-slate-500 hover:text-pink-600 font-bold text-xs mb-3"
        >
          <ArrowLeft size={16} />
          <span>フレンド一覧へ</span>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-pink-200 flex items-center justify-center text-2xl">
              {friend.avatarUrl}
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800">
                {friend.username}のシール帳
              </h1>
              <span className="text-[11px] text-slate-400">
                ID: {friend.friendCode}
              </span>
            </div>
          </div>

          {tradeMatch.isMutualMatch && (
            <Link
              href="/trade"
              className="bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-2xl shadow-sm hover:bg-emerald-600 transition flex items-center gap-1"
            >
              <Repeat size={13} />
              <span>交換を見る</span>
            </Link>
          )}
        </div>
      </header>

      {/* プレゼント支援 (Gift Finder) ハイライトバナー */}
      {giftableStickers.length > 0 && (
        <section className="mx-4 mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl border border-rose-200 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Gift size={13} />
            </div>
            <div>
              <h2 className="text-xs font-black text-rose-700">
                プレゼントできるシール ({giftableStickers.length}件)
              </h2>
              <span className="text-[10px] text-rose-500 font-bold block">
                リアル（手渡し・郵送）での受け渡しサポート
              </span>
            </div>
          </div>
          <p className="text-[11px] text-rose-600/90 leading-relaxed mb-3">
            あなたがダブって持っていて、{friend.username} がまだ持っていないシールです！「これプレゼントできるよ！」と伝えるメッセージカードを送れます✨
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {giftableStickers.map(({ userSticker, isWishlistMatch }) => (
              <div
                key={userSticker.id}
                onClick={() => setSelectedSticker(userSticker)}
                className={`p-2.5 rounded-2xl border shadow-2xs hover:shadow-sm cursor-pointer flex flex-col gap-1.5 relative overflow-hidden transition-all ${
                  isWishlistMatch
                    ? "bg-gradient-to-br from-rose-50 to-pink-100/80 border-rose-400 ring-2 ring-rose-300/60"
                    : "bg-white border-rose-200"
                }`}
              >
                {/* 相手のWishlist一致バッジ */}
                {isWishlistMatch && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-0.5 animate-pulse">
                    <Sparkles size={9} />
                    <span>相手の欲しいもの！</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner shrink-0"
                    style={{ backgroundColor: userSticker.sticker.color }}
                  >
                    {userSticker.sticker.motif === "スイーツ" && "🍓"}
                    {userSticker.sticker.motif === "動物" && "🐰"}
                    {userSticker.sticker.motif === "星" && "⭐"}
                    {userSticker.sticker.motif === "ハート" && "💖"}
                    {userSticker.sticker.motif === "フラワー" && "🌸"}
                    {userSticker.sticker.motif === "その他" && "🍬"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-bold text-slate-800 truncate">
                      {userSticker.sticker.name}
                    </h4>
                    <span className="text-[9px] text-rose-500 font-bold block">
                      あなたの余り: {userSticker.quantity}枚
                    </span>
                  </div>
                </div>

                {/* プレゼントの気持ちを伝えるボタン */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGiftTargetSticker(userSticker);
                  }}
                  className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-[10px] rounded-xl shadow-2xs flex items-center justify-center gap-1 transition"
                >
                  <Gift size={11} />
                  <span>プレゼントを提案 🎁</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ギフト送信モーダル */}
      {giftTargetSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full border border-pink-200 shadow-2xl flex flex-col items-center">
            <span className="text-3xl mb-1">🎁💌</span>
            <h3 className="text-sm font-black text-slate-800">
              {friend.username} にプレゼントのお便り
            </h3>
            <p className="text-[11px] text-slate-500 text-center mt-0.5">
              あなたの「{giftTargetSticker.sticker.name}」を渡せることを伝えます
            </p>

            {giftSentSuccess ? (
              <div className="my-6 text-center animate-fade-in">
                <span className="text-4xl">💌🎉</span>
                <p className="text-xs font-black text-emerald-600 mt-2">
                  プレゼントメッセージを送信しました！
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  実際に手渡し・郵送して受け取ってもらいましょう✨
                </p>
              </div>
            ) : (
              <div className="w-full mt-4 flex flex-col gap-3">
                <div className="p-2.5 bg-pink-50/60 rounded-2xl border border-pink-200 text-[10px] text-slate-600 leading-snug">
                  💡 <strong>現実の受け渡しサポート:</strong><br />
                  「会ったときに渡すね！」「郵送するよ！」などの約束メッセージを送れます。
                </div>

                <label className="text-[10px] font-bold text-slate-500 block">
                  お友達へのメッセージ:
                </label>
                <textarea
                  value={giftMessageText}
                  onChange={(e) => setGiftMessageText(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs bg-pink-50/50 border border-pink-200 rounded-2xl outline-none focus:border-pink-500 resize-none font-medium"
                />

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setGiftTargetSticker(null)}
                    className="flex-1 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-200"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      sendGift(
                        friend.id,
                        giftTargetSticker.stickerMasterId,
                        giftMessageText
                      );
                      setGiftSentSuccess(true);
                      setTimeout(() => {
                        setGiftSentSuccess(false);
                        setGiftTargetSticker(null);
                      }, 1800);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black rounded-xl shadow-sm hover:opacity-95"
                  >
                    メッセージを送る 💌
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* フレンドの所持シール一覧 */}
      <section className="flex-1 p-4 sticker-book-pattern">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1">
            <Sparkles size={14} className="text-pink-500" />
            {friend.username}のコレクション ({friend.stickers.length}種)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {friend.stickers.map((userSticker) => (
            <StickerCard
              key={userSticker.id}
              userSticker={userSticker}
              onClick={() => setSelectedSticker(userSticker)}
            />
          ))}
        </div>
      </section>

      {/* 詳細モーダル (閲覧専用) */}
      <StickerDetailModal
        userSticker={selectedSticker}
        onClose={() => setSelectedSticker(null)}
        isReadOnly={true}
      />
    </div>
  );
}
