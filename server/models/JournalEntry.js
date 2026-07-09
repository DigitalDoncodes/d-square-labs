const mongoose = require('mongoose');

// The admin's private diary — never exposed to members.
const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true },
    content: { type: String, required: true },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'low', 'rough'],
      default: 'good',
    },
    entryDate: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
