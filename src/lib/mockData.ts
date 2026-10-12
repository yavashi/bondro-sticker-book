import { StickerMaster, UserProfile } from "@/types";

export const MOCK_STICKER_MASTERS: StickerMaster[] = [
  // --- シリーズ1: フルーツ＆スイーツドロップ (全8種) ---
  {
    id: "sm-fd-01",
    code: "FD-01",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "とろける完熟いちごドロップ",
    motif: "スイーツ",
    color: "#FF69B4",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-fd-02",
    code: "FD-02",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "ぷっくりフレッシュチェリー",
    motif: "スイーツ",
    color: "#FF1493",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-fd-03",
    code: "FD-03",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "シャインマスカットジュレ",
    motif: "スイーツ",
    color: "#A8E6CF",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-fd-04",
    code: "FD-04",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "ハニーレモンキャンディ",
    motif: "スイーツ",
    color: "#FFD700",
    finishType: "ラメ入り",
    rarity: "レア",
  },
  {
    id: "sm-fd-05",
    code: "FD-05",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "ピーチネクターハート",
    motif: "ハート",
    color: "#FFB6C1",
    finishType: "パール",
    rarity: "レア",
  },
  {
    id: "sm-fd-06",
    code: "FD-06",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "ブルーハワイソーダドロップ",
    motif: "スイーツ",
    color: "#87CEEB",
    finishType: "ラメ入り",
    rarity: "レア",
  },
  {
    id: "sm-fd-07",
    code: "FD-07",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "メロンクリームソーダ",
    motif: "スイーツ",
    color: "#98FB98",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-fd-08",
    code: "FD-08",
    seriesName: "フルーツ＆スイーツドロップ",
    name: "ショコラベリーボンボン",
    motif: "スイーツ",
    color: "#D2691E",
    finishType: "ぷっくりマット",
    rarity: "スーパーレア",
  },

  // --- シリーズ2: ゆめかわアニマルドロップ (全8種) ---
  {
    id: "sm-ya-01",
    code: "YA-01",
    seriesName: "ゆめかわアニマルドロップ",
    name: "パステルみるくうさぎ",
    motif: "動物",
    color: "#FFE4E1",
    finishType: "パール",
    rarity: "ノーマル",
  },
  {
    id: "sm-ya-02",
    code: "YA-02",
    seriesName: "ゆめかわアニマルドロップ",
    name: "ラベンダーこねこキャンディ",
    motif: "動物",
    color: "#E6E6FA",
    finishType: "オーロラ",
    rarity: "レア",
  },
  {
    id: "sm-ya-03",
    code: "YA-03",
    seriesName: "ゆめかわアニマルドロップ",
    name: "もこもこクラウドベア",
    motif: "動物",
    color: "#B0E0E6",
    finishType: "ラメ入り",
    rarity: "レア",
  },
  {
    id: "sm-ya-04",
    code: "YA-04",
    seriesName: "ゆめかわアニマルドロップ",
    name: "いちごみるくハムスター",
    motif: "動物",
    color: "#FFC0CB",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-ya-05",
    code: "YA-05",
    seriesName: "ゆめかわアニマルドロップ",
    name: "レインボーユニコーン",
    motif: "キャラクター",
    color: "#DDA0DD",
    finishType: "オーロラ",
    rarity: "スーパーレア",
  },
  {
    id: "sm-ya-06",
    code: "YA-06",
    seriesName: "ゆめかわアニマルドロップ",
    name: "チョコミントわんこ",
    motif: "動物",
    color: "#AFEEEE",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-ya-07",
    code: "YA-07",
    seriesName: "ゆめかわアニマルドロップ",
    name: "シュガーピンクひつじ",
    motif: "動物",
    color: "#FFB6C1",
    finishType: "パール",
    rarity: "ノーマル",
  },
  {
    id: "sm-ya-08",
    code: "YA-08",
    seriesName: "ゆめかわアニマルドロップ",
    name: "きらきらペンギンドロップ",
    motif: "動物",
    color: "#4682B4",
    finishType: "ラメ入り",
    rarity: "レア",
  },

  // --- シリーズ3: キラキラジュエル＆魔法 (全8種) ---
  {
    id: "sm-kj-01",
    code: "KJ-01",
    seriesName: "キラキラジュエル＆魔法",
    name: "ルビークラウンハート",
    motif: "ハート",
    color: "#DC143C",
    finishType: "オーロラ",
    rarity: "スーパーレア",
  },
  {
    id: "sm-kj-02",
    code: "KJ-02",
    seriesName: "キラキラジュエル＆魔法",
    name: "サファイアスターナイト",
    motif: "星",
    color: "#4169E1",
    finishType: "ラメ入り",
    rarity: "レア",
  },
  {
    id: "sm-kj-03",
    code: "KJ-03",
    seriesName: "キラキラジュエル＆魔法",
    name: "エメラルドドロップ",
    motif: "ジュエリー",
    color: "#2E8B57",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-kj-04",
    code: "KJ-04",
    seriesName: "キラキラジュエル＆魔法",
    name: "アメジストクリスタル",
    motif: "ジュエリー",
    color: "#8A2BE2",
    finishType: "オーロラ",
    rarity: "レア",
  },
  {
    id: "sm-kj-05",
    code: "KJ-05",
    seriesName: "キラキラジュエル＆魔法",
    name: "ダイヤティアラドロップ",
    motif: "ジュエリー",
    color: "#F0F8FF",
    finishType: "パール",
    rarity: "スーパーレア",
  },
  {
    id: "sm-kj-06",
    code: "KJ-06",
    seriesName: "キラキラジュエル＆魔法",
    name: "トパーズサンシャイン",
    motif: "星",
    color: "#FFA500",
    finishType: "ラメ入り",
    rarity: "ノーマル",
  },
  {
    id: "sm-kj-07",
    code: "KJ-07",
    seriesName: "キラキラジュエル＆魔法",
    name: "オーロラプリズムスター",
    motif: "星",
    color: "#BA55D3",
    finishType: "オーロラ",
    rarity: "スーパーレア",
  },
  {
    id: "sm-kj-08",
    code: "KJ-08",
    seriesName: "キラキラジュエル＆魔法",
    name: "ローズクォーツペンダント",
    motif: "ジュエリー",
    color: "#FFB6C1",
    finishType: "パール",
    rarity: "ノーマル",
  },
];

