"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  UserSticker,
  StickerMaster,
  TradeProposal,
  GiftMessage,
  MotifType,
  FinishType,
} from "@/types";
import {
  INITIAL_MY_PROFILE,
  MOCK_FRIEND_YUI,
  MOCK_FRIEND_AOI,
  MOCK_STICKER_MASTERS,
} from "@/lib/mockData";

interface StickerContextType {
  myProfile: UserProfile;
  friends: UserProfile[];
  masters: StickerMaster[];
  proposals: TradeProposal[];
  giftMessages: GiftMessage[];
  updateProfile: (username: string, avatarUrl: string) => void;
  updateStickerQuantity: (stickerMasterId: string, delta: number) => void;
  toggleTradeable: (stickerMasterId: string) => void;
  toggleWishlist: (stickerMasterId: string) => void;
  addStickerFromDraft: (draft: {
    name: string;
    series: string;
    motif: MotifType;
    color: string;
    finishType: FinishType;
    quantity: number;
    userPhotoUrl?: string;
    catalogCode?: string;
  }) => void;
  addFriendByCode: (friendCode: string) => boolean;
  createTradeProposal: (
    friendId: string,
    offeredMasterId: string,
    requestedMasterId: string
  ) => void;
  acceptTradeProposal: (proposalId: string) => boolean;
  sendGift: (friendId: string, stickerMasterId: string, message: string) => boolean;
  openGift: (giftId: string) => void;
  exportBackup: () => string;
  importBackup: (jsonString: string) => boolean;
  resetToDefault: () => void;
}

const StickerContext = createContext<StickerContextType | undefined>(undefined);

