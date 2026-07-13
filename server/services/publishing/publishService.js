const mongoose = require('mongoose');
const ContentItem = require('../../models/ContentItem');
const registry = require('./destinationRegistry');
const logActivity = require('../../utils/logActivity');

/**
 * Publish a reviewed ContentItem: create the target record via the
 * destination registry, link back, log. Returns { item, target }.
 * Idempotent — an already-published item returns unchanged (target null).
 */
async function publish(item, user, { resolution } = {}) {
  if (item.status === 'published') return { item, target: null };
  const key = item.destination?.key;
  if (!key) throw Object.assign(new Error('No destination selected'), { status: 400 });
  const dest = registry.get(key);

  // Duplicate resolution: 'replace' retires the older item and versions up.
  if (item.duplicateOf && resolution === 'replace') {
    const old = await ContentItem.findById(item.duplicateOf);
    if (old) {
      item.version = (old.version || 1) + 1;
      item.supersedes = old._id;
      if (old.status !== 'published' || old.destination?.targetId) {
        // Keep the old target record's history; just retire the studio item.
        old.status = 'rejected';
        old.rejectedReason = `Replaced by ${item._id}`;
        await old.save();
      }
    }
  } else if (item.duplicateOf && resolution === 'version') {
    const old = await ContentItem.findById(item.duplicateOf).select('version');
    item.version = ((old && old.version) || 1) + 1;
    item.supersedes = item.duplicateOf;
  }

  const target = await registry.createTarget(key, item, user);

  item.destination.targetModel = dest.model;
  item.destination.targetId = target._id;
  item.status = 'published';
  item.publishedAt = new Date();
  item.scheduledFor = undefined;
  await item.save();

  logActivity('studio_publish', `Published "${item.meta.title}" to ${dest.label}`, user, {
    contentItem: item._id.toString(),
    destination: key,
    targetId: target._id.toString(),
  });

  return { item, target };
}

/**
 * Backwards-compatibility entry point for existing module controllers
 * (Phase 2): creates a ContentItem already published around an upload
 * (or text-only record) that skipped AI review. Returns { item, target }
 * so callers can respond with the target record, exactly as before.
 */
async function publishDirect({ file, destinationKey, meta, user }) {
  const dest = registry.get(destinationKey);
  const item = await ContentItem.create({
    status: 'ready_for_review',
    file,
    meta: { visibility: 'members', ...meta },
    destination: { key: destinationKey, targetModel: dest.model },
    createdBy: user.userId,
  });
  try {
    return await publish(item, user);
  } catch (err) {
    // Don't leave an orphan studio item if the target validation fails.
    await item.deleteOne().catch(() => {});
    throw err;
  }
}

/** Cron entry: publish every scheduled item that is due. */
async function publishDue() {
  const due = await ContentItem.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() },
  }).select('+analysis.ocrText');
  for (const item of due) {
    try {
      const user = { userId: item.createdBy, name: 'Scheduler' };
      await publish(item, user);
      console.log(`[studio:scheduler] published ${item._id} ("${item.meta.title}")`);
    } catch (err) {
      console.error(`[studio:scheduler] failed to publish ${item._id}: ${err.message}`);
      item.status = 'failed';
      item.rejectedReason = err.message;
      await item.save().catch(() => {});
    }
  }
}

module.exports = { publish, publishDirect, publishDue };
