import { StickerMaster, UserProfile } from "@/types";

export const MOCK_STICKER_MASTERS: StickerMaster[] = [
  {
    id: "sm-01",
    seriesName: "スイートドロップ 第1弾",
    name: "いちごドロップ",
    motif: "スイーツ",
    color: "#FF69B4",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-02",
    seriesName: "スイートドロップ 第1弾",
    name: "ソーダベアドロップ",
    motif: "動物",
    color: "#87CEEB",
    finishType: "ラメ入り",
    rarity: "レア",
  },
  {
    id: "sm-03",
    seriesName: "スイートドロップ 第1弾",
    name: "オーロラスター",
    motif: "星",
    color: "#DDA0DD",
    finishType: "オーロラ",
    rarity: "スーパーレア",
  },
  {
    id: "sm-04",
    seriesName: "スイートドロップ 第1弾",
    name: "ハニーレモン",
    motif: "スイーツ",
    color: "#FFD700",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
  {
    id: "sm-05",
    seriesName: "スイートドロップ 第1弾",
    name: "ピーチハート",
    motif: "ハート",
    color: "#FFB6C1",
    finishType: "パール",
    rarity: "レア",
  },
  {
    id: "sm-06",
    seriesName: "ファンシーアニマル",
    name: "ミントうさぎ",
    motif: "動物",
    color: "#98FB98",
    finishType: "ぷっくりマット",
    rarity: "ノーマル",
  },
  {
    id: "sm-07",
    seriesName: "ファンシーアニマル",
    name: "ジュエリーキャット",
    motif: "動物",
    color: "#BA55D3",
    finishType: "ラメ入り",
    rarity: "スーパーレア",
  },
  {
    id: "sm-08",
    seriesName: "フラワーガーデン",
    name: "サクラドロップ",
    motif: "フラワー",
    color: "#FFC0CB",
    finishType: "クリアドロップ",
    rarity: "ノーマル",
  },
];

// 初期ログインユーザー (自分)
export const INITIAL_MY_PROFILE: UserProfile = {
  id: "user-me",
  username: "わたし (みく)",
  friendCode: "BON-8823",
  avatarUrl: "🐰",
  wishlistMasterIds: ["sm-06"], // ミントうさぎが欲しい！
  stickers: [
    {
      id: "us-01",
      userId: "user-me",
      stickerMasterId: "sm-01",
      sticker: MOCK_STICKER_MASTERS[0], // いちごドロップ
      quantity: 3, // ダブり (2枚以上)
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-02",
      userId: "user-me",
      stickerMasterId: "sm-02",
      sticker: MOCK_STICKER_MASTERS[1], // ソーダベアドロップ
      quantity: 1, // 1枚のみ (大切)
      isTradeable: false,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-03",
      userId: "user-me",
      stickerMasterId: "sm-05",
      sticker: MOCK_STICKER_MASTERS[4], // ピーチハート
      quantity: 2, // ダブり
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
  ],
};

// フレンド1: ゆいちゃん
// いちごドロップを未所持かつWishlist登録中（→ 最優先プレゼント対象！）
// ミントうさぎを2枚ダブりで所持（→ トレード対象！）
export const MOCK_FRIEND_YUI: UserProfile = {
  id: "user-friend-1",
  username: "ゆいちゃん 🍓",
  friendCode: "BON-1092",
  avatarUrl: "🐱",
  wishlistMasterIds: ["sm-01"], // いちごドロップが超欲しい！
  stickers: [
    {
      id: "us-f1-01",
      userId: "user-friend-1",
      stickerMasterId: "sm-02",
      sticker: MOCK_STICKER_MASTERS[1], // ソーダベア
      quantity: 1,
      isTradeable: false,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-f1-02",
      userId: "user-friend-1",
      stickerMasterId: "sm-06",
      sticker: MOCK_STICKER_MASTERS[5], // ミントうさぎ (ダブり)
      quantity: 2,
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
  ],
};

// フレンド2: あおいちゃん
// オーロラスターをダブり所持
export const MOCK_FRIEND_AOI: UserProfile = {
  id: "user-friend-2",
  username: "あおいちゃん 🌟",
  friendCode: "BON-5541",
  avatarUrl: "🐻",
  stickers: [
    {
      id: "us-f2-01",
      userId: "user-friend-2",
      stickerMasterId: "sm-03",
      sticker: MOCK_STICKER_MASTERS[2], // オーロラスター (ダブり)
      quantity: 2,
      isTradeable: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "us-f2-02",
      userId: "user-friend-2",
      stickerMasterId: "sm-04",
      sticker: MOCK_STICKER_MASTERS[3], // ハニーレモン
      quantity: 1,
      isTradeable: false,
      updatedAt: new Date().toISOString(),
    },
  ],
};
