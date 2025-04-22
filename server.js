import app from "./app.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Adjust to your React app's origin
    methods: ["GET", "POST"],
  },
});

io.on("connect", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("Client connected:", socket.id);

  if (userId) {
    socket.join(userId);
    console.log(`✅ User ${userId} joined their own room`);
  } else {
    console.log("❌ No userId provided in handshake query");
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
