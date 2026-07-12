const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    package: { type: String, trim: true },
    eligibility: { type: String, trim: true },
    applicationDeadline: { type: Date },
    rounds: [{ name: String, date: Date, description: String }],
    status: { type: String, enum: ['upcoming', 'active', 'closed'], default: 'upcoming' },
    applyLink: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
