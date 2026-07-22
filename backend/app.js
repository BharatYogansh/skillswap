import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import matchRoutes from "./routes/matches.js";
import messageRoutes from "./routes/messages.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
  app.use(express.json());

  app.get("/health", (req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/matches", matchRoutes);
  app.use("/api/messages", messageRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
