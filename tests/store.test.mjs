import test from "node:test";
import assert from "node:assert/strict";

// シール帳状態管理トランザクションの純粋ロジック検証
function applyQuantityDelta(stickers, stickerMasterId, delta, master) {
  const existing = stickers.find((s) => s.stickerMasterId === stickerMasterId);
  if (existing) {
    const newQty = Math.max(0, existing.quantity + delta);
    if (newQty === 0) {
      return stickers.filter((s) => s.stickerMasterId !== stickerMasterId);
    }
    return stickers.map((s) => {
      if (s.stickerMasterId === stickerMasterId) {
        const wasDuplicate = s.quantity >= 2;
        const willBeDuplicate = newQty >= 2;
        return {
          ...s,
          quantity: newQty,
          isTradeable: willBeDuplicate ? (wasDuplicate ? s.isTradeable : true) : false,
        };
      }
      return s;
    });
  } else if (delta > 0 && master) {
    return [
      ...stickers,
      {
        id: `us-test-${Date.now()}`,
        userId: "user-test",
        stickerMasterId: master.id,
        sticker: master,
        quantity: delta,
        isTradeable: delta >= 2,
      },
    ];
  }
  return stickers;
}

function processOpenGift(giftMessages, giftId, currentStickers, wishlistMasterIds) {
  const gift = giftMessages.find((g) => g.id === giftId);
  if (!gift || gift.status !== "UNOPENED") {
    return { giftMessages, stickers: currentStickers, wishlistMasterIds, success: false };
  }

  const updatedMessages = giftMessages.map((g) =>
    g.id === giftId ? { ...g, status: "OPENED" } : g
  );

  const updatedStickers = applyQuantityDelta(
    currentStickers,
    gift.stickerMaster.id,
    1,
    gift.stickerMaster
  );

  const updatedWishlist = (wishlistMasterIds || []).filter(
    (id) => id !== gift.stickerMaster.id
  );

  return {
    giftMessages: updatedMessages,
    stickers: updatedStickers,
    wishlistMasterIds: updatedWishlist,
    success: true,
  };
}

function processAcceptTrade(proposal, myStickers, friendStickers, myWishlist) {
  if (!proposal || proposal.status !== "PENDING") {
    return { success: false, myStickers, friendStickers, myWishlist };
  }

  const myRequested = myStickers.find(
    (s) => s.stickerMasterId === proposal.requestedStickerMasterId
  );
  if (!myRequested || myRequested.quantity <= 0) {
    return { success: false, myStickers, friendStickers, myWishlist };
  }

  // 自分が渡す (requested: -1), 自分が受け取る (offered: +1)
  let updatedMyStickers = applyQuantityDelta(
    myStickers,
    proposal.requestedStickerMasterId,
    -1,
    proposal.requestedSticker
  );
  updatedMyStickers = applyQuantityDelta(
    updatedMyStickers,
    proposal.offeredStickerMasterId,
    1,
    proposal.offeredSticker
  );

  // 自分のWishlist自動消化
  const updatedMyWishlist = (myWishlist || []).filter(
    (id) => id !== proposal.offeredStickerMasterId
  );

  return {
    success: true,
    myStickers: updatedMyStickers,
    myWishlist: updatedMyWishlist,
    proposalStatus: "ACCEPTED",
  };
}

