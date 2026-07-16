const mongoose = require('mongoose');

const streamEntrySchema = new mongoose.Schema({
  recommendation: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  reason: { type: String, required: true },
  confidence: { type: Number, required: true },
  urgency: { type: Number, required: true },
  expectedImpact: { type: String },
  estimatedCompletionTime: { type: String },
  sourceSignals: [String],
  actions: [{
    label: { type: String },
    route: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed },
  }],
  dismissed: { type: Boolean, default: false },
  lifecycleState: { type: String },
  v2Scores: {
    composite: { type: Number },
  },
  goalAlignment: {
    goal: { type: String },
    relevance: { type: Number },
  },
}, { _id: false });

const dailyMissionSchema = new mongoose.Schema({
  date: { type: String },
  goal: { type: String },
  tasks: [{ type: String }],
  estimatedCompletionTime: { type: String },
  expectedReadinessImprovement: { type: String },
  reasoning: { type: String },
  generatedAt: { type: Date },
}, { _id: false });

const recommendationStreamSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  todayFocus: { type: String, maxlength: 200 },
  topPriorities: [{ type: String, maxlength: 200 }],
  entries: [streamEntrySchema],
  dailyMission: { type: dailyMissionSchema },
  generatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('RecommendationStream', recommendationStreamSchema);
