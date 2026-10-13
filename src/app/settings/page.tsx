"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStickers } from "@/context/StickerContext";
import {
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  BarChart3,
  UserPen,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { sounds } from "@/lib/sound";

const AVATAR_OPTIONS = [
  "🐰", "🐱", "🐻", "🎀", "🍓", "🍬", "⭐", "💖", "🌸", "💎", "🦄", "🐶"
];

export default function SettingsPage() {
  const {
    myProfile,
    updateProfile,
    exportBackup,
    importBackup,
    resetToDefault,
  } = useStickers();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // プロフィール編集ステート
  const [profileName, setProfileName] = useState(myProfile.username || "わたし");
  const [profileAvatar, setProfileAvatar] = useState(myProfile.avatarUrl || "🎀");
  const [profileCode, setProfileCode] = useState(myProfile.friendCode);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSavedProfile, setIsSavedProfile] = useState(false);

  useEffect(() => {
    setProfileName(myProfile.username || "わたし");
    setProfileAvatar(myProfile.avatarUrl || "🎀");
    setProfileCode(myProfile.friendCode);
  }, [myProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileName, profileAvatar, profileCode);
    sounds.playSparkle();
    setIsSavedProfile(true);
    setStatusMessage({
      text: `プロフィールを「${profileName}」に更新しました！✨`,
      isError: false,
    });
    setTimeout(() => {
      setIsSavedProfile(false);
      setStatusMessage(null);
    }, 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(profileCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // コレクション統計計算
  const totalPieces = myProfile.stickers.reduce(
    (sum, s) => sum + s.quantity,
    0
  );
  const uniqueTypes = myProfile.stickers.length;
  const duplicateTypes = myProfile.stickers.filter((s) => s.quantity >= 2).length;

  const rarityCounts = myProfile.stickers.reduce(
    (acc, s) => {
      const r = s.sticker.rarity || "ノーマル";
      acc[r] = (acc[r] || 0) + s.quantity;
      return acc;
    },
    { ノーマル: 0, レア: 0, スーパーレア: 0 } as Record<string, number>
  );

  // バックアップダウンロード
  const handleExport = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bondro-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    sounds.playSparkle();
    setStatusMessage({
      text: "バックアップファイルを保存しました！📁✨",
      isError: false,
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // バックアップ復元
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      if (success) {
        sounds.playSuccess();
        setStatusMessage({
          text: "シール帳データを正常に復元しました！🎉",
          isError: false,
        });
      } else {
        setStatusMessage({
          text: "ファイルの読み込みに失敗しました。正しいJSONファイルかご確認ください。",
          isError: true,
        });
      }
      setTimeout(() => setStatusMessage(null), 3500);
    };
    reader.readAsText(file);
  };

  // 初期化リセット
  const handleReset = () => {
    if (window.confirm("シール帳を初期データにリセットしますか？")) {
      resetToDefault();
      setStatusMessage({
        text: "初期サンプルデータにリセットしました。",
        isError: false,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
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
        <h2 className="text-sm font-black text-slate-800">設定・マイデータ</h2>
        <div className="w-16" />
      </header>

      <div className="p-4 flex flex-col gap-5">
        {/* 通知メッセージ */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold text-center animate-fade-in ${
              statusMessage.isError
                ? "bg-rose-50 text-rose-500 border border-rose-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* プロフィール設定セクション */}
        <section className="bg-white rounded-3xl p-5 border-2 border-pink-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPen size={18} className="text-pink-500" />
              <h3 className="text-sm font-black text-slate-800">
                プロフィール設定
              </h3>
            </div>
            <span className="text-[10px] text-pink-500 bg-pink-50 font-bold px-2 py-0.5 rounded-full border border-pink-200">
              いつでも変更OK
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            {/* アバター選択 */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 border-2 border-pink-300 shadow-inner flex items-center justify-center text-4xl select-none">
                {profileAvatar}
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                アイコンをえらぶ
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setProfileAvatar(emoji)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition transform hover:scale-110 ${
                      profileAvatar === emoji
                        ? "bg-pink-100 border-2 border-pink-400 scale-110 shadow-xs"
                        : "bg-slate-50 border border-slate-200 hover:bg-pink-50"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* お名前入力 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700">
                シール帳のお名前（ニックネーム）
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="あなたのお名前を入力してね"
                maxLength={14}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 focus:border-pink-500 outline-none text-sm font-bold text-slate-800 bg-pink-50/20"
              />
              <span className="text-[10px] text-slate-400">
                ※「{profileName || "わたし"}のシール帳」として表示されます
              </span>
            </div>

            {/* 個別ID表示（固定・コピーのみ） */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block">
                    あなた専用の個別ID（フレンドコード）
                  </span>
                  <span className="text-xs font-black text-pink-600 tracking-wider">
                    {profileCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition shadow-2xs active:scale-95"
                >
                  {copiedCode ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copiedCode ? "コピー済" : "コピー"}</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span>🔒</span>
                <span>お友達があなたを登録するための固定IDです（他の人と重複しません）</span>
              </p>
            </div>

            {/* 保存ボタン */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
            >
              {isSavedProfile ? (
                <>
                  <Check size={15} />
                  <span>プロフィールを保存しました！✨</span>
                </>
              ) : (
                <>
                  <Check size={15} />
                  <span>プロフィールを変更・保存する ✨</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* コレクション統計 */}
        <section className="bg-white rounded-3xl p-4 border border-pink-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-pink-500" />
            <h3 className="text-xs font-black text-slate-800">
              あつめたシールのきろく
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-pink-50/60 p-2.5 rounded-2xl border border-pink-100">
              <span className="text-[10px] text-slate-400 block font-bold">
                ぜんぶの枚数
              </span>
              <span className="text-base font-black text-slate-800">
                {totalPieces}枚
              </span>
            </div>
            <div className="bg-pink-50/60 p-2.5 rounded-2xl border border-pink-100">
              <span className="text-[10px] text-slate-400 block font-bold">
                シール種類
              </span>
              <span className="text-base font-black text-pink-600">
                {uniqueTypes}種
              </span>
            </div>
            <div className="bg-pink-50/60 p-2.5 rounded-2xl border border-pink-100">
              <span className="text-[10px] text-slate-400 block font-bold">
                ダブり種類
              </span>
              <span className="text-base font-black text-rose-500">
                {duplicateTypes}種
              </span>
            </div>
          </div>

          {/* レア度分布バー */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400">
              レア度分布
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-600 w-16">
                スーパーレア:
              </span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (rarityCounts["スーパーレア"] / totalPieces) * 100 || 0
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-amber-500 w-8 text-right">
                {rarityCounts["スーパーレア"]}枚
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-600 w-16">
                レア:
              </span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-pink-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (rarityCounts["レア"] / totalPieces) * 100 || 0
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-pink-500 w-8 text-right">
                {rarityCounts["レア"]}枚
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold text-slate-600 w-16">
                ノーマル:
              </span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-300 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (rarityCounts["ノーマル"] / totalPieces) * 100 || 0
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-slate-500 w-8 text-right">
                {rarityCounts["ノーマル"]}枚
              </span>
            </div>
          </div>
        </section>

        {/* データバックアップ & 復元 */}
        <section className="bg-white rounded-3xl p-4 border border-pink-100 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-pink-500" />
            <h3 className="text-xs font-black text-slate-800">
              データバックアップ & 復元
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            登録したシール帳データをファイルとして保存しておけば、スマホの機種変更時にも安心です。
          </p>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={handleExport}
              className="py-2.5 px-3 bg-pink-50 text-pink-600 border border-pink-200 rounded-2xl text-xs font-bold hover:bg-pink-100 transition flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              <span>バックアップ保存</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 bg-white text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              <Upload size={13} />
              <span>ファイルから復元</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="text-[10px] text-slate-400 hover:text-rose-500 font-bold flex items-center justify-center gap-1 mt-2 pt-2 border-t border-slate-100"
          >
            <RotateCcw size={10} />
            <span>初期サンプルデータにリセット</span>
          </button>
        </section>

        {/* ホーム画面に追加 (PWA案内) */}
        <section className="bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-3xl p-4 shadow-md flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Smartphone size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black">スマホのホーム画面に追加</h4>
            <p className="text-[10px] text-white/90 mt-0.5 leading-snug">
              ブラウザの「共有」メニューから「ホーム画面に追加」を選ぶと、アプリとして全画面で快適に使えます！
            </p>
          </div>
        </section>

        {/* システム情報 */}
        <div className="text-center text-[10px] text-slate-400 py-2">
          <span>ボンドロシール帳 v1.0.0</span>
          <span className="mx-1.5">•</span>
          <span>AI: Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
}
