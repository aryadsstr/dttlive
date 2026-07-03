"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type TikTokLog = {
  event: string;
  text: string;
  time: string;
};

export default function TikTokEventLog({ userId }: { userId: number }) {
  const [logs, setLogs] = useState<TikTokLog[]>([]);

  useEffect(() => {
    const socket = io({
      query: {
        userId: String(userId),
      },
    });

    socket.on("tiktok:event", (payload) => {
      const data = payload.data || {};

      const text =
        data.comment ||
        data.giftName ||
        data.user?.nickname ||
        data.user_unique_id ||
        "-";

      setLogs((prev) => [
        {
          event: payload.event,
          text,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 30),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Live Event Log</h3>
        <p className="text-sm text-slate-400">
          Event dari TikTok Live akan muncul di sini.
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada event.</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm"
            >
              <div className="flex justify-between gap-3">
                <span className="font-semibold text-pink-400">
                  {log.event}
                </span>
                <span className="text-slate-500">{log.time}</span>
              </div>
              <p className="mt-1 text-slate-300">{log.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}