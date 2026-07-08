const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Food', 'Travel', 'Rent', 'Books & Courses', 'Entertainment', 'Shopping', 'Other'],
      default: 'Other',
    },
    note: { type: String, trim: true },
    date: { type: Date, required: true, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
