const mongoose = require('mongoose');

const placementApplicationSchema = new mongoose.Schema(
  {
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

placementApplicationSchema.index({ drive: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
