import { prisma } from "@/lib/prisma";
import { registerTikTokHandler } from "@/server/tiktok/dispatcher";
import { emitToUser, emitToOverlay } from "@/server/socket/socketServer";

export function registerCoinService() {
  registerTikTokHandler(async ({ userId, event }) => {
    if (event.type !== "gift") return;

    const diamondCount = Number(event.diamondCount || 0);
    const repeatCount = Number(event.repeatCount || 1);

    const coinAmount = diamondCount * repeatCount;

    const transaction = await prisma.coinTransaction.create({
      data: {
        userId,
        tiktokUserId: event.userId,
        username: event.username,
        nickname: event.nickname,
        avatar: event.avatar,
        eventType: event.type,
        giftName: event.giftName,
        diamondCount,
        repeatCount,
        coinAmount,
        rawJson: event.raw as object,
      },
    });

    emitToUser(userId, "coins:new", {
      transaction,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { overlayToken: true },
    });

    if (user) {
      emitToOverlay("coins", user.overlayToken, "coins:new", {
        transaction,
      });
    }
  });
}