// 初期ログインユーザー (デフォルトひな形)
export const INITIAL_MY_PROFILE: UserProfile = {
  id: "user-me",
  username: "ゲストコレクター",
  friendCode: "BON-1001",
  avatarUrl: "🎀",
  wishlistMasterIds: ["sm-ya-01", "sm-kj-01"],
  stickers: [
    {
      id: "us-01",
      userId: "user-me",
      stickerMasterId: "sm-fd-01",
      sticker: MOCK_STICKER_MASTERS[0], // とろける完熟いちごドロップ
      quantity: 3, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-02",
      userId: "user-me",
      stickerMasterId: "sm-fd-05",
      sticker: MOCK_STICKER_MASTERS[4], // ピーチネクターハート
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-03",
      userId: "user-me",
      stickerMasterId: "sm-ya-03",
      sticker: MOCK_STICKER_MASTERS[10], // もこもこクラウドベア
      quantity: 1, // 1枚のみ
      isTradeable: false,
      updatedAt: new Date().toISOString(),
    },
  ],
};

// モックフレンド1: ゆいちゃん (アニマルコレクター)
export const MOCK_FRIEND_YUI: UserProfile = {
  id: "friend-yui",
  username: "ゆいちゃん",
  friendCode: "YUI-2024",
  avatarUrl: "🍓",
  wishlistMasterIds: ["sm-fd-01", "sm-fd-05"], // フルーツが欲しい！
  stickers: [
    {
      id: "us-f-01",
      userId: "friend-yui",
      stickerMasterId: "sm-ya-01",
      sticker: MOCK_STICKER_MASTERS[8], // パステルみるくうさぎ
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-f-02",
      userId: "friend-yui",
      stickerMasterId: "sm-ya-02",
      sticker: MOCK_STICKER_MASTERS[9], // ラベンダーこねこキャンディ
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-f-03",
      userId: "friend-yui",
      stickerMasterId: "sm-fd-06",
      sticker: MOCK_STICKER_MASTERS[5], // ブルーハワイ
      quantity: 1,
      isTradeable: false,
      updatedAt: new Date().toISOString(),
    },
  ],
};

// モックフレンド2: あおいちゃん (ジュエルコレクター)
export const MOCK_FRIEND_AOI: UserProfile = {
  id: "friend-aoi",
  username: "あおいちゃん",
  friendCode: "AOI-7777",
  avatarUrl: "⭐",
  wishlistMasterIds: ["sm-kj-07"], // プリズムスターが欲しい
  stickers: [
    {
      id: "us-f-04",
      userId: "friend-aoi",
      stickerMasterId: "sm-kj-01",
      sticker: MOCK_STICKER_MASTERS[16], // ルビークラウンハート
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-f-05",
      userId: "friend-aoi",
      stickerMasterId: "sm-kj-02",
      sticker: MOCK_STICKER_MASTERS[17], // サファイアスターナイト
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
  ],
};
