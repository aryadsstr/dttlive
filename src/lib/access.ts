import { prisma } from "@/lib/prisma";

export async function userHasFeature(userId: number, featureKey: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true },
  });

  if (!user?.planId) return false;

  const access = await prisma.planFeature.findFirst({
    where: {
      planId: user.planId,
      feature: {
        key: featureKey,
        isActive: true,
      },
    },
  });

  return Boolean(access);
}

export async function getUserFeatureKeys(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planId: true },
  });

  if (!user?.planId) return [];

  const features = await prisma.planFeature.findMany({
    where: {
      planId: user.planId,
      feature: {
        isActive: true,
      },
    },
    include: {
      feature: true,
    },
  });

  return features.map((item) => item.feature.key);
}