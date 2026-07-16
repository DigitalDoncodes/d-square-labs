const Memory = require('../../models/Memory');

async function getRecentMemory(userId, limit = 10) {
  try {
    return await Memory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch {
    return [];
  }
}

async function getMemoryByType(userId, type, limit = 10) {
  try {
    return await Memory.find({ userId, type })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch {
    return [];
  }
}

async function saveMemory(userId, entry) {
  try {
    return await Memory.create({
      userId,
      type: entry.type || 'general',
      key: entry.key || null,
      value: entry.value || null,
      metadata: entry.metadata || {},
      tags: entry.tags || [],
      source: entry.source || 'ai-runtime-v2',
      ttl: entry.ttl || null,
    });
  } catch (err) {
    console.warn('[memoryAdapter] Failed to save memory:', err.message);
    return null;
  }
}

async function getMemoryByKey(userId, key) {
  try {
    return await Memory.findOne({ userId, key }).lean();
  } catch {
    return null;
  }
}

async function deleteMemory(userId, memoryId) {
  try {
    return await Memory.deleteOne({ _id: memoryId, userId });
  } catch {
    return false;
  }
}

async function searchMemory(userId, query, limit = 10) {
  try {
    return await Memory.find({
      userId,
      $or: [
        { value: { $regex: query, $options: 'i' } },
        { tags: { $in: [query] } },
        { key: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch {
    return [];
  }
}

async function getMemorySummary(userId) {
  try {
    const memories = await Memory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return memories;
  } catch {
    return [];
  }
}

module.exports = {
  getRecentMemory,
  getMemoryByType,
  saveMemory,
  getMemoryByKey,
  deleteMemory,
  searchMemory,
  getMemorySummary,
};
