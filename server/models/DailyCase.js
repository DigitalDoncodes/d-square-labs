const mongoose = require('mongoose');

// One admin-curated mini business case per day — the morning habit anchor.
// dateKey is 'YYYY-MM-DD' so "today's case" is a simple indexed lookup.
const dailyCaseSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      enum: ['strategy', 'marketing', 'operations', 'finance', 'hr', 'guesstimate', 'other'],
      default: 'strategy',
    },
    scenario: { type: String, required: true, maxlength: 4000 },
    question: { type: String, required: true, maxlength: 1000 },
    // Revealed only after the student marks the case solved.
    framework:       { type: String, maxlength: 4000 },
    // AI-generated extended fields
    solution:        { type: String, maxlength: 4000 },
    learningOutcomes:{ type: [String], default: [] },
    difficulty:      { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    aiGenerated:     { type: Boolean, default: false },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyCase', dailyCaseSchema);
