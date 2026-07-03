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
  const tiktokUsername = String(body.tiktokUsername || "")
    .trim()
    .replace(/^@/, "");

  if (!tiktokUsername) {
    return NextResponse.json(
      { success: false, message: "Username TikTok wajib diisi" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { tiktokUsername },
  });

  return NextResponse.json({
    success: true,
    message: "Username TikTok berhasil disimpan",
    tiktokUsername,
  });
}