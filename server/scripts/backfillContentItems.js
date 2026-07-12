#!/usr/bin/env node
/**
 * Phase 4 — Content Studio backfill.
 *
 * Creates ContentItem stubs (status: published) for records that predate the
 * centralized publishing engine, so Recent Uploads, search and duplicate
 * detection cover historical content too.
 *
 * Idempotent: only touches records whose `contentItem` field is unset.
 *
 * Usage (from server/):
 *   node scripts/backfillContentItems.js --dry-run          # report only
 *   node scripts/backfillContentItems.js                    # apply
 *   node scripts/backfillContentItems.js --limit=100        # cap per model
 */
require('dotenv').config();
const mongoose = require('mongoose');

const ContentItem = require('../models/ContentItem');
const Note = require('../models/Note');
const Resource = require('../models/Resource');
const Photo = require('../models/Photo');
const Announcement = require('../models/Announcement');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = Number((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1]) || 0;
const BATCH = 100;

// Resource.type → ContentItem file.type (both sides are constrained enums).
const RESOURCE_FILE_TYPE = { pdf: 'pdf', word: 'word', excel: 'excel', ppt: 'ppt', zip: 'zip', video: 'video' };

const SOURCES = [
  {
    name: 'Note',
    Model: Note,
    destination: { key: 'notes', targetModel: 'Note' },
    map: (d) => ({
      meta: {
        title: d.title,
        subject: d.subject,
        semester: d.semester,
        description: (d.content || '').slice(0, 2000),
        extra: { content: d.content || '' },
      },
      createdBy: d.author,
    }),
  },
  {
    name: 'Resource',
    Model: Resource,
    destination: { key: 'resources', targetModel: 'Resource' },
    map: (d) => ({
      file: d.type !== 'link'
        ? { originalName: d.title, url: d.url, type: RESOURCE_FILE_TYPE[d.type] }
        : undefined,
      meta: {
        title: d.title,
        subject: d.subject,
        semester: d.semester,
        tags: d.tags || [],
        extra: { professor: d.professor, resourceType: d.type },
      },
      createdBy: d.uploadedBy,
    }),
  },
  {
    name: 'Photo',
    Model: Photo,
    destination: { key: 'gallery', targetModel: 'Photo' },
    map: (d) => ({
      file: { originalName: d.caption || 'photo', url: d.url, publicId: d.publicId, type: 'image' },
      meta: {
        title: d.caption || 'Photo',
        extra: { albumId: d.album?.toString(), caption: d.caption || '' },
      },
      createdBy: d.uploadedBy,
    }),
  },
  {
    name: 'Announcement',
    Model: Announcement,
    destination: { key: 'announcements', targetModel: 'Announcement' },
    map: (d) => ({
      meta: {
        title: d.title,
        description: (d.body || '').slice(0, 2000),
        extra: { body: d.body || '', priority: d.priority, pinned: d.pinned },
      },
      createdBy: d.createdBy,
    }),
  },
];

async function backfillSource({ name, Model, destination, map }) {
  const filter = { contentItem: null };
  const total = await Model.countDocuments(filter);
  let todo = LIMIT ? Math.min(total, LIMIT) : total;
  console.log(`${name}: ${total} unlinked record(s)${LIMIT ? `, processing up to ${todo}` : ''}`);
  let done = 0;
  let failed = 0;

  while (todo > 0) {
    const docs = await Model.find(filter).sort({ _id: 1 }).limit(Math.min(BATCH, todo));
    if (!docs.length) break;
    for (const doc of docs) {
      todo -= 1;
      if (DRY_RUN) { done += 1; continue; }
      try {
        const base = map(doc);
        const item = await ContentItem.create({
          ...base,
          status: 'published',
          destination: { ...destination, targetId: doc._id },
          publishedAt: doc.createdAt,
          // Backfilled records must never trip validation on missing owner.
          createdBy: base.createdBy || undefined,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        });
        doc.contentItem = item._id;
        await doc.save({ validateBeforeSave: false, timestamps: false });
        done += 1;
      } catch (err) {
        failed += 1;
        console.error(`  ! ${name} ${doc._id}: ${err.message}`);
      }
    }
    if (DRY_RUN) break; // one pass is enough to report
  }
  console.log(`${name}: ${DRY_RUN ? 'would backfill' : 'backfilled'} ${done}${failed ? `, failed ${failed}` : ''}`);
  return { done, failed };
}

(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Content Studio backfill ${DRY_RUN ? '(dry run)' : ''}\n`);
  let done = 0;
  let failed = 0;
  for (const source of SOURCES) {
    const r = await backfillSource(source);
    done += r.done;
    failed += r.failed;
  }
  console.log(`\nTotal: ${DRY_RUN ? 'would backfill' : 'backfilled'} ${done}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
