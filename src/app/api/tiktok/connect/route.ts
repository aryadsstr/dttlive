import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectTikTokLive } from "@/server/tiktok/tiktokManager";

export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!user.tiktokUsername) {
    return NextResponse.json(
      { success: false, message: "Username TikTok belum diset" },
      { status: 400 }
    );
  }

  try {
    const result = await connectTikTokLive({
      userId: user.id,
      tiktokUsername: user.tiktokUsername,
    });

    return NextResponse.json({
      success: true,
      message: `Connected ke @${result.tiktokUsername}`,
    });
  } catch (error) {
    console.error("Connect TikTok error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal connect ke TikTok Live",
      },
      { status: 500 }
    );
  }
}