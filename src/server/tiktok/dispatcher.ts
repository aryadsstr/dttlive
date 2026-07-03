import { NormalizedTikTokEvent } from "./parser";

type Handler = (ctx: {
  userId: number;
  event: NormalizedTikTokEvent;
}) => Promise<void> | void;

const handlers: Handler[] = [];

export function registerTikTokHandler(handler: Handler) {
  handlers.push(handler);
}

export async function dispatchTikTokEvent({
  userId,
  event,
}: {
  userId: number;
  event: NormalizedTikTokEvent;
}) {
  for (const handler of handlers) {
    try {
      await handler({ userId, event });
    } catch (error) {
      console.error("[Dispatcher] Handler error:", error);
    }
  }
}