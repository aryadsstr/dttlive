import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface JwtPayload {
  userId: number;
}

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    return await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
  } catch {
    return null;
  }
}