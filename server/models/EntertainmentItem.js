const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  story: { type: Number, min: 1, max: 10, default: 0 },
  comedy: { type: Number, min: 1, max: 10, default: 0 },
  characters: { type: Number, min: 1, max: 10, default: 0 },
  animation: { type: Number, min: 1, max: 10, default: 0 },
  rewatchValue: { type: Number, min: 1, max: 10, default: 0 },
});

const EntertainmentItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['cartoons', 'games', 'gadgets', 'snacks', 'tv_shows', 'theme_songs', 'comics', 'animated_movies'],
      index: true,
    },
    yearsActive: { type: String, required: true },
    releaseYear: { type: Number, required: true, index: true },
    country: { type: String, default: 'USA' },
    studio: { type: String },
    genre: [{ type: String }],
    ageGroup: { type: String },
    
    // Content & Storytelling
    overview: { type: String, required: true },
    history: { type: String },
    story: { type: String },
    mainCharacters: [{ name: String, role: String, description: String }],
    villains: [{ name: String, description: String }],
    interestingFacts: [{ type: String }],
    whyPopular: { type: String },
    culturalImpact: { type: String },
    lifeLessons: [{ lesson: String, psychologicalTheme: String }],
    memorableMoments: [{ title: String, description: String }],
    iconicQuotes: [{ quote: String, character: String }],

    // Signature Feature: Psychology Section
    psychology: {
      whyWeLovedThis: { type: String, required: true },
      emotionalDevelopment: { type: String },
      memoryAnchors: { type: String },
      humorStyle: { type: String },
    },

    // Media & Visuals
    aiArtworks: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        promptTheme: { type: String },
      },
    ],

    // Analytics & Scores
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    // Per-user toggles backing the counters above.
    likedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    bookmarkedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    ratings: RatingSchema,
    isThrowbackPick: { type: Boolean, default: false },
    featuredAt: { type: Date },
    metaDescription: { type: String },
    readingTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

// Dynamic calculation for Nostalgia Score
EntertainmentItemSchema.virtual('nostalgiaScore').get(function () {
  return Math.min(100, Math.floor((this.views * 0.1) + (this.likes * 2) + (this.bookmarksCount * 3)));
});

module.exports = mongoose.model('EntertainmentItem', EntertainmentItemSchema);