"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: number;
  name: string;
  label: string;
  description: string | null;
  price: number;
};

export default function PlanSettingsClient({
  plans,
  currentPlanName,
}: {
  plans: Plan[];
  currentPlanName?: string | null;
}) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function changePlan(planName: string) {
    setLoadingPlan(planName);
    setMessage("");

    const res = await fetch("/api/settings/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planName }),
    });

    const data = await res.json();

    setLoadingPlan(null);
    setMessage(data.message || "Selesai");

    if (data.success) {
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">Subscription Plan</h3>
        <p className="text-sm text-slate-400">
          Sementara ini masih mode manual/testing. Nanti bisa disambungkan ke payment.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => {
          const active = currentPlanName === plan.name;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-5 ${
                active
                  ? "border-pink-500 bg-pink-500/10"
                  : "border-slate-800 bg-slate-950"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold">{plan.label}</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    {plan.description || "-"}
                  </p>
                </div>

                {active && (
                  <span className="rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold">
                    Active
                  </span>
                )}
              </div>

              <p className="mt-4 text-2xl font-black">
                Rp {plan.price.toLocaleString("id-ID")}
              </p>

              <button
                onClick={() => changePlan(plan.name)}
                disabled={active || loadingPlan === plan.name}
                className="mt-5 w-full rounded-lg bg-pink-600 px-4 py-3 font-semibold hover:bg-pink-700 disabled:opacity-50"
              >
                {active
                  ? "Plan Aktif"
                  : loadingPlan === plan.name
                  ? "Mengubah..."
                  : `Pilih ${plan.label}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}