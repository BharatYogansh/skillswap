import jwt from "jsonwebtoken";
import Match from "../models/Match.js";
import Message from "../models/Message.js";

export function registerChatHandlers(io) {
  // Auth the socket itself, same JWT used for REST calls.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing auth token"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join_match", async (matchId, ack) => {
      const match = await Match.findById(matchId);
      const allowed =
        match && [String(match.requester), String(match.provider)].includes(socket.userId);
      if (!allowed) {
        return ack?.({ ok: false, error: "Not a participant in this match" });
      }
      socket.join(`match:${matchId}`);
      ack?.({ ok: true });
    });

    socket.on("send_message", async ({ matchId, text }, ack) => {
      try {
        const match = await Match.findById(matchId);
        const allowed =
          match && [String(match.requester), String(match.provider)].includes(socket.userId);
        if (!allowed) return ack?.({ ok: false, error: "Not a participant in this match" });
        if (!text?.trim()) return ack?.({ ok: false, error: "Empty message" });

        const message = await Message.create({
          matchId,
          sender: socket.userId,
          text: text.trim(),
        });

        io.to(`match:${matchId}`).emit("new_message", message);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });
  });
}
