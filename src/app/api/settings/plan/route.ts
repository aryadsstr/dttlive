import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const planName = String(body.planName || "").trim();

  const plan = await prisma.plan.findUnique({
    where: { name: planName },
  });

  if (!plan) {
    return NextResponse.json(
      { success: false, message: "Plan tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { planId: plan.id },
  });

  return NextResponse.json({
    success: true,
    message: `Plan berhasil diubah ke ${plan.label}`,
  });
}