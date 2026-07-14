const mongoose = require('mongoose');

const starStorySchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  competency:  { type: String, trim: true, maxlength: 80 },
  situation:   { type: String, trim: true, maxlength: 2000 },
  task:        { type: String, trim: true, maxlength: 2000 },
  action:      { type: String, trim: true, maxlength: 2000 },
  result:      { type: String, trim: true, maxlength: 2000 },
  tags:        [{ type: String, trim: true, maxlength: 50 }],
}, { timestamps: true });

module.exports = mongoose.model('StarStory', starStorySchema);
