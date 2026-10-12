# AGENTS.md — AIエージェント開発運用規約
**プロジェクト名:** ボンドロシール帳 (BonDrop Sticker Book)  
**対象エージェント:** Google Antigravity, Claude Code, Cursor, GitHub Copilot 等のAIコーディングエージェント  
**リポジトリの目的:** ボンボンドロップシールの画像認識登録、コレクション管理、フレンド間でのプレゼント＆交換（トレード）支援アプリケーションの開発・運用

---

## 1. 最重要指令: Spec-Driven Development (SDD) の厳格遵守

本リポジトリは **Google Antigravityが提唱する Spec-Driven Development (SDD)** に厳格に準拠して開発されています。  
エージェントは「プロンプトから直感でいきなりコードを書く（Vibe Coding）」ことを**固く禁止**されます。すべての行動は仕様ファイル（`specs/`）を起点とし、仕様ファイルと同期しなければなりません。

### 1.1 仕様ドキュメント群（Single Source of Truth: SSOT）
作業を開始する前に、必ず以下の該当ドキュメントを読み込み、理解してください。

- **[specs/constitution.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/constitution.md)**: プロジェクト憲法・不変の理念・品質基準
- **[specs/requirements.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/requirements.md)**: 機能・非機能要件、ユーザーストーリー、受け入れ基準 (DoD)
- **[specs/architecture.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/architecture.md)**: 全体構成、データモデル、Geminiマルチモーダル設計、マッチングアルゴリズム
- **[specs/implementation_plan.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/implementation_plan.md)**: フェーズ別マイルストーン、テスト戦略
- **[specs/tasks.md](file:///c:/Users/hokah/Documents/AntiGravity-Project/ボンドロシール帳/specs/tasks.md)**: アトミックタスクのチェックリストと進捗管理

### 1.2 エージェントの作業プロトコル (Work Loop)
1. **仕様確認 (Verify Spec):** 実装対象の機能が `requirements.md` および `architecture.md` にどのように規定されているか確認する。仕様に曖昧さがある場合は勝手に決めつけず、まず仕様書をアップデートするかユーザーに確認する。
2. **タスク更新 (In Progress):** `specs/tasks.md` の対象タスクを `[/]` (In Progress) に変更する。
3. **実装 (Implement):** アーキテクチャ設計およびコーディング規約に沿って最小限かつクリーンに実装する。
4. **検証 (Verify):** 受け入れ基準を満たしているか、テストの実行や動作確認を行う。
5. **タスク完了 (Completed):** `specs/tasks.md` の対象タスクを `[x]` (Completed) に更新し、次に着手可能なタスクを報告する。

---

## 2. システムのコアビジネスロジック規則

エージェントが実装する際、以下のドメインルールを歪めてはなりません。

### 2.1 シール所持ステータスルール
- **所持数 (`quantity`):** 1以上の整数。
- **ダブり判定 (`is_duplicate`):** `quantity >= 2` の場合、システムは自動的に「ダブり」と判定する。
- **トレード可能フラグ (`is_tradeable`):** ユーザーが手動でON/OFF可能。初期値はダブり（`quantity >= 2`）時にデフォルトON、単数所持時はデフォルトOFF。
- **欲しいもの (`Wishlist`):** 未所持（または追加で欲しい）シールを登録し、優先度（1〜3）を持たせることができる。

### 2.2 プレゼント支援 (Gift Finder) アルゴリズム
ユーザーAがフレンドBのシール帳を見ている時：
- **プレゼント候補:** ユーザーAが「ダブっており、かつトレード可能」に設定しているシールの中で、フレンドBが「未所持」であるもの。
- **最優先プレゼント:** 上記の中でフレンドBの「Wishlist」に含まれるもの（「相手の欲しがっているシールです！」バッジ）。

### 2.3 相互トレードマッチング (Smart Trade Matcher) アルゴリズム
ユーザーAとフレンドBのペアにおいて：
- **AがBに提供可能:** `Aのダブり・交換可能シール ∩ Bの未所持シール`
- **BがAに提供可能:** `Bのダブり・交換可能シール ∩ Aの未所持シール`
- **交換成立候補:** 双方の提供可能集合がそれぞれ1件以上ある場合、「1対1の交換可能な組み合わせ」としてサジェスト表示する。

### 2.4 Geminiマルチモーダル画像認識ルール
- 画像認識には Google Gemini 3.8 Flash を使用する。
- 必ず `specs/architecture.md` に定義された `StickerRecognitionSchema` による **Structured Outputs (構造化JSON)** を指定する。
- 撮影状況や光の反射（ドロップシールのツヤ）による誤認識を想定し、**AIの認識結果は常に「ドラフト（下書き）」として提示し、ユーザーが手動修正・確認できるフローを必須**とする。
- APIキー未設定の開発環境やオフライン環境でも動作検証ができるよう、モックフォールバック機構を常に備える。

---

## 3. 技術スタック & コーディング規約

- **言語・FW:** TypeScript (Strict Mode) / Next.js (App Router) / React
- **スタイリング:** Tailwind CSS
  - ドロップシール特有の「ぷっくり光沢感」（ドロップシャドウ、内側グロー、ハイライトグラデーション）を再現するユーティリティクラスを活用する。
- **アイコン:** `lucide-react`
- **AI SDK:** `@google/genai` (Google Gen AI SDK)
- **ファイル命名:**
  - コンポーネント: PascalCase (`StickerCard.tsx`, `StickerBookView.tsx`)
  - フック / ユーティリティ: camelCase (`useStickers.ts`, `matcher.ts`)
  - 型定義: `*.types.ts` または `types/` 配下
- **状態管理 & データ永続化:**
  - 疎結合なサービスクラス / フックで抽象化し、モック・ローカルストレージ・実データベースの切り替えが容易な設計とする。

---

## 4. セキュリティ & プライバシー規約

1. **未成年者・親子利用の配慮:**
   - 本名、住所、詳細な位置情報、自由記述による個人情報連絡先を求める入力項目を設けてはならない。
   - フレンド機能は「合意ベース（フレンドコード入力や承認制）」とし、知らない第三者からの無断登録を防ぐ。
2. **APIシークレット保護:**
   - `GEMINI_API_KEY` を含む環境変数はバックエンドルート（サーバーサイド）でのみ参照し、ブラウザ（フロントエンド）に直接露出させてはならない。
3. **画像プライバシー:**
   - シール写真撮影時に人物の顔などが誤って写り込んだ場合を想定し、シール領域の切り出しや警告配慮を行う。

---

## 5. エージェントのロールプレイング（推奨プロファイル）

エージェントは状況に応じて以下の役割を意識して行動してください：
- **Lead Architect:** 仕様の整合性チェック、データモデルとAPI設計、SDDワークフローの統制。
- **UI/UX Craftsperson:** シールコレクターの心を掴む「ぷっくり・キラキラ・かわいい」ビジュアル演出と、子供でも迷わない直感的操作感の実装。
- **AI Engineer:** Geminiマルチモーダルプロンプトの最適化、トークン効率化、画像前処理。
- **QA / Test Engineer:** マッチングアルゴリズムのエッジケース検証、受入基準テストの徹底。

---

## 6. コマンドリファレンス

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動（ローカルポート3000） |
| `npm run build` | プロダクションビルド検証 |
| `npm test` | ユニットテスト・マッチングロジック検証の実行 |
| `npm run lint` | 静的解析・型チェック |
