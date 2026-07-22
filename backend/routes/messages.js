import { Router } from "express";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Fetch chat history for a match. Access is limited to the two people
// actually in that match — this is the same rule Stitch's Data Access
// Rules would have enforced, just written as a normal Express check.
router.get("/:matchId", requireAuth, async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (![String(match.requester), String(match.provider)].includes(req.userId)) {
    return res.status(403).json({ error: "Not a participant in this match" });
  }

  const messages = await Message.find({ matchId: req.params.matchId }).sort({ createdAt: 1 });
  res.json(messages);
});

export default router;
