"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    setLoading(false);

    if (!data.success) {
      setMessage(data.message || "Register gagal");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-sm text-slate-400">
            Buat akun admin TikTok Live Auction.
          </p>
        </div>

        {message && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
            {message}
          </div>
        )}

        <input
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-pink-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-pink-500"
          placeholder="Password minimal 6 karakter"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 rounded-lg py-3 font-semibold"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-sm text-slate-400 text-center">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-pink-400">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}