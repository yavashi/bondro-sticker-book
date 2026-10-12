# ボンドロシール帳 (BonDrop Sticker Book) ✨🍬

> **ボンボンドロップシールのコレクション管理・フレンド交換・プレゼント支援アプリ**  
> Google Antigravity の **Spec-Driven Development (SDD)** に基づき設計・開発されています。

---

## 🌟 アプリ概要

流行の「ボンボンドロップシール」の写真をスマホでパシャリと撮るだけで、**マルチモーダルAI (Gemini 2.5 Flash)** がシールを自動認識してデジタルシール帳に登録！

- 📷 **AI自動登録:** 写真を撮るだけで、シールの名前・色・モチーフ・質感を自動認識
- 📖 **デジタルシール帳:** ドロップシール特有のぷっくり・ツヤツヤ感を画面上で再現
- 🔄 **ダブり自動判定:** 2枚以上持っているシールは自動で「ダブり・交換OK」フラグが点灯
- 👭 **フレンド共有:** 友達同士でシール帳を見せ合いっこ
- 🎁 **プレゼント支援 (Gift Finder):** 「相手が持っていない自分のダブりシール」を教えてくれる！
- 🤝 **交換マッチング (Smart Trade):** 「これとこれ交換できるよ！」というお互いWin-Winな組み合わせを自動提案

---

## 📐 Spec-Driven Development (SDD) ドキュメント

本プロジェクトの仕様および設計書は `specs/` ディレクトリに集約されています：

- **[specs/constitution.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/constitution.md)**: プロジェクト憲法・設計思想
- **[specs/requirements.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/requirements.md)**: 要件定義・ユーザーストーリー・受け入れ基準 (DoD)
- **[specs/architecture.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/architecture.md)**: システム設計・GeminiマルチモーダルAPI・マッチングアルゴリズム
- **[specs/implementation_plan.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/implementation_plan.md)**: 段階的実装計画・マイルストーン
- **[specs/tasks.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/tasks.md)**: 進捗タスクチェックリスト

AIエージェントの開発規約・行動方針は **[AGENTS.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/AGENTS.md)** を参照してください。

---

## 🛠 技術スタック

- **フロントエンド:** Next.js (App Router) / React 19 / TypeScript / Tailwind CSS
- **アニメーション & UI:** Framer Motion / Lucide React
- **AI (マルチモーダル):** Google Gemini 2.5 Flash (`@google/genai` Structured Outputs)
- **データ管理:** SQLite / PostgreSQL / LocalStorage & IndexedDB
