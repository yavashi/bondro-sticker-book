import type { UserProfile, UserSticker, TradeMatchResult } from "../types";

export interface GiftableStickerItem {
  userSticker: UserSticker;
  isWishlistMatch: boolean; // 相手の「欲しいものリスト」に含まれるか
}

/**
 * ギフト判定 (Gift Finder):
 * ユーザーAがフレンドBにプレゼント可能なシール一覧を計算
 * 条件: Aがダブっており (quantity >= 2) かつ トレード可能 (isTradeable == true) であり、
 *       フレンドBが未所持であるシール
 * ★ 相手のWishlistに含まれるものを最優先ソート
 */
export function findGiftableStickers(
  myProfile: UserProfile,
  friendProfile: UserProfile
): GiftableStickerItem[] {
  const myStickers = myProfile?.stickers || [];
  const friendStickers = friendProfile?.stickers || [];

  const friendOwnedMasterIds = new Set(
    friendStickers
      .filter((s) => s.quantity > 0)
      .map((s) => s.stickerMasterId)
  );

  const friendWishlistIds = new Set(friendProfile?.wishlistMasterIds || []);

  const candidates = myStickers
    .filter((s) => {
      const isDuplicate = s.quantity >= 2;
      const isTradeable = s.isTradeable;
      const friendDoesNotHave = !friendOwnedMasterIds.has(s.stickerMasterId);
      return isDuplicate && isTradeable && friendDoesNotHave;
    })
    .map((s) => ({
      userSticker: s,
      isWishlistMatch: friendWishlistIds.has(s.stickerMasterId),
    }));

  // Wishlist一致を最優先（trueが先頭）にソート
  return candidates.sort((a, b) => (b.isWishlistMatch ? 1 : 0) - (a.isWishlistMatch ? 1 : 0));
}

/**
 * 相互トレードマッチング (Smart Trade Matcher):
 * ユーザーAとフレンドBの双方にとってWin-Winなトレード候補を算出
 * 双方向で findGiftableStickers を呼び出すことで、双方のWishlist最優先ソートを完全に対称適用
 */
export function calculateTradeMatch(
  myProfile: UserProfile,
  friendProfile: UserProfile
): TradeMatchResult {
  // AがBにあげられるもの (Aダブり ∩ B未所持, BのWishlist最優先)
  const canGiveToFriend = findGiftableStickers(myProfile, friendProfile).map(
    (item) => item.userSticker
  );

  // BがAにあげられるもの (Bダブり ∩ A未所持, AのWishlist最優先)
  const canReceiveFromFriend = findGiftableStickers(friendProfile, myProfile).map(
    (item) => item.userSticker
  );

  const isMutualMatch = canGiveToFriend.length > 0 && canReceiveFromFriend.length > 0;

  return {
    friend: friendProfile,
    canGiveToFriend,
    canReceiveFromFriend,
    isMutualMatch,
  };
}
