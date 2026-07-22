import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: "" },
    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },
    // Every new user starts with a small credit grant so the marketplace
    // isn't a chicken-and-egg problem on day one.
    walletBalance: { type: Number, default: 3, min: 0 },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    bio: this.bio,
    skillsOffered: this.skillsOffered,
    skillsWanted: this.skillsWanted,
    ratingAvg: this.ratingAvg,
    ratingCount: this.ratingCount,
  };
};

export default mongoose.model("User", userSchema);
