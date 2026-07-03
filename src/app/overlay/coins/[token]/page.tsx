import { prisma } from "@/lib/prisma";
import CoinsOverlayClient from "./CoinsOverlayClient";

export default async function CoinsOverlayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { overlayToken: token },
    select: { id: true },
  });

  if (!user) {
    return (
      <main className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="rounded-2xl bg-black/70 px-8 py-6">
          Invalid overlay token
        </div>
      </main>
    );
  }

  return <CoinsOverlayClient token={token} />;
}