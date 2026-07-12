const mongoose = require('mongoose');

const eventRSVPSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['going', 'maybe', 'not-going'], default: 'going' },
  },
  { timestamps: true }
);

eventRSVPSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('EventRSVP', eventRSVPSchema);
