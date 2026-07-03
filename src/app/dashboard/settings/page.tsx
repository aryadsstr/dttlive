import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlanSettingsClient from "./PlanSettingsClient";

export default async function SettingsPage() {
  const user = await getAuthUser();

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  const currentUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        include: { plan: true },
      })
    : null;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-slate-400">
          Pengaturan akun dan subscription.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">Username</p>
        <h3 className="mt-1 text-xl font-bold">@{user?.username}</h3>

        <p className="mt-4 text-sm text-slate-400">Current Plan</p>
        <h3 className="mt-1 text-xl font-bold">
          {currentUser?.plan?.label || "No Plan"}
        </h3>
      </div>

      <PlanSettingsClient
        plans={plans}
        currentPlanName={currentUser?.plan?.name}
      />
    </div>
  );
}