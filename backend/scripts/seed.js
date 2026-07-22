// Populates the connected database with a handful of demo users and a
// couple of matches in different states, so a live demo or interview
// walkthrough has something to look at immediately instead of an empty app.
//
// Usage: cd backend && npm run seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

const demoUsers = [
  {
    name: "Aisha Khan",
    email: "aisha@demo.skillswap",
    skillsOffered: ["Guitar coaching", "Music theory"],
    skillsWanted: ["Python basics"],
    bio: "Weekend guitarist, weekday accountant.",
  },
  {
    name: "Rohan Mehta",
    email: "rohan@demo.skillswap",
    skillsOffered: ["Cooking", "Baking"],
    skillsWanted: ["Guitar coaching"],
    bio: "Home cook who wants to finally learn an instrument.",
  },
  {
    name: "Priya Nair",
    email: "priya@demo.skillswap",
    skillsOffered: ["Python basics", "Data analysis"],
    skillsWanted: ["Cooking"],
    bio: "Data analyst, terrible cook, working on it.",
  },
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: { $regex: /@demo\.skillswap$/ } }),
  ]);

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const users = await User.insertMany(
    demoUsers.map((u) => ({ ...u, passwordHash, walletBalance: 3 }))
  );

  const [aisha, rohan, priya] = users;

  // A completed swap: Rohan (requester) already got a guitar lesson from
  // Aisha (provider) and paid her 1 credit for it.
  const completedMatch = await Match.create({
    requester: rohan._id,
    provider: aisha._id,
    skill: "Guitar coaching",
    status: "completed",
    completedAt: new Date(),
    review: { rating: 5, comment: "Patient teacher, learned my first chords." },
  });
  rohan.walletBalance -= 1;
  aisha.walletBalance += 1;
  aisha.ratingAvg = 5;
  aisha.ratingCount = 1;
  await rohan.save();
  await aisha.save();

  await Message.insertMany([
    { matchId: completedMatch._id, sender: rohan._id, text: "Hey! Free this Saturday for the first lesson?" },
    { matchId: completedMatch._id, sender: aisha._id, text: "Saturday works, 4pm?" },
  ]);

  // A pending swap: Priya wants cooking lessons from Rohan.
  await Match.create({
    requester: priya._id,
    provider: rohan._id,
    skill: "Cooking",
    status: "pending",
  });

  console.log("Seeded demo users:");
  users.forEach((u) => console.log(`  ${u.name} <${u.email}> / password: demo1234`));
  console.log("Seeded 1 completed match (with review) and 1 pending match.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
