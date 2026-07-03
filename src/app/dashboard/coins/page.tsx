import { getAuthUser } from "@/lib/auth";
import CoinsDashboardClient from "./CoinsDashboardClient";

export default async function CoinsPage() {
  const user = await getAuthUser();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const overlayUrl = `${baseUrl}/overlay/coins/${user?.overlayToken}`;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Pendapatan Coin</h2>
        <p className="text-slate-400">
          Tracking gift, diamond, dan pendapatan coin dari TikTok Live.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-xl font-semibold">Coins Overlay URL</h3>
        <p className="text-sm text-slate-400">
          Masukkan URL ini ke OBS Browser Source.
        </p>

        <div className="break-all rounded-lg border border-slate-800 bg-slate-950 p-3 text-pink-400">
          {overlayUrl}
        </div>
      </div>

      {user && <CoinsDashboardClient userId={user.id} />}
    </div>
  );
}