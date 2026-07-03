import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userHasFeature } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { emitToOverlay, emitToUser } from "@/server/socket/socketServer";

export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const allowed = await userHasFeature(user.id, "auction.manage");

  if (!allowed) {
    return NextResponse.json({ success: false, message: "Fitur auction belum aktif" }, { status: 403 });
  }

  const auction = await prisma.auction.findFirst({
    where: {
      userId: user.id,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!auction) {
    return NextResponse.json({ success: false, message: "Tidak ada auction aktif" }, { status: 404 });
  }

  const stoppedAuction = await prisma.auction.update({
    where: { id: auction.id },
    data: { active: false },
  });

  if (auction.highestBid > 0 && auction.highestBidder) {
    await prisma.winner.create({
      data: {
        auctionId: auction.id,
        userId: user.id,
        winner: auction.highestBidder,
        bid: auction.highestBid,
        itemName: auction.itemName,
        avatar: auction.highestBidderAvatar,
      },
    });
  }

  const payload = { auction: stoppedAuction };

  emitToUser(user.id, "auction:stop", payload);
  emitToOverlay("auction", user.overlayToken, "auction:stop", payload);

  return NextResponse.json({
    success: true,
    message: "Auction dihentikan",
    auction: stoppedAuction,
  });
}