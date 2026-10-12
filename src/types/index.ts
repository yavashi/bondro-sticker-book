/**
 * ボンドロシール帳 (BonDrop Sticker Book) 型定義
 * specs/architecture.md のデータモデルに準拠
 */

export type FinishType = 
  | "クリアドロップ" 
  | "ラメ入り" 
  | "オーロラ" 
  | "パール" 
  | "ぷっくりマット";

export type MotifType = 
  | "ハート" 
  | "星" 
  | "スイーツ" 
  | "動物" 
  | "フラワー" 
  | "ジュエリー" 
  | "キャラクター" 
  | "その他";

export interface StickerMaster {
  id: string;
  code?: string;             // 市販カタログ番号 (例: FD-01, YA-03)
  seriesName: string;
  name: string;
  motif: MotifType;
  color: string;
  finishType: FinishType;
  sampleImageUrl?: string;
  rarity?: "ノーマル" | "レア" | "スーパーレア";
}

export interface UserSticker {
  id: string;
  userId: string;
  stickerMasterId: string;
  sticker: StickerMaster;
  quantity: number;          // 所持数 (>= 1)
  isTradeable: boolean;      // トレード可能フラグ (quantity >= 2 の時デフォルト true)
  isWishlist?: boolean;      // 欲しいものリスト
  customNote?: string;
  userPhotoUrl?: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  friendCode: string;
  avatarUrl: string;
  stickers: UserSticker[];
  wishlistMasterIds?: string[]; // 欲しいシールのマスターID
}

export interface TradeProposal {
  id: string;
  requesterId: string;
  receiverId: string;
  requesterUsername: string;
  receiverUsername: string;
  offeredStickerMasterId: string;
  offeredSticker: StickerMaster;
  requestedStickerMasterId: string;
  requestedSticker: StickerMaster;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
}

export interface GiftMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar: string;
  receiverId: string;
  stickerMaster: StickerMaster;
  message: string;
  status: "UNOPENED" | "OPENED";
  createdAt: string;
}

export interface TradeMatchResult {
  friend: UserProfile;
  canGiveToFriend: UserSticker[];  // 自分がダブっていて相手が未所持（プレゼント・提供候補）
  canReceiveFromFriend: UserSticker[]; // 相手がダブっていて自分が未所持
  isMutualMatch: boolean;          // 双方が交換可能
}

export interface RecognizedStickerDraft {
  id: string;
  nameCandidate: string;
  seriesCandidate: string;
  motif: MotifType;
  primaryColor: string;
  finishType: FinishType;
  estimatedCount: number;
  confidenceScore: number;
  croppedImageUrl?: string;
}
