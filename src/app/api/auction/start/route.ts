import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { userHasFeature } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { emitToOverlay, emitToUser } from "@/server/socket/socketServer";

export async function POST(req: Request) {
    const user = await getAuthUser();

    if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const allowed = await userHasFeature(user.id, "auction.manage");

    if (!allowed) {
    return NextResponse.json({ success: false, message: "Fitur auction belum aktif" }, { status: 403 });
    }

    const body = await req.json();

    const itemName = String(body.itemName || "").trim();
    const duration = Number(body.duration || 60);
    const memberOnly = Boolean(body.memberOnly);
    const openBid = Number(body.openBid || 1000);
    const bidStep = Number(body.bidStep || 1000);
    const binPrice = body.binPrice ? Number(body.binPrice) : null;
    const minimumGifterLevel = Number(body.minimumGifterLevel || 0);

    if (minimumGifterLevel <= 0 || minimumGifterLevel > 50) {
        return NextResponse.json(
            { success: false, message: "Minimum gifter level harus 0 - 50" },
            { status: 400 }
        );
    }


    if (!itemName) {
        return NextResponse.json({ success: false, message: "Nama item wajib diisi" }, { status: 400 });
    }

    if (openBid <= 0) {
        return NextResponse.json(
            { success: false, message: "Open bid harus lebih dari 0" },
            { status: 400 }
        );
    }

    if (bidStep <= 0) {
        return NextResponse.json(
            { success: false, message: "Kelipatan bid harus lebih dari 0" },
            { status: 400 }
        );
    }

    if (binPrice && binPrice <= openBid) {
        return NextResponse.json(
            { success: false, message: "BIN harus lebih besar dari open bid" },
            { status: 400 }
        );
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

    const auction = await prisma.auction.create({
        data: {
            userId: user.id,
            itemName,
            active: true,
            highestBid: 0,
            endTime: new Date(Date.now() + duration * 1000),

            memberOnly,
            openBid,
            bidStep,
            binPrice,
            minimumGifterLevel
        },
    });

    const payload = { auction };

    emitToUser(user.id, "auction:update", payload);
    emitToOverlay("auction", user.overlayToken, "auction:update", payload);

    return NextResponse.json({
        success: true,
        message: "Auction dimulai",
        auction,
    });
}