export const StickerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [myProfile, setMyProfile] = useState<UserProfile>(INITIAL_MY_PROFILE);
  const [friends, setFriends] = useState<UserProfile[]>([
    MOCK_FRIEND_YUI,
    MOCK_FRIEND_AOI,
  ]);
  const [masters, setMasters] = useState<StickerMaster[]>(MOCK_STICKER_MASTERS);

  // 初期ギフトメッセージ (あおいちゃんから届いているプレゼント)
  const [giftMessages, setGiftMessages] = useState<GiftMessage[]>([
    {
      id: "gift-demo-1",
      senderId: MOCK_FRIEND_AOI.id,
      senderUsername: MOCK_FRIEND_AOI.username,
      senderAvatar: MOCK_FRIEND_AOI.avatarUrl,
      receiverId: INITIAL_MY_PROFILE.id,
      stickerMaster: MOCK_STICKER_MASTERS[2], // オーロラスター
      message: "いつもシール帳見せてくれてありがとう！ダブったからプレゼントするね🎁✨",
      status: "UNOPENED",
      createdAt: new Date().toISOString(),
    },
  ]);

  // ギフトの送信
  const sendGift = (
    friendId: string,
    stickerMasterId: string,
    message: string
  ): boolean => {
    const friend = friends.find((f) => f.id === friendId);
    const master = masters.find((m) => m.id === stickerMasterId);
    if (!friend || !master) return false;

    // 送信者の在庫チェック（未所持または数量0の場合はプレゼント不可）
    const mySticker = myProfile.stickers.find(
      (s) => s.stickerMasterId === stickerMasterId
    );
    if (!mySticker || mySticker.quantity <= 0) {
      console.warn("所持していないシールはプレゼントできません");
      return false;
    }

    // 自分の所持数を-1
    updateStickerQuantity(stickerMasterId, -1);

    // ギフトメッセージを作成
    const newGift: GiftMessage = {
      id: `gift-${Date.now()}`,
      senderId: myProfile.id,
      senderUsername: myProfile.username,
      senderAvatar: myProfile.avatarUrl,
      receiverId: friend.id,
      stickerMaster: master,
      message: message.trim() || "プレゼントだよ！喜んでくれるといいな✨",
      status: "UNOPENED",
      createdAt: new Date().toISOString(),
    };

    setGiftMessages((prev) => [newGift, ...prev]);

    // フレンド側のシール帳にもプレゼント反映（相手のシミュレーション）
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          const exists = f.stickers.some((s) => s.stickerMasterId === stickerMasterId);
          if (exists) {
            return {
              ...f,
              stickers: f.stickers.map((s) =>
                s.stickerMasterId === stickerMasterId
                  ? {
                      ...s,
                      quantity: s.quantity + 1,
                      isTradeable: s.quantity + 1 >= 2,
                    }
                  : s
              ),
            };
          } else {
            return {
              ...f,
              stickers: [
                ...f.stickers,
                {
                  id: `us-f-gift-${Date.now()}`,
                  userId: f.id,
                  stickerMasterId: master.id,
                  sticker: master,
                  quantity: 1,
                  isTradeable: false,
                  updatedAt: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return f;
      })
    );

    return true;
  };

  // ギフトの開封・受け取り
  const openGift = (giftId: string) => {
    const gift = giftMessages.find((g) => g.id === giftId);
    if (!gift || gift.status !== "UNOPENED") return;

    // 開封済みに更新
    setGiftMessages((prev) =>
      prev.map((g) => (g.id === giftId ? { ...g, status: "OPENED" } : g))
    );

    // 自分のシール帳に1枚追加
    updateStickerQuantity(gift.stickerMaster.id, 1);

    // 獲得したシールが自分の欲しいものリストにあったら自動消化（除外）
    setMyProfile((prev) => {
      const wishlist = prev.wishlistMasterIds || [];
      if (wishlist.includes(gift.stickerMaster.id)) {
        return {
          ...prev,
          wishlistMasterIds: wishlist.filter((id) => id !== gift.stickerMaster.id),
        };
      }
      return prev;
    });
  };
  const [proposals, setProposals] = useState<TradeProposal[]>([
    {
      id: "prop-demo-1",
      requesterId: MOCK_FRIEND_YUI.id,
      receiverId: INITIAL_MY_PROFILE.id,
      requesterUsername: MOCK_FRIEND_YUI.username,
      receiverUsername: INITIAL_MY_PROFILE.username,
      offeredStickerMasterId: "sm-06", // ミントうさぎ
      offeredSticker: MOCK_STICKER_MASTERS[5],
      requestedStickerMasterId: "sm-01", // いちごドロップ
      requestedSticker: MOCK_STICKER_MASTERS[0],
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Wishlistトグル
  const toggleWishlist = (stickerMasterId: string) => {
    setMyProfile((prev) => {
      const currentList = prev.wishlistMasterIds || [];
      const exists = currentList.includes(stickerMasterId);
      const updated = exists
        ? currentList.filter((id) => id !== stickerMasterId)
        : [...currentList, stickerMasterId];
      return {
        ...prev,
        wishlistMasterIds: updated,
      };
    });
  };

  // トレード提案の新規作成
  const createTradeProposal = (
    friendId: string,
    offeredMasterId: string,
    requestedMasterId: string
  ) => {
    const friend = friends.find((f) => f.id === friendId);
    const offered = masters.find((m) => m.id === offeredMasterId);
    const requested = masters.find((m) => m.id === requestedMasterId);
    if (!friend || !offered || !requested) return;

    const newProposal: TradeProposal = {
      id: `prop-${Date.now()}`,
      requesterId: myProfile.id,
      receiverId: friend.id,
      requesterUsername: myProfile.username,
      receiverUsername: friend.username,
      offeredStickerMasterId: offered.id,
      offeredSticker: offered,
      requestedStickerMasterId: requested.id,
      requestedSticker: requested,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    setProposals((prev) => [newProposal, ...prev]);
  };

  // データのエクスポート (JSON文字列)
  const exportBackup = () => {
    const backupObj = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      myProfile,
      friends,
      masters,
      proposals,
      giftMessages,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  // データのインポート (復元)
  const importBackup = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.myProfile) setMyProfile(data.myProfile);
      if (data.friends) setFriends(data.friends);
      if (data.masters) setMasters(data.masters);
      if (data.proposals) setProposals(data.proposals);
      if (data.giftMessages) setGiftMessages(data.giftMessages);
      return true;
    } catch (e) {
      console.error("Failed to import backup data", e);
      return false;
    }
  };

  // 初期データへのリセット
  const resetToDefault = () => {
    localStorage.removeItem("bondro_my_profile");
    setMyProfile(INITIAL_MY_PROFILE);
    setFriends([MOCK_FRIEND_YUI, MOCK_FRIEND_AOI]);
    setMasters(MOCK_STICKER_MASTERS);
  };
  const acceptTradeProposal = (proposalId: string): boolean => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "PENDING") return false;

    // 自分が receiver の場合: offered を受け取り、requested を渡す
    if (proposal.receiverId === myProfile.id) {
      // 渡すシールの在庫チェック
      const myRequestedSticker = myProfile.stickers.find(
        (s) => s.stickerMasterId === proposal.requestedStickerMasterId
      );
      if (!myRequestedSticker || myRequestedSticker.quantity <= 0) {
        console.warn("渡す対象のシールを所持していないためトレードを成立できません");
        return false;
      }

      // 提案ステータスをACCEPTEDに更新
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: "ACCEPTED" } : p))
      );

      updateStickerQuantity(proposal.offeredStickerMasterId, 1);
      updateStickerQuantity(proposal.requestedStickerMasterId, -1);

      // 獲得したシールが自分の欲しいものリストにあれば自動消化
      setMyProfile((prev) => {
        const wishlist = prev.wishlistMasterIds || [];
        if (wishlist.includes(proposal.offeredStickerMasterId)) {
          return {
            ...prev,
            wishlistMasterIds: wishlist.filter(
              (id) => id !== proposal.offeredStickerMasterId
            ),
          };
        }
        return prev;
      });

      // フレンド側のステートも更新
      setFriends((prev) =>
        prev.map((f) => {
          if (f.id === proposal.requesterId) {
            // フレンドは requested を受け取り、offered を渡す (-1)
            const updatedStickers = f.stickers
              .map((s) => {
                if (s.stickerMasterId === proposal.offeredStickerMasterId) {
                  const newQty = Math.max(0, s.quantity - 1);
                  return {
                    ...s,
                    quantity: newQty,
                    isTradeable: newQty >= 2 ? s.isTradeable : false,
                  };
                }
                return s;
              })
              .filter((s) => s.quantity > 0); // 0枚になったら除外

            // フレンドに requested が無ければ追加、あれば+1
            const hasRequested = updatedStickers.some(
              (s) => s.stickerMasterId === proposal.requestedStickerMasterId
            );
            if (hasRequested) {
              return {
                ...f,
                stickers: updatedStickers.map((s) =>
                  s.stickerMasterId === proposal.requestedStickerMasterId
                    ? {
                        ...s,
                        quantity: s.quantity + 1,
                        isTradeable: s.quantity + 1 >= 2,
                      }
                    : s
                ),
              };
            } else {
              const reqMaster = masters.find(
                (m) => m.id === proposal.requestedStickerMasterId
              );
              if (!reqMaster) return { ...f, stickers: updatedStickers };
              return {
                ...f,
                stickers: [
                  ...updatedStickers,
                  {
                    id: `us-f-trade-${Date.now()}`,
                    userId: f.id,
                    stickerMasterId: reqMaster.id,
                    sticker: reqMaster,
                    quantity: 1,
                    isTradeable: false,
                    updatedAt: new Date().toISOString(),
                  },
                ],
              };
            }
          }
          return f;
        })
      );
      return true;
    }
    return false;
  };

  // ローカルストレージからの永続化復元（あれば）
  useEffect(() => {
    const saved = localStorage.getItem("bondro_my_profile");
    if (saved) {
      try {
        setMyProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    } else {
      // 初回訪問時: ランダムな一意のフレンドコードを自動発行
      const randomCode = `BON-${Math.floor(1000 + Math.random() * 9000)}`;
      setMyProfile((prev) => ({
        ...prev,
        username: "わたし",
        friendCode: randomCode,
      }));
    }
  }, []);

  // プロフィール更新 (ニックネーム・アバター変更)
  const updateProfile = (username: string, avatarUrl: string) => {
    setMyProfile((prev) => {
      const updated = {
        ...prev,
        username: username.trim() || prev.username,
        avatarUrl: avatarUrl || prev.avatarUrl,
      };
      localStorage.setItem("bondro_my_profile", JSON.stringify(updated));
      return updated;
    });
  };

  // 状態変更時のローカル保存
  useEffect(() => {
    localStorage.setItem("bondro_my_profile", JSON.stringify(myProfile));
  }, [myProfile]);

  // 枚数増減処理
  const updateStickerQuantity = (stickerMasterId: string, delta: number) => {
    setMyProfile((prev) => {
      const existing = prev.stickers.find(
        (s) => s.stickerMasterId === stickerMasterId
      );

      let newStickers: UserSticker[];
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) {
          // 所持数が0になったら削除（または未所持扱い）
          newStickers = prev.stickers.filter(
            (s) => s.stickerMasterId !== stickerMasterId
          );
        } else {
          newStickers = prev.stickers.map((s) => {
            if (s.stickerMasterId === stickerMasterId) {
              const wasDuplicate = s.quantity >= 2;
              const willBeDuplicate = newQty >= 2;
              return {
                ...s,
                quantity: newQty,
                // 初めて2枚以上になったらデフォルトで交換可能にする
                isTradeable: willBeDuplicate
                  ? (wasDuplicate ? s.isTradeable : true)
                  : false,
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });
        }
      } else if (delta > 0) {
        // 新規登録
        const master = masters.find((m) => m.id === stickerMasterId);
        if (!master) return prev;
        const newSticker: UserSticker = {
          id: `us-${Date.now()}`,
          userId: prev.id,
          stickerMasterId: master.id,
          sticker: master,
          quantity: delta,
          isTradeable: delta >= 2,
          updatedAt: new Date().toISOString(),
        };
        newStickers = [...prev.stickers, newSticker];
      } else {
        return prev;
      }

      return {
        ...prev,
        stickers: newStickers,
      };
    });
  };

  // トレード可能フラグのトグル
  const toggleTradeable = (stickerMasterId: string) => {
    setMyProfile((prev) => ({
      ...prev,
      stickers: prev.stickers.map((s) =>
        s.stickerMasterId === stickerMasterId
          ? { ...s, isTradeable: !s.isTradeable }
          : s
      ),
    }));
  };

  // 写真認識ドラフトから新規シールを追加
  const addStickerFromDraft = (draft: {
    name: string;
    series: string;
    motif: MotifType;
    color: string;
    finishType: FinishType;
    quantity: number;
    userPhotoUrl?: string;
    catalogCode?: string;
  }) => {
    // 市販カタログコードがある場合は最優先で公式マスターに紐付け
    let master: StickerMaster | undefined;
    if (draft.catalogCode && draft.catalogCode !== "CUSTOM") {
      master = masters.find((m) => m.code === draft.catalogCode);
    }
    if (!master) {
      master = masters.find(
        (m) => m.name.toLowerCase() === draft.name.toLowerCase()
      );
    }
    if (!master) {
      master = {
        id: `sm-${Date.now()}`,
        code: draft.catalogCode || "CUSTOM",
        name: draft.name,
        seriesName: draft.series || "マイオリジナル",
        motif: draft.motif || "スイーツ",
        color: draft.color || "#FF69B4",
        finishType: draft.finishType || "クリアドロップ",
        rarity: "ノーマル",
      };
      setMasters((prev) => [...prev, master!]);
    }

    setMyProfile((prev) => {
      const existing = prev.stickers.find(
        (s) => s.stickerMasterId === master!.id
      );

      if (existing) {
        return {
          ...prev,
          stickers: prev.stickers.map((s) =>
            s.stickerMasterId === master!.id
              ? {
                  ...s,
                  quantity: s.quantity + draft.quantity,
                  userPhotoUrl: draft.userPhotoUrl || s.userPhotoUrl,
                  isTradeable: (s.quantity + draft.quantity) >= 2,
                }
              : s
          ),
        };
      } else {
        const newSticker: UserSticker = {
          id: `us-${Date.now()}`,
          userId: prev.id,
          stickerMasterId: master!.id,
          sticker: master!,
          quantity: draft.quantity,
          isTradeable: draft.quantity >= 2,
          userPhotoUrl: draft.userPhotoUrl,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...prev,
          stickers: [...prev.stickers, newSticker],
        };
      }
    });
  };

  // フレンドコードでフレンド追加
  const addFriendByCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === myProfile.friendCode) return false;
    // 既に登録済みかチェック
    if (friends.some((f) => f.friendCode === trimmed)) return true;

    // モックフレンドから一致を検索
    if (trimmed === MOCK_FRIEND_YUI.friendCode) {
      setFriends((prev) => [...prev, MOCK_FRIEND_YUI]);
      return true;
    }
    if (trimmed === MOCK_FRIEND_AOI.friendCode) {
      setFriends((prev) => [...prev, MOCK_FRIEND_AOI]);
      return true;
    }

    // デモ用新規フレンド自動生成
    const newFriend: UserProfile = {
      id: `user-${Date.now()}`,
      username: `フレンド (${trimmed})`,
      friendCode: trimmed,
      avatarUrl: "🎀",
      stickers: [
        {
          id: `us-demo-${Date.now()}`,
          userId: `user-${Date.now()}`,
          stickerMasterId: masters[0].id,
          sticker: masters[0],
          quantity: 1,
          isTradeable: false,
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    setFriends((prev) => [...prev, newFriend]);
    return true;
  };

  return (
    <StickerContext.Provider
      value={{
        myProfile,
        friends,
        masters,
        proposals,
        giftMessages,
        updateProfile,
        updateStickerQuantity,
        toggleTradeable,
        toggleWishlist,
        addStickerFromDraft,
        addFriendByCode,
        createTradeProposal,
        acceptTradeProposal,
        sendGift,
        openGift,
        exportBackup,
        importBackup,
        resetToDefault,
      }}
    >
      {children}
    </StickerContext.Provider>
  );
};

export const useStickers = () => {
  const context = useContext(StickerContext);
  if (!context) {
    throw new Error("useStickers must be used within a StickerProvider");
  }
  return context;
};
