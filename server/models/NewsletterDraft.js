const mongoose = require('mongoose');

const newsletterDraftSchema = new mongoose.Schema({
  weekStart:  { type: String, required: true, unique: true }, // YYYY-MM-DD (Monday)
  subject:    { type: String, required: true },
  preheader:  { type: String },
  headline:   { type: String },
  intro:      { type: String },
  sections:   { type: Object },
  closingNote:{ type: String },
  sentAt:     { type: Date },
  recipientCount: { type: Number, default: 0 },
  generatedBy:{ type: String },
  model:      { type: String },
  tokensUsed: { type: Number },
  status:     { type: String, enum: ['draft', 'sent', 'failed'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('NewsletterDraft', newsletterDraftSchema);
