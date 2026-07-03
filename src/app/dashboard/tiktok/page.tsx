import { getAuthUser } from "@/lib/auth";
import TikTokConfigForm from "./TikTokConfigForm";
import TikTokEventLog from "./TikTokEventLog";

export default async function TikTokConfigPage() {
  const user = await getAuthUser();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Akun TikTok</h2>
        <p className="text-slate-400">
          Simpan username TikTok dan lihat event live realtime.
        </p>
      </div>

      <TikTokConfigForm initialUsername={user?.tiktokUsername || ""} />

      {user && <TikTokEventLog userId={user.id} />}
    </div>
  );
}