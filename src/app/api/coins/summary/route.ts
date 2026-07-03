import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const total = await prisma.coinTransaction.aggregate({
    where: { userId: user.id },
    _sum: {
      coinAmount: true,
      diamondCount: true,
    },
    _count: true,
  });

  const recent = await prisma.coinTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    success: true,
    summary: {
      totalCoins: total._sum.coinAmount || 0,
      totalDiamonds: total._sum.diamondCount || 0,
      totalTransactions: total._count || 0,
    },
    recent,
  });
}