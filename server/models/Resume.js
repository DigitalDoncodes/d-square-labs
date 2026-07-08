const mongoose = require('mongoose');

// One resume per user, private. Sub-schemas are loose on purpose — the editor
// saves drafts, so nothing beyond the owning user is required.
const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personal: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      website: String,
    },
    summary: String,
    education: [
      {
        degree: String,
        institution: String,
        years: String,
        score: String,
      },
    ],
    experience: [
      {
        role: String,
        organization: String,
        duration: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    skills: [String],
    certifications: [
      {
        name: String,
        issuer: String,
        year: String,
      },
    ],
    achievements: [String],
    leadership: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
