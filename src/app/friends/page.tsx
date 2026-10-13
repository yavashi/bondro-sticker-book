"use client";

import React, { useState } from "react";
import { useStickers } from "@/context/StickerContext";
import { UserPlus, Copy, Check, ChevronRight, Gift, Repeat, QrCode, X } from "lucide-react";
import Link from "next/link";
import { findGiftableStickers, calculateTradeMatch } from "@/lib/matcher";

export default function FriendsPage() {
  const { myProfile, friends, addFriendByCode } = useStickers();
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [addMessage, setAddMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myProfile.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;

    const success = addFriendByCode(friendCodeInput);
    if (success) {
      setAddMessage({ text: "フレンドを追加しました！🎉", isError: false });
      setFriendCodeInput("");
    } else {
      setAddMessage({
        text: "自分のコードまたは無効なコードです",
        isError: true,
      });
    }
    setTimeout(() => setAddMessage(null), 3000);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-pink-100/70 to-pink-50/40 border-b border-pink-100">
        <h1 className="text-base font-black text-slate-800">フレンド一覧</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          友達のシール帳を見て、持ってないシールをプレゼントしたり交換しよう！
        </p>

        {/* 自分のフレンドコードカード */}
        <div className="mt-4 p-3 bg-white rounded-2xl border border-pink-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{myProfile.avatarUrl}</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">
                あなたのフレンドコード
              </span>
              <span className="text-sm font-black text-pink-600">
                {myProfile.friendCode}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 text-pink-600 bg-pink-50 rounded-xl border border-pink-200 hover:bg-pink-100 transition"
              title="QRコードを表示"
            >
              <QrCode size={16} />
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs font-bold bg-pink-50 text-pink-600 px-3 py-1.5 rounded-xl border border-pink-200 hover:bg-pink-100 transition"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>コピー完了</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-4">
        {/* フレンドコード入力フォーム */}
        <form
          onSubmit={handleAddFriend}
          className="flex gap-2 p-2 bg-white rounded-2xl border border-pink-100 shadow-2xs"
        >
          <input
            type="text"
            placeholder="友達のコード (例: BON-ABCD-1234)"
            value={friendCodeInput}
            onChange={(e) => setFriendCodeInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 outline-none font-bold text-slate-800 placeholder:text-slate-300"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-pink-500 text-white font-bold text-xs rounded-xl shadow hover:bg-pink-600 transition flex items-center gap-1 shrink-0"
          >
            <UserPlus size={13} />
            <span>追加</span>
          </button>
        </form>

        {addMessage && (
          <p
            className={`text-xs font-bold text-center py-1 rounded-xl ${
              addMessage.isError
                ? "bg-rose-50 text-rose-500"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {addMessage.text}
          </p>
        )}

        {/* フレンドリスト */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400 px-1">
            登録中のフレンド ({friends.length}人)
          </span>

          {friends.map((friend) => {
            const giftable = findGiftableStickers(myProfile, friend);
            const tradeMatch = calculateTradeMatch(myProfile, friend);

            return (
              <Link
                key={friend.id}
                href={`/friends/${friend.id}`}
                className="group p-3.5 bg-white/90 hover:bg-white rounded-2xl border border-pink-100 shadow-2xs hover:shadow-sm transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-2xl shadow-inner">
                    {friend.avatarUrl}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition">
                      {friend.username}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">
                        所持: {friend.stickers.length}種
                      </span>

                      {/* プレゼント可能バッジ */}
                      {giftable.length > 0 && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                          giftable.some(g => g.isWishlistMatch)
                            ? "text-rose-600 bg-rose-100 ring-1 ring-rose-300 animate-pulse font-black"
                            : "text-rose-600 bg-rose-50"
                        }`}>
                          <Gift size={10} />
                          {giftable.some(g => g.isWishlistMatch) ? "★欲しいものあげられる！" : `あげられる: ${giftable.length}種`}
                        </span>
                      )}

                      {/* 交換可能バッジ */}
                      {tradeMatch.isMutualMatch && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Repeat size={10} />
                          交換できる！
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="text-slate-300 group-hover:text-pink-500 group-hover:translate-x-0.5 transition"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* QRコード表示モーダル */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full border border-pink-200 shadow-2xl flex flex-col items-center">
            <span className="text-3xl mb-1">📱✨</span>
            <h3 className="text-sm font-black text-slate-800">
              フレンドQRコード
            </h3>
            <p className="text-[11px] text-slate-500 text-center mt-0.5">
              お友達のスマホカメラで読み取ってフレンド登録！
            </p>

            {/* QRコード風グラフィック */}
            <div className="my-5 p-4 bg-white rounded-2xl border-2 border-pink-300 shadow-inner flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-4 border-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                  <div className="w-8 h-8 border-4 border-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                </div>
                <div className="text-center font-mono text-[9px] text-pink-300 font-black tracking-widest">
                  {myProfile.friendCode}
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 border-4 border-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                  <div className="text-xl">🐰</div>
                </div>
              </div>
            </div>

            <span className="text-xs font-mono font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
              CODE: {myProfile.friendCode}
            </span>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full mt-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-2xl transition"
            >
              とじる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
