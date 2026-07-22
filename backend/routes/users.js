import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Current user's own profile (includes wallet balance, which is private)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    ...user.toPublicJSON(),
    email: user.email,
    walletBalance: user.walletBalance,
  });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { name, bio, skillsOffered, skillsWanted } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (bio !== undefined) update.bio = bio;
  if (skillsOffered !== undefined) update.skillsOffered = skillsOffered;
  if (skillsWanted !== undefined) update.skillsWanted = skillsWanted;

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true });
  res.json(user.toPublicJSON());
});

// Discovery feed: find people who offer a skill you want.
// Simple text match on skillsOffered; swap for Atlas Search / regex tuning later.
router.get("/discover", requireAuth, async (req, res) => {
  const me = await User.findById(req.userId);
  if (!me) return res.status(404).json({ error: "User not found" });

  const wanted = me.skillsWanted.length ? me.skillsWanted : undefined;

  const query = { _id: { $ne: me._id } };
  if (wanted) {
    query.skillsOffered = {
      $in: wanted.map((s) => new RegExp(s, "i")),
    };
  }

  const matches = await User.find(query).limit(50);
  res.json(matches.map((u) => u.toPublicJSON()));
});

export default router;
