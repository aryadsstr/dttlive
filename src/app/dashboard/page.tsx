import { getAuthUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthUser();

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Overview</h2>
        <p className="text-slate-400">
          Ringkasan aktivitas live tools kamu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Coins</p>
          <h3 className="mt-2 text-3xl font-bold">0</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Auction Revenue</p>
          <h3 className="mt-2 text-3xl font-bold">0</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Elimination Players</p>
          <h3 className="mt-2 text-3xl font-bold">0</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">TikTok Account</p>
          <h3 className="mt-2 text-2xl font-bold">
            {user?.tiktokUsername ? `@${user.tiktokUsername}` : "Not Set"}
          </h3>
        </div>
      </div>
    </div>
  );
}