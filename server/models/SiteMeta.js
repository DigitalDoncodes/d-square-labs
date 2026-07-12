const mongoose = require('mongoose');

// Singleton config document — always upserted with key 'main'.
// Keeps platform-wide settings (placement date, batch name, etc.) without
// a new route file for each field.
const siteMetaSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    placementDate: { type: Date, default: null },
    batchName: { type: String, maxlength: 100, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteMeta', siteMetaSchema);
