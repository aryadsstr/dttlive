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

  await prisma.auction.updateMany({
    where: {
      userId: user.id,
      active: true,
    },
    data: {
      active: false,
    },
  });

  const payload = { auction: null };

  emitToUser(user.id, "auction:reset", payload);
  emitToOverlay("auction", user.overlayToken, "auction:reset", payload);

  return NextResponse.json({
    success: true,
    message: "Auction direset",
  });
}