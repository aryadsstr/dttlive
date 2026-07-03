import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getTikTokConnectionStatus } from "@/server/tiktok/tiktokManager";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    status: getTikTokConnectionStatus(user.id),
  });
}