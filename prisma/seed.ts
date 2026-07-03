import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: "free",
      label: "Free",
      description: "Paket gratis untuk fitur dasar.",
      price: 0,
    },
    {
      name: "pro",
      label: "Pro",
      description: "Paket lengkap untuk streamer.",
      price: 99000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  const features = [
    {
      key: "dashboard.view",
      name: "Dashboard",
      description: "Melihat overview dashboard.",
      plans: ["free", "pro"],
    },
    {
      key: "tiktok.connection",
      name: "TikTok Connection",
      description: "Menghubungkan akun TikTok Live.",
      plans: ["free", "pro"],
    },
    {
      key: "coins.view",
      name: "Coins",
      description: "Melihat pendapatan coins dan gift.",
      plans: ["free", "pro"],
    },
    {
      key: "coins.overlay",
      name: "Coins Overlay",
      description: "Menggunakan overlay coins.",
      plans: ["free", "pro"],
    },
    {
      key: "auction.view",
      name: "Auction",
      description: "Melihat halaman auction.",
      plans: ["pro"],
    },
    {
      key: "auction.manage",
      name: "Auction Manage",
      description: "Start, stop, reset auction.",
      plans: ["pro"],
    },
    {
      key: "elimination.view",
      name: "Elimination",
      description: "Melihat halaman elimination.",
      plans: ["pro"],
    },
    {
      key: "elimination.manage",
      name: "Elimination Manage",
      description: "Mengelola game elimination.",
      plans: ["pro"],
    },
    {
      key: "overlay.manager",
      name: "Overlay Manager",
      description: "Melihat semua overlay URL.",
      plans: ["free", "pro"],
    },
    {
      key: "settings.view",
      name: "Settings",
      description: "Melihat pengaturan akun.",
      plans: ["free", "pro"],
    },
  ];

  for (const featureItem of features) {
    const feature = await prisma.feature.upsert({
      where: { key: featureItem.key },
      update: {
        name: featureItem.name,
        description: featureItem.description,
      },
      create: {
        key: featureItem.key,
        name: featureItem.name,
        description: featureItem.description,
      },
    });

    for (const planName of featureItem.plans) {
      const plan = await prisma.plan.findUnique({
        where: { name: planName },
      });

      if (!plan) continue;

      await prisma.planFeature.upsert({
        where: {
          planId_featureId: {
            planId: plan.id,
            featureId: feature.id,
          },
        },
        update: {},
        create: {
          planId: plan.id,
          featureId: feature.id,
        },
      });
    }
  }

  const menuItems = [
    {
      name: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "🏠",
      group: "LIVE",
      sortOrder: 1,
      featureKey: "dashboard.view",
    },
    {
      name: "tiktok",
      label: "TikTok Connection",
      href: "/dashboard/tiktok",
      icon: "🎥",
      group: "LIVE",
      sortOrder: 2,
      featureKey: "tiktok.connection",
    },
    {
      name: "auction",
      label: "Auction",
      href: "/dashboard/auction",
      icon: "🔨",
      group: "TOOLS",
      sortOrder: 10,
      featureKey: "auction.view",
    },
    {
      name: "elimination",
      label: "Elimination",
      href: "/dashboard/elimination",
      icon: "🎮",
      group: "TOOLS",
      sortOrder: 11,
      featureKey: "elimination.view",
    },
    {
      name: "coins",
      label: "Coins",
      href: "/dashboard/coins",
      icon: "🪙",
      group: "ANALYTICS",
      sortOrder: 20,
      featureKey: "coins.view",
    },
    {
      name: "overlay",
      label: "Overlay Manager",
      href: "/dashboard/overlay",
      icon: "🖥️",
      group: "SYSTEM",
      sortOrder: 30,
      featureKey: "overlay.manager",
    },
    {
      name: "settings",
      label: "Settings",
      href: "/dashboard/settings",
      icon: "⚙️",
      group: "SYSTEM",
      sortOrder: 31,
      featureKey: "settings.view",
    },
  ];

  for (const item of menuItems) {
    const feature = await prisma.feature.findUnique({
      where: { key: item.featureKey },
    });

    await prisma.menu.upsert({
      where: { name: item.name },
      update: {
        label: item.label,
        href: item.href,
        icon: item.icon,
        group: item.group,
        sortOrder: item.sortOrder,
        featureId: feature?.id,
      },
      create: {
        name: item.name,
        label: item.label,
        href: item.href,
        icon: item.icon,
        group: item.group,
        sortOrder: item.sortOrder,
        featureId: feature?.id,
      },
    });
  }

  const freePlan = await prisma.plan.findUnique({
    where: { name: "free" },
  });

  if (freePlan) {
    await prisma.user.updateMany({
      where: {
        planId: null,
      },
      data: {
        planId: freePlan.id,
      },
    });
  }

  console.log("Seed feature, plan, menu selesai");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());