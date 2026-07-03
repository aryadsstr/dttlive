import { prisma } from "@/lib/prisma";
import { registerTikTokHandler } from "@/server/tiktok/dispatcher";
import { emitToUser, emitToOverlay } from "@/server/socket/socketServer";

function parseBid(comment?: string) {
  if (!comment) return null;

  const text = comment.trim().toLowerCase();
  if (!text.startsWith("!")) return null;

  const numberText = text.replace("!", "").replace(/[^0-9]/g, "");
  const number = Number(numberText);

  if (!number || number <= 0) return null;

  return number * 1000;
}

function isMemberClub(event: any) {
  if (event.isMember) return true;

  const data = event.raw as any;
  const badges = Array.isArray(data?.user?.badges) ? data.user.badges : [];

  return badges.some((badge: any) => {
    const url = String(badge?.url || "").toLowerCase();
    return url.includes("fans_badge") || url.includes("fans");
  });
}

export function registerAuctionService() {
  registerTikTokHandler(async ({ userId, event }) => {
    if (event.type !== "chat") return;

    const bidAmount = parseBid(event.comment);
    if (!bidAmount) return;

    const auction = await prisma.auction.findFirst({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!auction) return;

    const isMember = isMemberClub(event);
    const gifterLevel = Number(event.gifterLevel || 0);

    const hasMemberRule = auction.memberOnly;
    const hasLevelRule = auction.minimumGifterLevel > 0;

    if (hasMemberRule || hasLevelRule) {
      const passedMemberRule = hasMemberRule && isMember;
      const passedLevelRule =
        hasLevelRule && gifterLevel >= auction.minimumGifterLevel;

      if (!passedMemberRule && !passedLevelRule) {
        return;
      }
    }

    const currentBid = auction.highestBid || 0;
    const minimumBid =
      currentBid <= 0 ? auction.openBid : currentBid + auction.bidStep;

    if (bidAmount < minimumBid) return;

    if (auction.bidStep > 0 && bidAmount > auction.openBid) {
      const base = currentBid <= 0 ? auction.openBid : currentBid;
      const diff = bidAmount - base;

      if (diff % auction.bidStep !== 0) return;
    }

    const reachedBin = Boolean(
      auction.binPrice && bidAmount >= auction.binPrice
    );

    const finalBid = bidAmount;

    const updatedAuction = await prisma.auction.update({
      where: {
        id: auction.id,
      },
      data: {
        highestBid: finalBid,
        highestBidder: event.nickname || event.username || "Unknown",
        highestBidderAvatar: event.avatar,
        active: reachedBin ? false : true,
      },
    });

    await prisma.bidder.upsert({
      where: {
        auctionId_username: {
          auctionId: auction.id,
          username: event.username || event.userId || "unknown",
        },
      },
      update: {
        nickname: event.nickname,
        avatar: event.avatar,
        bid: finalBid,
      },
      create: {
        auctionId: auction.id,
        username: event.username || event.userId || "unknown",
        nickname: event.nickname,
        avatar: event.avatar,
        bid: finalBid,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { overlayToken: true },
    });

    const lastBid = {
      username: event.username,
      nickname: event.nickname,
      avatar: event.avatar,
      bid: finalBid,
    };

    emitToUser(userId, "auction:update", {
      auction: updatedAuction,
      lastBid,
    });

    if (user) {
      emitToOverlay("auction", user.overlayToken, "auction:update", {
        auction: updatedAuction,
        lastBid,
      });
    }

    if (reachedBin) {
      await prisma.winner.create({
        data: {
          auctionId: auction.id,
          userId,
          winner: event.nickname || event.username || "Unknown",
          bid: finalBid,
          itemName: auction.itemName,
          avatar: event.avatar,
        },
      });

      emitToUser(userId, "auction:stop", {
        auction: updatedAuction,
        reason: "BIN_REACHED",
      });

      if (user) {
        emitToOverlay("auction", user.overlayToken, "auction:stop", {
          auction: updatedAuction,
          reason: "BIN_REACHED",
        });
      }
    }
  });
}