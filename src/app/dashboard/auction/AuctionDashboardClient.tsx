"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Switch from "@/components/ui/Switch";

type Auction = {
  id: number;
  itemName: string;
  active: boolean;
  highestBid: number;
  highestBidder?: string | null;
  highestBidderAvatar?: string | null;
  endTime?: string | null;
  memberOnly: boolean;
  openBid: number;
  bidStep: number;
  binPrice?: number | null;
  minimumGifterLevel: number;
};

export default function AuctionDashboardClient({ userId }: { userId: number }) {
  const [itemName, setItemName] = useState("");
  const [duration, setDuration] = useState(60);
  const [memberOnly, setMemberOnly] = useState(false);
  const [openBid, setOpenBid] = useState(1);
  const [bidStep, setBidStep] = useState(1);
  const [binPrice, setBinPrice] = useState<number | "">("");

  const [auction, setAuction] = useState<Auction | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimumGifterLevel, setMinimumGifterLevel] = useState(0);

  async function loadActiveAuction() {
    const res = await fetch("/api/auction/active");
    const data = await res.json();

    if (data.success) {
      setAuction(data.auction);
    }
  }

  async function startAuction(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auction/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName,
        duration,
        memberOnly,
        openBid: openBid * 1000,
        bidStep: bidStep * 1000,
        binPrice: binPrice === "" ? null : Number(binPrice) * 1000,
        minimumGifterLevel,
      }),
    });

    const data = await res.json();

    setLoading(false);
    setMessage(data.message || "Selesai");

    if (data.success) {
      setAuction(data.auction);
    }
  }

  async function stopAuction() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auction/stop", {
      method: "POST",
    });

    const data = await res.json();

    setLoading(false);
    setMessage(data.message || "Selesai");

    if (data.success) {
      setAuction(data.auction);
    }
  }

  async function resetAuction() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auction/reset", {
      method: "POST",
    });

    const data = await res.json();

    setLoading(false);
    setMessage(data.message || "Selesai");

    if (data.success) {
      setAuction(null);
    }
  }

  useEffect(() => {
    loadActiveAuction();

    const socket = io({
      query: {
        userId: String(userId),
      },
    });

    socket.on("auction:update", (payload) => {
      setAuction(payload.auction);
    });

    socket.on("auction:stop", (payload) => {
      setAuction(payload.auction);
    });

    socket.on("auction:reset", () => {
      setAuction(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={startAuction}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
      >
        <div>
          <h3 className="text-xl font-semibold">Start Auction</h3>
          <p className="text-sm text-slate-400">
            Viewer bid lewat komentar TikTok: !1 = 1.000, !10 = 10.000.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Nama Item
            </label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="contoh: 3 In 1"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Durasi Detik
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Open Bid
            </label>
            <input
              type="number"
              value={openBid}
              onChange={(e) => setOpenBid(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Kelipatan Bid
            </label>
            <input
              type="number"
              value={bidStep}
              onChange={(e) => setBidStep(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              BIN / Buy It Now
            </label>
            <input
              type="number"
              value={binPrice}
              onChange={(e) =>
                setBinPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="optional"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Minimal Gifter Level
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={minimumGifterLevel}
              onChange={(e) => setMinimumGifterLevel(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
            />
          </div>

          <Switch
            checked={memberOnly}
            onChange={setMemberOnly}
            label="Member Club Only"
            description="Hanya member TikTok Club yang boleh melakukan bid."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            disabled={loading}
            className="rounded-lg bg-pink-600 px-5 py-3 font-semibold hover:bg-pink-700 disabled:opacity-60"
          >
            {loading ? "Loading..." : "Start Auction"}
          </button>

          <button
            type="button"
            onClick={stopAuction}
            disabled={loading || !auction}
            className="rounded-lg bg-yellow-600 px-5 py-3 font-semibold hover:bg-yellow-700 disabled:opacity-50"
          >
            Stop
          </button>

          <button
            type="button"
            onClick={resetAuction}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="text-xl font-semibold">Current Auction</h3>

        {!auction ? (
          <p className="text-sm text-slate-500">Belum ada auction aktif.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Item</p>
              <h4 className="mt-1 text-2xl font-bold">{auction.itemName}</h4>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Highest Bid</p>
              <h4 className="mt-1 text-2xl font-bold text-pink-400">
                {auction.highestBid.toLocaleString("id-ID")}
              </h4>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Highest Bidder</p>
              <h4 className="mt-1 text-2xl font-bold">
                {auction.highestBidder || "-"}
              </h4>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Rules</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>Open Bid: {auction.openBid.toLocaleString("id-ID")}</p>
                <p>Kelipatan: {auction.bidStep.toLocaleString("id-ID")}</p>
                <p>
                  BIN:{" "}
                  {auction.binPrice
                    ? auction.binPrice.toLocaleString("id-ID")
                    : "-"}
                </p>
                <p>Member Only: {auction.memberOnly ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}