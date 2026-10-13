"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Copy } from "lucide-react";
import { useStickers } from "@/context/StickerContext";

const AVATAR_OPTIONS = [
  "🐰", "🐱", "🐻", "🎀", "🍓", "🍬", "⭐", "💖", "🌸", "💎", "🦄", "🐶"
];

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { myProfile, updateProfile } = useStickers();
  const [name, setName] = useState(myProfile.username || "わたし");
  const [avatar, setAvatar] = useState(myProfile.avatarUrl || "🐰");
  const [code, setCode] = useState(myProfile.friendCode);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile(name, avatar, code);
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 border-pink-200 relative flex flex-col gap-5"
        >
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <h3 className="text-base font-black text-slate-800">
              プロフィールせってい ✨
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              シール帳にひょうじされるお名前とアイコンをえらんでね
            </p>
          </div>

          {/* アイコン選択 */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 border-2 border-pink-300 shadow-inner flex items-center justify-center text-4xl select-none">
              {avatar}
            </div>
            <span className="text-[10px] font-bold text-slate-400">アイコンをタップしてえらぶ</span>
            <div className="flex flex-wrap justify-center gap-2 max-w-xs mt-1">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition transform hover:scale-110 ${
                    avatar === emoji
                      ? "bg-pink-100 border-2 border-pink-400 scale-110 shadow-xs"
                      : "bg-slate-50 border border-slate-200 hover:bg-pink-50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* ニックネーム入力 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-700">お名前・ニックネーム</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="あなたのニックネーム"
              maxLength={12}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-sm font-bold text-slate-800 bg-pink-50/30"
            />
          </div>

          {/* フレンドコード表示（固定・コピーのみ） */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">あなた専用の個別ID（フレンドコード）</span>
                <span className="text-xs font-black text-pink-600 tracking-wider">
                  {code}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-600 shadow-2xs hover:bg-pink-50 transition active:scale-95"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? "コピー済" : "コピー"}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>🔒</span>
              <span>お友達があなたを登録するための固定IDです（他の人と重複しません）</span>
            </p>
          </div>

          {/* 保存ボタン */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-sm rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>かんりょう！</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
