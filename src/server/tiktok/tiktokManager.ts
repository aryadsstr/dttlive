import fs from "fs";
import path from "path";
import { emitToUser } from "@/server/socket/socketServer";
import { parseTikTokEvent } from "./parser";
import { dispatchTikTokEvent } from "./dispatcher";
import { bootstrapServerServices } from "@/server/bootstrap";

type TikTokEvent = {
  event: string;
  data?: any;
};

type ConnectionItem = {
  userId: number;
  tiktokUsername: string;
  ws: WebSocket;
  connectedAt: Date;
};

const connections = new Map<number, ConnectionItem>();

const API = process.env.TIKTOOLS_API_URL || "https://api.tik.tools";
const WS = process.env.TIKTOOLS_WS_URL || "wss://api.tik.tools";
const KEY = process.env.TIKTOOLS_API_KEY || "";

async function createTikToolsToken(tiktokUsername: string) {
  const res = await fetch(`${API}/authentication/jwt?apiKey=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      allowed_creators: [tiktokUsername],
      expire_after: 600,
      max_websockets: 1,
    }),
  });

  const json = await res.json();
  const token = json.data?.token;

  if (!token) {
    throw new Error(`TikTools auth failed: ${JSON.stringify(json)}`);
  }

  return token;
}

export function getTikTokConnectionStatus(userId: number) {
  const conn = connections.get(userId);

  if (!conn) {
    return {
      connected: false,
      tiktokUsername: null,
    };
  }

  return {
    connected: conn.ws.readyState === WebSocket.OPEN,
    tiktokUsername: conn.tiktokUsername,
    connectedAt: conn.connectedAt,
  };
}

export async function connectTikTokLive({
  userId,
  tiktokUsername,
}: {
  userId: number;
  tiktokUsername: string;
}) {
  bootstrapServerServices();
  disconnectTikTokLive(userId);

  const cleanUsername = tiktokUsername.trim().replace(/^@/, "");
  const token = await createTikToolsToken(cleanUsername);

  const ws = new WebSocket(
    `${WS}?uniqueId=${cleanUsername}&jwtKey=${encodeURIComponent(token)}`
  );

  ws.onopen = () => {
    console.log(`[TikTok] Connected @${cleanUsername} userId=${userId}`);
  };

  ws.onmessage = async (ev) => {
    try {
      const payload = JSON.parse(ev.data) as TikTokEvent;

      if (payload.event === "roomInfo") return;

      const data = payload.data || {};
      const normalizedEvent = parseTikTokEvent(payload.event, data);

      emitToUser(userId, "tiktok:event", normalizedEvent);

      await dispatchTikTokEvent({
        userId,
        event: normalizedEvent,
      });
    } catch (err) {
      console.error("[TikTok] Message parse error:", err);
    }
  };

  ws.onerror = (err) => {
    console.error(`[TikTok] WS Error userId=${userId}`, err);
  };

  ws.onclose = (ev) => {
    console.log(`[TikTok] Closed userId=${userId}`, ev.reason || ev.code);

    const current = connections.get(userId);

    if (current?.ws === ws) {
      connections.delete(userId);
    }
  };

  connections.set(userId, {
    userId,
    tiktokUsername: cleanUsername,
    ws,
    connectedAt: new Date(),
  });

  return {
    success: true,
    tiktokUsername: cleanUsername,
  };
}

export function disconnectTikTokLive(userId: number) {
  const conn = connections.get(userId);

  if (!conn) return;

  try {
    conn.ws.close();
  } catch {}

  connections.delete(userId);
}