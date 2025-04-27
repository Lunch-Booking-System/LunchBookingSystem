import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io...");
    const ioServer = new Server(res.socket.server, {
      path: "/api/socket_io",
    });
    res.socket.server.io = ioServer;

    ioServer.on("connection", (socket) => {
      console.log("New client connected!");

      // 👇 Custom event listener
      socket.on("updateItemStatus", (data) => {
        console.log("Received updateItemStatus", data);

        // Broadcast the event to all connected clients
        ioServer.emit("itemStatusUpdated", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  } else {
    console.log("Socket.io server already running");
  }
  res.end();
}
