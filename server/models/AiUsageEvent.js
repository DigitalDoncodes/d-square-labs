const mongoose = require('mongoose');

// One row per completed AI request — the durable ledger behind the admin
// usage dashboard. Daily quota checks use the AiUsage per-day rollup, not
// this collection. TTL-expires after 90 days to keep it lean.
const aiUsageEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tier: { type: String, default: 'free' },
  model: { type: String, default: '' },
  provider: { type: String, default: '' },
  credits: { type: Number, required: true },
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  task: { type: String, default: '' },
  latencyMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 },
});

aiUsageEventSchema.index({ createdAt: -1, tier: 1 });

module.exports = mongoose.model('AiUsageEvent', aiUsageEventSchema);
