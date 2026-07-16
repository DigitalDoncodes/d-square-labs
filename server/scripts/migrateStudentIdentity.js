/**
 * One-time migration: backfill StudentIdentity documents for every existing user.
 *
 * Usage:
 *   node server/scripts/migrateStudentIdentity.js
 *
 * This reads each User + UserProfile and creates a canonical StudentIdentity
 * document. It is idempotent — safe to run multiple times (upserts).
 */
const mongoose = require('mongoose');
const path = require('path');

// Load env before anything else
require(path.resolve(__dirname, '..', '..', 'server', 'config', 'env'));

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const StudentIdentity = require('../models/StudentIdentity');

const { bootstrapFromLegacy } = require('../services/studentIdentityService');

async function migrate() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGODB_URI / MONGO_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const total = await User.countDocuments({});
  const cursor = User.find({}).lean().cursor();
  let done = 0;
  let errors = 0;

  console.log(`Migrating ${total} users…\n`);

  for await (const user of cursor) {
    try {
      const existing = await StudentIdentity.findOne({ user: user._id }).lean();
      if (existing) {
        done++;
        process.stdout.write(`\r✓ ${done}/${total} (skipped — exists)`);
        continue;
      }
      await bootstrapFromLegacy(user._id);
      done++;
      process.stdout.write(`\r✓ ${done}/${total}`);
    } catch (err) {
      errors++;
      console.error(`\n✗ User ${user._id} (${user.email}): ${err.message}`);
    }
  }

  console.log(`\n\nDone. ${done - errors} created/skipped, ${errors} errors.`);
  await mongoose.disconnect();
  process.exit(errors ? 1 : 0);
}

migrate();
