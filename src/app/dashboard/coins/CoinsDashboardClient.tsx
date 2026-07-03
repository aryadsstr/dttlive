"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Summary = {
  totalCoins: number;
  totalDiamonds: number;
  totalTransactions: number;
};

type CoinTransaction = {
  id: number;
  username?: string | null;
  nickname?: string | null;
  giftName?: string | null;
  diamondCount: number;
  repeatCount: number;
  coinAmount: number;
  createdAt: string;
};

export default function CoinsDashboardClient({ userId }: { userId: number }) {
  const [summary, setSummary] = useState<Summary>({
    totalCoins: 0,
    totalDiamonds: 0,
    totalTransactions: 0,
  });

  const [recent, setRecent] = useState<CoinTransaction[]>([]);

  async function loadSummary() {
    const res = await fetch("/api/coins/summary");
    const data = await res.json();

    if (data.success) {
      setSummary(data.summary);
      setRecent(data.recent);
    }
  }

  useEffect(() => {
    loadSummary();

    const socket = io({
      query: {
        userId: String(userId),
      },
    });

    socket.on("coins:new", (payload) => {
      const transaction = payload.transaction as CoinTransaction;

      setRecent((prev) => [transaction, ...prev.slice(0, 19)]);

      setSummary((prev) => ({
        totalCoins: prev.totalCoins + transaction.coinAmount,
        totalDiamonds: prev.totalDiamonds + transaction.diamondCount,
        totalTransactions: prev.totalTransactions + 1,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Coins</p>
          <h3 className="mt-2 text-3xl font-bold">{summary.totalCoins}</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Diamonds</p>
          <h3 className="mt-2 text-3xl font-bold">{summary.totalDiamonds}</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Gift Transactions</p>
          <h3 className="mt-2 text-3xl font-bold">
            {summary.totalTransactions}
          </h3>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <h3 className="text-xl font-semibold">Recent Gifts</h3>

        <div className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada gift yang masuk.
            </p>
          ) : (
            recent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div>
                  <p className="font-semibold">
                    {item.nickname || item.username || "Unknown Viewer"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {item.giftName || "Gift"} × {item.repeatCount}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-pink-400">
                    +{item.coinAmount}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.diamondCount} diamonds
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}