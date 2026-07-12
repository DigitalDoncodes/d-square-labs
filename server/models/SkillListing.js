const mongoose = require('mongoose');

const skillListingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    mode: { type: String, enum: ['online', 'in-person', 'both'], default: 'both' },
    availability: { type: String, trim: true },
    contact: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillListing', skillListingSchema);
