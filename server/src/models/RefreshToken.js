import mongoose from 'mongoose';

/**
 * Stateful refresh tokens. Spec: KE_HOACH_DO_AN_TOEIC_AI.md §6.1.
 *
 * Why we store the SHA-256 hash (not raw JWT):
 * - Defense-in-depth: if MongoDB leaks, attackers can't replay the tokens
 *   because what's stored is a one-way hash.
 * - SHA-256 is enough (no bcrypt) because the JWT itself is already a
 *   high-entropy random secret; we don't need slow KDF.
 *
 * The TTL index on expiresAt lets MongoDB auto-delete expired docs every
 * minute — no manual cleanup cron needed.
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL index: MongoDB removes docs once expiresAt < now.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
