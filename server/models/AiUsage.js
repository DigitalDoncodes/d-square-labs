const mongoose = require('mongoose');

// One row per user per day: how many metered AI actions they've used.
// Enforced by middleware/aiQuota.js; chat has its own message quota.
const aiUsageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true }, // YYYY-MM-DD (UTC)
    count: { type: Number, default: 0 },
    // Credit-weighted usage (expensive models charge more per request).
    // Quota checks read this; `count` is kept for one release for rollback.
    creditsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiUsageSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('AiUsage', aiUsageSchema);
