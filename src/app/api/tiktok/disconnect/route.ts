import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { disconnectTikTokLive } from "@/server/tiktok/tiktokManager";

export async function POST() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  disconnectTikTokLive(user.id);

  return NextResponse.json({
    success: true,
    message: "TikTok Live disconnected",
  });
}