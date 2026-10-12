import test from "node:test";
import assert from "node:assert/strict";
import { findGiftableStickers, calculateTradeMatch } from "../src/lib/matcher.ts";

test("Gift Finder: 相手のWishlistに含まれるプレゼント候補を最優先としてソートする", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 2, isTradeable: true }, // 通常の余り
      { id: "us-2", userId: "user-1", stickerMasterId: "s2", quantity: 3, isTradeable: true }, // 相手のWishlist登録済み
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [],
    wishlistMasterIds: ["s2"],
  };

  const giftable = findGiftableStickers(me, friend);
  assert.equal(giftable.length, 2);
  assert.equal(giftable[0].userSticker.stickerMasterId, "s2");
  assert.equal(giftable[0].isWishlistMatch, true);
  assert.equal(giftable[1].isWishlistMatch, false);
});

test("Gift Finder: 相手が既に持っているシールはプレゼント候補から除外される", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 3, isTradeable: true },
      { id: "us-2", userId: "user-1", stickerMasterId: "s2", quantity: 2, isTradeable: true },
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [
      { id: "us-f1", userId: "user-2", stickerMasterId: "s1", quantity: 1, isTradeable: false }, // 既に所持
    ],
  };

  const giftable = findGiftableStickers(me, friend);
  assert.equal(giftable.length, 1);
  assert.equal(giftable[0].userSticker.stickerMasterId, "s2");
});

test("Smart Trade Matcher: 双方がダブりかつ相手の未所持シールを持っている場合に相互交換成立と判定する", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 2, isTradeable: true },
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [
      { id: "us-2", userId: "user-2", stickerMasterId: "s2", quantity: 2, isTradeable: true },
    ],
  };

  const match = calculateTradeMatch(me, friend);
  assert.equal(match.isMutualMatch, true);
  assert.equal(match.canGiveToFriend[0].stickerMasterId, "s1");
  assert.equal(match.canReceiveFromFriend[0].stickerMasterId, "s2");
});

test("Smart Trade Matcher: 片方のみが提供可能な場合は isMutualMatch: false となる", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 2, isTradeable: true },
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [], // フレンドはダブりなし
  };

  const match = calculateTradeMatch(me, friend);
  assert.equal(match.isMutualMatch, false);
  assert.equal(match.canGiveToFriend.length, 1);
  assert.equal(match.canReceiveFromFriend.length, 0);
});

test("Smart Trade Matcher: 相手から貰えるものも自分のWishlistが最優先でソートされる (対称性検証)", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [],
    wishlistMasterIds: ["s3"],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [
      { id: "us-2", userId: "user-2", stickerMasterId: "s2", quantity: 2, isTradeable: true },
      { id: "us-3", userId: "user-2", stickerMasterId: "s3", quantity: 2, isTradeable: true }, // 私のWishlist
    ],
  };

  const match = calculateTradeMatch(me, friend);
  assert.equal(match.canReceiveFromFriend.length, 2);
  // 自分のWishlistである s3 が先頭に来る
  assert.equal(match.canReceiveFromFriend[0].stickerMasterId, "s3");
});

test("境界値: ダブっていても isTradeable が false の場合はプレゼント・交換対象外", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 5, isTradeable: false }, // お気に入りロック中
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [],
  };

  const giftable = findGiftableStickers(me, friend);
  assert.equal(giftable.length, 0);
});

test("境界値: 1枚のみ (quantity=1) の場合はダブりではないため除外", () => {
  const me = {
    id: "user-1",
    name: "みく",
    friendCode: "MIKU-001",
    stickers: [
      { id: "us-1", userId: "user-1", stickerMasterId: "s1", quantity: 1, isTradeable: true },
    ],
  };

  const friend = {
    id: "user-2",
    name: "ゆうき",
    friendCode: "YUKI-002",
    stickers: [],
  };

  const giftable = findGiftableStickers(me, friend);
  assert.equal(giftable.length, 0);
});

test("境界値: stickers や wishlistMasterIds が undefined の場合でも例外クラッシュしない", () => {
  const me = { id: "user-1", name: "みく", friendCode: "MIKU-001" };
  const friend = { id: "user-2", name: "ゆうき", friendCode: "YUKI-002" };

  const giftable = findGiftableStickers(me, friend);
  assert.equal(giftable.length, 0);

  const match = calculateTradeMatch(me, friend);
  assert.equal(match.isMutualMatch, false);
  assert.equal(match.canGiveToFriend.length, 0);
  assert.equal(match.canReceiveFromFriend.length, 0);
});
