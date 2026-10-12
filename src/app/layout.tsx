import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StickerProvider } from "@/context/StickerContext";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ボンドロシール帳 ✨🍬 - ボンボンドロップシール管理＆トレード",
  description: "ボンボンドロップシールのAI画像認識登録・コレクション管理・フレンド交換＆プレゼント支援アプリ",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFB6C1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-b from-pink-50 via-white to-pink-50 min-h-screen text-slate-800 antialiased flex justify-center selection:bg-pink-200">
        <StickerProvider>
          {/* スマートフォンライクな中央固定コンテナ */}
          <div className="w-full max-w-md min-h-screen flex flex-col bg-white/70 backdrop-blur-md shadow-2xl relative border-x border-pink-100">
            <main className="flex-1 pb-24 overflow-y-auto">
              {children}
            </main>
            <Navigation />
          </div>
        </StickerProvider>
      </body>
    </html>
  );
}
