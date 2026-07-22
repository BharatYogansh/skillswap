import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skill: { type: String, required: true }, // the skill being taught, e.g. "Guitar coaching"
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    creditCost: { type: Number, default: 1, min: 1 },
    completedAt: { type: Date },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
