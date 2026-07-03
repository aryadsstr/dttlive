"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type CoinTransaction = {
  nickname?: string | null;
  username?: string | null;
  giftName?: string | null;
  coinAmount: number;
  repeatCount: number;
};

export default function CoinsOverlayClient({ token }: { token: string }) {
  const [totalCoins, setTotalCoins] = useState(0);
  const [lastGift, setLastGift] = useState<CoinTransaction | null>(null);

  useEffect(() => {
    const socket = io({
      query: {
        overlayToken: token,
        overlayType: "coins",
      },
    });

    socket.on("coins:new", (payload) => {
      const transaction = payload.transaction as CoinTransaction;

      setLastGift(transaction);
      setTotalCoins((prev) => prev + transaction.coinAmount);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
      <div className="rounded-3xl bg-black/70 px-10 py-8 text-center border border-white/10">
        <p className="text-sm text-slate-300">Total Coins</p>

        <h1 className="text-6xl font-black text-pink-400">
          {totalCoins}
        </h1>

        {lastGift && (
          <div className="mt-5 text-xl">
            <p className="font-semibold">
              {lastGift.nickname || lastGift.username || "Viewer"}
            </p>
            <p className="text-slate-300">
              sent {lastGift.giftName || "Gift"} × {lastGift.repeatCount}
            </p>
            <p className="text-pink-300 font-bold">
              +{lastGift.coinAmount} coins
            </p>
          </div>
        )}
      </div>
    </main>
  );
}