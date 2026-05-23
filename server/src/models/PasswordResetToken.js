import mongoose from "mongoose";

/**
 * Password reset tokens — short-lived (30 min TTL), single-use.
 * Stored as SHA-256 hash so DB leak can't be replayed (same pattern as
 * RefreshToken).
 */
const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// MongoDB removes docs once expiresAt < now (cleanup runs ~every minute).
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema,
);
