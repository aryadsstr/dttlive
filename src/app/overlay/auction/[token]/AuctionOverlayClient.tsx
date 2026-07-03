"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

type Auction = {
  itemName: string;
  active: boolean;
  highestBid: number;
  highestBidder?: string | null;
  highestBidderAvatar?: string | null;
  endTime?: string | null;
  openBid: number;
  bidStep: number;
  binPrice?: number | null;
  memberOnly: boolean;
  minimumGifterLevel: number;
};

type LastBid = {
  nickname?: string | null;
  username?: string | null;
  avatar?: string | null;
  bid: number;
};

function formatMoney(value: number) {
  return value.toLocaleString("id-ID");
}

function formatTime(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

export default function AuctionOverlayClient({ token }: { token: string }) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [lastBid, setLastBid] = useState<LastBid | null>(null);
  const [sold, setSold] = useState(false);
  const [flash, setFlash] = useState(false);
  const [now, setNow] = useState(Date.now());

  const remainingMs = useMemo(() => {
    if (!auction?.endTime) return 0;
    return new Date(auction.endTime).getTime() - now;
  }, [auction?.endTime, now]);

  const remainingSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const endingSoon = auction && auction.active && remainingSeconds <= 10;

  const progressToBin =
    auction?.binPrice && auction.binPrice > 0
      ? Math.min(100, Math.round((auction.highestBid / auction.binPrice) * 100))
      : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = io({
      query: {
        overlayToken: token,
        overlayType: "auction",
      },
    });

    socket.on("auction:update", (payload) => {
      setAuction(payload.auction);
      setLastBid(payload.lastBid || null);
      setSold(false);

      setFlash(true);
      setTimeout(() => setFlash(false), 450);
    });

    socket.on("auction:stop", (payload) => {
      setAuction(payload.auction);
      setSold(payload.reason === "BIN_REACHED");
    });

    socket.on("auction:reset", () => {
      setAuction(null);
      setLastBid(null);
      setSold(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center p-8">
      <style>{`
        @keyframes dangerPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.035); filter: brightness(1.45); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        @keyframes glowMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .ending-soon {
          animation: dangerPulse 0.55s infinite, shake 0.9s infinite;
        }

        .glow-bar::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
          animation: glowMove 1.5s infinite;
        }
      `}</style>

      <div
        className={`relative w-[980px] overflow-hidden rounded-[36px] border px-10 py-8 text-center shadow-2xl transition-all duration-300 ${
          flash
            ? "scale-105 border-pink-300 bg-pink-950/95"
            : endingSoon
            ? "ending-soon border-red-400 bg-black/90"
            : "scale-100 border-white/10 bg-black/80"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />

        {!auction ? (
          <>
            <p className="text-sm font-black tracking-[0.4em] text-pink-300">
              LIVE AUCTION
            </p>
            <h1 className="mt-4 text-5xl font-black">
              Belum Ada Auction
            </h1>
            <p className="mt-3 text-slate-300">
              Start auction dari panel admin.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  sold
                    ? "bg-yellow-400"
                    : endingSoon
                    ? "bg-red-500"
                    : "bg-green-400"
                }`}
              />
              <p className="text-sm font-black tracking-[0.4em] text-slate-300">
                {sold
                  ? "SOLD / BIN REACHED"
                  : endingSoon
                  ? "ENDING SOON"
                  : "LIVE AUCTION"}
              </p>
            </div>

            <h1 className="mt-4 text-6xl font-black text-pink-400 drop-shadow">
              {auction.itemName}
            </h1>

            <div className="mt-7 grid grid-cols-[1fr_1.7fr_1fr] gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm font-bold text-slate-400">Top Bidder</p>

                {auction.highestBidderAvatar || lastBid?.avatar ? (
                  <img
                    src={auction.highestBidderAvatar || lastBid?.avatar || ""}
                    alt=""
                    className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-pink-400 object-cover shadow-lg"
                  />
                ) : (
                  <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-400 bg-slate-900 text-4xl">
                    👑
                  </div>
                )}

                <h3 className="mt-4 text-2xl font-black">
                  {auction.highestBidder || "-"}
                </h3>
              </div>

              <div className="rounded-3xl border border-pink-400/40 bg-white/10 p-6">
                <p className="text-sm font-black uppercase tracking-widest text-pink-300">
                  Highest Bid
                </p>
                <h2 className="mt-2 text-8xl font-black text-yellow-300 drop-shadow">
                  {formatMoney(auction.highestBid)}
                </h2>

                <div className="mt-5 rounded-2xl bg-black/40 p-4">
                  <p className="text-sm font-bold text-slate-400">
                    Last Bid
                  </p>
                  <div className="mt-1 flex justify-center gap-5 text-2xl font-black">
                    <span>{lastBid?.nickname || lastBid?.username || "-"}</span>
                    <span className="text-pink-300">
                      {lastBid ? formatMoney(lastBid.bid) : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-left">
                <p className="text-center text-sm font-black uppercase tracking-widest text-pink-300">
                  Rules
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Open Bid</span>
                    <b>{formatMoney(auction.openBid)}</b>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Kelipatan</span>
                    <b>{formatMoney(auction.bidStep)}</b>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">BIN</span>
                    <b>
                      {auction.binPrice ? formatMoney(auction.binPrice) : "-"}
                    </b>
                  </div>

                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">MIN.LV</span>
                    <b>
                      {auction.minimumGifterLevel || "-"}
                    </b>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Member Only</span>
                    <b>{auction.memberOnly ? "YES" : "NO"}</b>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-5">
              <p
                className={`text-sm font-black tracking-[0.35em] ${
                  endingSoon ? "text-red-300" : "text-slate-300"
                }`}
              >
                ENDING IN
              </p>

              <h2
                className={`mt-1 text-7xl font-black ${
                  endingSoon ? "text-red-500" : "text-white"
                }`}
              >
                {formatTime(remainingMs)}
              </h2>

              {endingSoon && (
                <p className="mt-2 text-2xl font-black text-yellow-300">
                  ⚠ AUCTION ENDING SOON ⚠
                </p>
              )}
            </div>

            {auction.binPrice && (
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-300">
                  <span>Target BIN</span>
                  <span>{progressToBin}%</span>
                </div>

                <div className="relative h-5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="glow-bar relative h-full rounded-full bg-gradient-to-r from-pink-500 to-yellow-300"
                    style={{ width: `${progressToBin}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl bg-pink-600/20 px-5 py-3 text-2xl font-black text-pink-200">
              COMMENT DI LIVE: !1 = 1.000 • !10 = 10.000
            </div>
          </>
        )}
      </div>
    </main>
  );
}