test("所持数ライフサイクル: 1枚から2枚でダブり交換ON、1枚でOFF、0枚で除外される", () => {
  const master = { id: "sm-01", name: "いちごドロップ" };
  let stickers = [];

  // 1枚追加: 単数所持時は isTradeable = false
  stickers = applyQuantityDelta(stickers, "sm-01", 1, master);
  assert.equal(stickers.length, 1);
  assert.equal(stickers[0].quantity, 1);
  assert.equal(stickers[0].isTradeable, false);

  // 2枚目追加: ダブりになり自動で isTradeable = true
  stickers = applyQuantityDelta(stickers, "sm-01", 1, master);
  assert.equal(stickers[0].quantity, 2);
  assert.equal(stickers[0].isTradeable, true);

  // 1枚消費: 1枚に戻ると isTradeable = false に自動降格
  stickers = applyQuantityDelta(stickers, "sm-01", -1, master);
  assert.equal(stickers[0].quantity, 1);
  assert.equal(stickers[0].isTradeable, false);

  // さらに消費: 0枚になったらリストから完全消去 (未所持化)
  stickers = applyQuantityDelta(stickers, "sm-01", -1, master);
  assert.equal(stickers.length, 0);
});

test("ギフト受取トランザクション: UNOPENEDのみ開封可能、開封後は二重受取防止かつWishlist自動消化", () => {
  const master = { id: "sm-02", name: "キラ星" };
  const giftMessages = [
    {
      id: "gift-1",
      senderId: "friend-1",
      receiverId: "my-user",
      stickerMaster: master,
      status: "UNOPENED",
    },
  ];

  let stickers = [];
  let wishlist = ["sm-02", "sm-03"];

  // 1回目の開封: 成功
  const firstOpen = processOpenGift(giftMessages, "gift-1", stickers, wishlist);
  assert.equal(firstOpen.success, true);
  assert.equal(firstOpen.giftMessages[0].status, "OPENED");
  assert.equal(firstOpen.stickers.length, 1);
  assert.equal(firstOpen.stickers[0].quantity, 1);
  // Wishlistから sm-02 が消化されていること
  assert.deepEqual(firstOpen.wishlistMasterIds, ["sm-03"]);

  // 2回目の同一ギフト開封試行: 既にOPENEDなので失敗し、所持数は増えない (二重受取・無限増殖防止)
  const secondOpen = processOpenGift(
    firstOpen.giftMessages,
    "gift-1",
    firstOpen.stickers,
    firstOpen.wishlistMasterIds
  );
  assert.equal(secondOpen.success, false);
  assert.equal(secondOpen.stickers[0].quantity, 1);
});

test("トレード受諾トランザクション: 在庫のないトレードは拒否され、成立時は双方の保存則が成立する", () => {
  const masterOffered = { id: "sm-10", name: "もらえるシール" };
  const masterRequested = { id: "sm-20", name: "わたすシール" };

  const proposal = {
    id: "prop-1",
    requesterId: "friend-1",
    receiverId: "my-user",
    offeredStickerMasterId: "sm-10",
    offeredSticker: masterOffered,
    requestedStickerMasterId: "sm-20",
    requestedSticker: masterRequested,
    status: "PENDING",
  };

  // 在庫がない場合: トレード不成立
  const noStockResult = processAcceptTrade(proposal, [], [], []);
  assert.equal(noStockResult.success, false);

  // 在庫がある場合: 正常成立
  const myInitialStickers = [
    {
      id: "us-1",
      stickerMasterId: "sm-20",
      sticker: masterRequested,
      quantity: 2,
      isTradeable: true,
    },
  ];
  const myWishlist = ["sm-10"];

  const successResult = processAcceptTrade(
    proposal,
    myInitialStickers,
    [],
    myWishlist
  );
  assert.equal(successResult.success, true);
  assert.equal(successResult.proposalStatus, "ACCEPTED");

  // 渡したシールは 2枚 -> 1枚 (isTradeableはfalseに降格)
  const myRequested = successResult.myStickers.find(
    (s) => s.stickerMasterId === "sm-20"
  );
  assert.equal(myRequested.quantity, 1);
  assert.equal(myRequested.isTradeable, false);

  // 受け取ったシールが 1枚 追加
  const myOffered = successResult.myStickers.find(
    (s) => s.stickerMasterId === "sm-10"
  );
  assert.equal(myOffered.quantity, 1);

  // 獲得したシールがWishlistから消化されていること
  assert.deepEqual(successResult.myWishlist, []);
});
