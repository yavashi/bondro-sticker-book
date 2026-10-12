"use client";

import React, { useState } from "react";
import { useStickers } from "@/context/StickerContext";
import { calculateTradeMatch, findGiftableStickers } from "@/lib/matcher";
import { Sparkles, Repeat, ArrowRightLeft, Gift, Check, Send } from "lucide-react";
import Link from "next/link";
import { sounds } from "@/lib/sound";

export default function TradePage() {
  const { myProfile, friends, proposals, createTradeProposal, acceptTradeProposal } = useStickers();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 全フレンドとのトレードマッチング結果を算出
  const tradeMatches = friends.map((friend) =>
    calculateTradeMatch(myProfile, friend)
  );

  // 相互交換可能なフレンド
  const mutualMatches = tradeMatches.filter((m) => m.isMutualMatch);

  // 届いている交換提案 (自分宛て & PENDING)
  const incomingProposals = proposals.filter(
    (p) => p.receiverId === myProfile.id && p.status === "PENDING"
  );

  // プレゼントのみ可能なフレンド
  const giftOnlyMatches = friends
    .map((friend) => ({
      friend,
      giftable: findGiftableStickers(myProfile, friend),
    }))
    .filter(
      (m) =>
        m.giftable.length > 0 &&
        !mutualMatches.some((mm) => mm.friend.id === m.friend.id)
    );

  const handlePropose = (friendId: string, myMasterId: string, friendMasterId: string) => {
    createTradeProposal(friendId, myMasterId, friendMasterId);
    sounds.playSparkle();
    setSuccessMessage("交換リクエストを相手に送信しました！💌");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAccept = (proposalId: string) => {
    acceptTradeProposal(proposalId);
    sounds.playSuccess(); // トレード成立音！
    setSuccessMessage("トレード成立！シール帳の所持数が更新されました🎉");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-pink-100/70 to-pink-50/40 border-b border-pink-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800">
              シールこうかん・プレゼント
            </h1>
            <p className="text-[11px] text-slate-500">
              お互いのダブりシールから、ぴったりな交換の組み合わせをご案内！
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 flex flex-col gap-5">
        {/* 完了通知メッセージ */}
        {successMessage && (
          <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md text-center animate-fade-in flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 届いている交換リクエスト (承認待ち) */}
        {incomingProposals.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              あなたへ届いている交換のおねがい ({incomingProposals.length}件)
            </h2>

            {incomingProposals.map((prop) => (
              <div
                key={prop.id}
                className="p-4 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 rounded-3xl border-2 border-rose-300 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-700">
                    {prop.requesterUsername} からの交換リクエスト
                  </span>
                  <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                    おへんじ待ち
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white/90 p-3 rounded-2xl border border-rose-200">
                  <div className="text-center flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">もらえるシール</span>
                    <span className="text-xs font-bold text-slate-800">{prop.offeredSticker.name}</span>
                  </div>
                  <ArrowRightLeft size={16} className="text-pink-500" />
                  <div className="text-center flex-1">
                    <span className="text-[10px] text-slate-400 block mb-1">わたすシール</span>
                    <span className="text-xs font-bold text-slate-800">{prop.requestedSticker.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(prop.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>この交換をOKする！🎉</span>
                </button>
              </div>
            ))}
          </section>
        )}

        {/* 相互交換マッチングセクション */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              お互いに交換できる組み合わせ ({mutualMatches.length}件)
            </h2>
            <span className="text-[10px] text-slate-400">1対1トレード</span>
          </div>

          {mutualMatches.length === 0 ? (
            <div className="p-6 bg-white/80 rounded-3xl border border-pink-100 text-center flex flex-col items-center">
              <span className="text-3xl mb-2">🤝</span>
              <p className="text-xs font-bold text-slate-600">
                いま成立する交換はありません
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                シールの写真を撮って登録するか、フレンドが増えると交換候補が見つかります！
              </p>
              <Link
                href="/scan"
                className="mt-3 text-xs font-bold text-pink-600 bg-pink-50 px-3.5 py-1.5 rounded-xl border border-pink-200"
              >
                新しいシールを登録する
              </Link>
            </div>
          ) : (
            mutualMatches.map((match) => {
              const mySticker = match.canGiveToFriend[0];
              const friendSticker = match.canReceiveFromFriend[0];
              const alreadyProposed = proposals.some(
                p => p.receiverId === match.friend.id && p.status === "PENDING"
              );

              return (
                <div
                  key={match.friend.id}
                  className="p-4 bg-white rounded-3xl border-2 border-emerald-200/80 shadow-sm flex flex-col gap-3.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{match.friend.avatarUrl}</span>
                      <span className="text-xs font-black text-slate-800">
                        {match.friend.username} との交換候補
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ぴったりマッチ✨
                    </span>
                  </div>

                  {/* 交換ペア表示 */}
                  <div className="flex items-center justify-between bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100">
                    {/* あなたが出すシール */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <span className="text-[10px] font-bold text-slate-400 mb-1">
                        あなたが渡す
                      </span>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-1"
                        style={{ backgroundColor: mySticker.sticker.color }}
                      >
                        {mySticker.sticker.motif === "スイーツ" && "🍓"}
                        {mySticker.sticker.motif === "動物" && "🐰"}
                        {mySticker.sticker.motif === "星" && "⭐"}
                        {mySticker.sticker.motif === "ハート" && "💖"}
                        {mySticker.sticker.motif === "フラワー" && "🌸"}
                        {mySticker.sticker.motif === "その他" && "🍬"}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                        {mySticker.sticker.name}
                      </span>
                      <span className="text-[9px] text-pink-500">
                        (残{mySticker.quantity}枚)
                      </span>
                    </div>

                    {/* トレードアイコン */}
                    <div className="px-2 text-emerald-500">
                      <ArrowRightLeft size={20} />
                    </div>

                    {/* 相手がくれるシール */}
                    <div className="flex flex-col items-center text-center flex-1">
                      <span className="text-[10px] font-bold text-slate-400 mb-1">
                        相手からもらう
                      </span>
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-1"
                        style={{ backgroundColor: friendSticker.sticker.color }}
                      >
                        {friendSticker.sticker.motif === "スイーツ" && "🍓"}
                        {friendSticker.sticker.motif === "動物" && "🐰"}
                        {friendSticker.sticker.motif === "星" && "⭐"}
                        {friendSticker.sticker.motif === "ハート" && "💖"}
                        {friendSticker.sticker.motif === "フラワー" && "🌸"}
                        {friendSticker.sticker.motif === "その他" && "🍬"}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
                        {friendSticker.sticker.name}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold">
                        ★未所持！
                      </span>
                    </div>
                  </div>

                  {/* 交換提案ボタン */}
                  <button
                    onClick={() => handlePropose(match.friend.id, mySticker.stickerMasterId, friendSticker.stickerMasterId)}
                    disabled={alreadyProposed}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm ${
                      alreadyProposed
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    {alreadyProposed ? (
                      <>
                        <Check size={14} />
                        <span>交換提案を送信済み</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>交換を提案する</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </section>

        {/* プレゼントできる相手セクション */}
        {giftOnlyMatches.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h2 className="text-xs font-black text-slate-800 flex items-center gap-1.5 px-1">
              <Gift size={14} className="text-rose-500" />
              プレゼントできるフレンド ({giftOnlyMatches.length}人)
            </h2>

            {giftOnlyMatches.map(({ friend, giftable }) => (
              <Link
                key={friend.id}
                href={`/friends/${friend.id}`}
                className="p-3 bg-white rounded-2xl border border-pink-100 shadow-2xs hover:shadow-sm transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{friend.avatarUrl}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {friend.username}
                    </h3>
                    <span className="text-[10px] text-rose-500 font-bold">
                      {giftable.length}種類のダブりシールをプレゼント可能
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-xl">
                  シール帳を見る
                </span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
