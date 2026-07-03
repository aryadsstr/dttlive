const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const overlayToken = socket.handshake.query.overlayToken;
    const overlayType = socket.handshake.query.overlayType;

    if (userId) {
      socket.join(`user:${userId}`);
      console.log("[Socket] dashboard joined", `user:${userId}`);
    }

    if (overlayToken) {
      socket.join(`overlay:${overlayToken}`);

      if (overlayType) {
        socket.join(`overlay:${overlayType}:${overlayToken}`);
      }

      console.log("[Socket] overlay joined", overlayType, overlayToken);
    }

    socket.on("disconnect", () => {
      console.log("[Socket] disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});