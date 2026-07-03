import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SidebarMenu = {
  id: number;
  label: string;
  href: string;
  icon: string | null;
  group: string;
  sortOrder: number;
};

function groupMenus(menus: SidebarMenu[]) {
  const grouped: Record<string, SidebarMenu[]> = {};

  for (const menu of menus) {
    if (!grouped[menu.group]) {
      grouped[menu.group] = [];
    }

    grouped[menu.group].push(menu);
  }

  return Object.entries(grouped);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const menus = await prisma.menu.findMany({
    where: {
      isActive: true,
      feature: {
        planFeatures: {
          some: {
            planId: user.planId || 0,
          },
        },
      },
    },
    orderBy: [
      {
        group: "asc",
      },
      {
        sortOrder: "asc",
      },
    ],
    select: {
      id: true,
      label: true,
      href: true,
      icon: true,
      group: true,
      sortOrder: true,
    },
  });

  const groupedMenus = groupMenus(menus);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-900/80 p-5 md:block">
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <h1 className="text-xl font-black">D-TTLive</h1>
            <p className="text-sm text-slate-400">@{user.username}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {user.planId ? "Plan Active" : "No Plan"}
            </div>
          </div>

          <nav className="space-y-6">
            {groupedMenus.map(([groupName, items]) => (
              <div key={groupName}>
                <p className="mb-2 px-3 text-xs font-bold tracking-widest text-slate-500">
                  {groupName}
                </p>

                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span>{item.icon || "•"}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <form action="/api/auth/logout" method="post" className="mt-8">
            <button className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-700">
              Logout
            </button>
          </form>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-800 bg-slate-900/80 p-4 md:hidden">
            <h1 className="font-bold">D-TTLive</h1>
            <p className="text-xs text-slate-400">@{user.username}</p>
          </header>

          <div className="p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}