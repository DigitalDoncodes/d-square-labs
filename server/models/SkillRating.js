const mongoose = require('mongoose');

const skillRatingSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillListing', required: true },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

skillRatingSchema.index({ listing: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('SkillRating', skillRatingSchema);
