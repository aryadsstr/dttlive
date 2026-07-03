"use client";

import { useEffect, useState } from "react";

export default function TikTokConfigForm({
  initialUsername,
}: {
  initialUsername: string;
}) {
  const [tiktokUsername, setTiktokUsername] = useState(initialUsername);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingConnect, setLoadingConnect] = useState(false);

  async function loadStatus() {
    try {
      const res = await fetch("/api/tiktok/status");

      if (!res.ok) {
        setConnected(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setConnected(Boolean(data.status?.connected));
      }
    } catch (error) {
      console.error("Load TikTok status failed:", error);
      setConnected(false);
    }
  }

  useEffect(() => {
    loadStatus();

    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function saveTikTokUsername(e: React.FormEvent) {
    e.preventDefault();

    setLoadingSave(true);
    setMessage("");

    const res = await fetch("/api/settings/tiktok", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tiktokUsername }),
    });

    const data = await res.json();

    setLoadingSave(false);
    setMessage(data.message || "Selesai");
  }

  async function connectLive() {
    setLoadingConnect(true);
    setMessage("");

    const res = await fetch("/api/tiktok/connect", {
      method: "POST",
    });

    const data = await res.json();

    setLoadingConnect(false);
    setMessage(data.message || "Selesai");

    await loadStatus();
  }

  async function disconnectLive() {
    setLoadingConnect(true);
    setMessage("");

    const res = await fetch("/api/tiktok/disconnect", {
      method: "POST",
    });

    const data = await res.json();

    setLoadingConnect(false);
    setMessage(data.message || "Selesai");

    await loadStatus();
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={saveTikTokUsername}
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
      >
        <div>
          <h3 className="text-xl font-semibold">Config Username TikTok</h3>
          <p className="text-sm text-slate-400">
            Masukkan username creator TikTok yang sedang live.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
            {message}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-400">
            TikTok Username
          </label>

          <input
            value={tiktokUsername}
            onChange={(e) => setTiktokUsername(e.target.value)}
            placeholder="contoh: aryadisastra63"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-pink-500"
          />
        </div>

        <button
          disabled={loadingSave}
          className="rounded-lg bg-pink-600 px-5 py-3 font-semibold hover:bg-pink-700 disabled:opacity-60"
        >
          {loadingSave ? "Menyimpan..." : "Simpan Username"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">TikTok Live Connection</h3>
          <p className="text-sm text-slate-400">
            Hubungkan panel ini ke TikTok Live via tik.tools sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />

          <span className="text-sm text-slate-300">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={connectLive}
            disabled={loadingConnect}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {loadingConnect ? "Loading..." : "Connect Live"}
          </button>

          <button
            onClick={disconnectLive}
            disabled={loadingConnect}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}