const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    habits: [{ name: String, done: { type: Boolean, default: false } }],
    studyMinutes: { type: Number, default: 0 },
    pomodoroCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
