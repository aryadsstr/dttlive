import { Server as IOServer } from "socket.io";

declare global {
  var io: IOServer | undefined;
}

export function getIO() {
  return globalThis.io;
}

export function emitToUser(userId: number, event: string, payload: unknown) {
  const io = getIO();
  if (!io) return;

  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToOverlay(
  overlayType: string,
  token: string,
  event: string,
  payload: unknown
) {
  const io = getIO();
  if (!io) return;

  io.to(`overlay:${overlayType}:${token}`).emit(event, payload);
}