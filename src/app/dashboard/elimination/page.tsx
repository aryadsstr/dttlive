import { getAuthUser } from "@/lib/auth";
import { userHasFeature } from "@/lib/access";
import ForbiddenPage from "@/components/ForbiddenPage";

export default async function EliminationPage() {
  const user = await getAuthUser();

  if (!user) return null;

  const allowed = await userHasFeature(user.id, "elimination.view");

  if (!allowed) {
    return <ForbiddenPage />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const overlayUrl = `${baseUrl}/overlay/elimination/${user.overlayToken}`;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Eliminasi</h2>
        <p className="text-slate-400">
          Panel untuk game eliminasi viewer/player.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-xl font-semibold">Elimination Overlay URL</h3>
        <p className="text-sm text-slate-400">
          Overlay ini khusus untuk tampilan eliminasi.
        </p>

        <div className="break-all rounded-lg border border-slate-800 bg-slate-950 p-3 text-pink-400">
          {overlayUrl}
        </div>
      </div>
    </div>
  );
}