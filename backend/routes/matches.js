import { Router } from "express";
import mongoose from "mongoose";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Request a swap: I (requester) want `skill` from `providerId`.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { providerId, skill, creditCost = 1 } = req.body;
    if (!providerId || !skill) {
      return res.status(400).json({ error: "providerId and skill are required" });
    }
    if (providerId === req.userId) {
      return res.status(400).json({ error: "Cannot request a swap with yourself" });
    }

    const match = await Match.create({
      requester: req.userId,
      provider: providerId,
      skill,
      creditCost,
    });
    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: "Failed to create match", detail: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const matches = await Match.find({
    $or: [{ requester: req.userId }, { provider: req.userId }],
  })
    .populate("requester", "name")
    .populate("provider", "name")
    .sort({ createdAt: -1 });
  res.json(matches);
});

// Provider accepts the swap request.
router.patch("/:id/accept", requireAuth, async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (String(match.provider) !== req.userId) {
    return res.status(403).json({ error: "Only the provider can accept this match" });
  }
  if (match.status !== "pending") {
    return res.status(409).json({ error: `Match is already ${match.status}` });
  }

  match.status = "accepted";
  await match.save();
  res.json(match);
});

// The escrow step: requester pays creditCost to provider, atomically.
// This is the piece the original design wanted a BaaS platform to hide from you.
// It's a plain Mongo transaction instead — no vendor lock-in, and it's the
// part worth explaining in an interview.
router.post("/:id/complete", requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const match = await Match.findById(req.params.id).session(session);
      if (!match) throw new AppError(404, "Match not found");
      if (match.status !== "accepted") {
        throw new AppError(409, `Match must be accepted before it can complete (currently ${match.status})`);
      }
      if (![String(match.requester), String(match.provider)].includes(req.userId)) {
        throw new AppError(403, "Only the requester or provider can complete this match");
      }

      const requester = await User.findById(match.requester).session(session);
      const provider = await User.findById(match.provider).session(session);

      if (requester.walletBalance < match.creditCost) {
        throw new AppError(402, "Requester has insufficient credits");
      }

      requester.walletBalance -= match.creditCost;
      provider.walletBalance += match.creditCost;
      await requester.save({ session });
      await provider.save({ session });

      match.status = "completed";
      match.completedAt = new Date();
      await match.save({ session });

      result = match;
    });
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Failed to complete match" });
  } finally {
    session.endSession();
  }
});

// Leave a rating after completion.
router.post("/:id/review", requireAuth, async (req, res) => {
  const { rating, comment = "" } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }

  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status !== "completed") {
    return res.status(409).json({ error: "Can only review a completed match" });
  }
  if (String(match.requester) !== req.userId) {
    return res.status(403).json({ error: "Only the requester can leave a review" });
  }

  match.review = { rating, comment };
  await match.save();

  const provider = await User.findById(match.provider);
  const newCount = provider.ratingCount + 1;
  const newAvg = (provider.ratingAvg * provider.ratingCount + rating) / newCount;
  provider.ratingAvg = Math.round(newAvg * 10) / 10;
  provider.ratingCount = newCount;
  await provider.save();

  res.json(match);
});

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default router;
