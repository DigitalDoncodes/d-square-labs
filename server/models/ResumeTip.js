const mongoose = require('mongoose');

const resumeTipSchema = new mongoose.Schema({
  dateKey:      { type: String, required: true, unique: true }, // YYYY-MM-DD
  category:     { type: String, required: true },
  title:        { type: String, required: true },
  tip:          { type: String, required: true },
  example:      { type: String },
  applicableTo: { type: String },
  generatedBy:  { type: String },
  model:        { type: String },
  tokensUsed:   { type: Number },
  status:       { type: String, enum: ['published', 'pending_review'], default: 'published' },
}, { timestamps: true });

resumeTipSchema.index({ createdAt: -1 });
resumeTipSchema.index({ category: 1 });

module.exports = mongoose.model('ResumeTip', resumeTipSchema);
