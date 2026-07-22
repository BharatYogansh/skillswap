import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { registerChatHandlers } from "./sockets/chat.js";

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});
registerChatHandlers(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`SkillSwap API running on port ${PORT}`));
});
