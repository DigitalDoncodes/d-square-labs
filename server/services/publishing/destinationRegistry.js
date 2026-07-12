/**
 * Destination registry — the only place that knows module specifics.
 * Adding a destination = adding one entry here; the publishing engine
 * (ingest → analyze → review → publish) never changes.
 *
 * Each entry:
 *   label / description  shown in the Studio UI and given to the AI
 *   model                mongoose model name created on publish
 *   requiredFields       paths on item.meta validated before publish
 *   extraFields          destination-specific inputs the review UI renders
 *   map(item, user)      → document payload for the target model
 */
const mongoose = require('mongoose');

require('../../models/Note');
require('../../models/Resource');
require('../../models/Announcement');
require('../../models/Photo');

const FILE_TYPE_TO_RESOURCE_TYPE = {
  pdf: 'pdf', word: 'word', excel: 'excel', ppt: 'ppt', zip: 'zip', video: 'video',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const destinations = {
  notes: {
    label: 'Study Hub → Notes',
    description: 'Lecture notes and study material organised by subject and semester.',
    icon: 'BookOpen',
    model: 'Note',
    requiredFields: ['title', 'subject'],
    extraFields: [],
    map: (item, user) => ({
      title: item.meta.title,
      subject: item.meta.subject,
      semester: item.meta.semester,
      content: [
        item.meta.description,
        item.analysis?.summary && `\n## AI Summary\n${item.analysis.summary}`,
        `\n[Attached file: ${item.file.originalName}](${item.file.url})`,
      ].filter(Boolean).join('\n'),
      author: user.userId,
      contentItem: item._id,
    }),
  },

  resources: {
    label: 'Resources',
    description: 'Downloadable files: PDFs, spreadsheets, decks, recordings, templates.',
    icon: 'FolderOpen',
    model: 'Resource',
    requiredFields: ['title'],
    extraFields: [{ name: 'professor', label: 'Professor', required: false }],
    map: (item, user) => ({
      title: item.meta.title,
      subject: item.meta.subject,
      semester: item.meta.semester,
      professor: item.meta.extra?.professor,
      type: FILE_TYPE_TO_RESOURCE_TYPE[item.file.type] || 'link',
      url: item.file.url,
      fileSize: formatSize(item.file.size),
      tags: item.meta.tags || [],
      uploadedBy: user.userId,
      contentItem: item._id,
    }),
  },

  announcements: {
    label: 'Announcements',
    description: 'Official announcements shown to every member.',
    icon: 'Megaphone',
    model: 'Announcement',
    requiredFields: ['title', 'description'],
    extraFields: [
      { name: 'priority', label: 'Priority', required: false, options: ['normal', 'important'] },
    ],
    map: (item, user) => ({
      title: item.meta.title,
      body: [item.meta.description, `\nAttachment: ${item.file.url}`].join('\n'),
      priority: item.meta.extra?.priority === 'important' ? 'important' : 'normal',
      createdBy: user.userId,
      contentItem: item._id,
    }),
  },

  gallery: {
    label: 'Gallery',
    description: 'Photos of campus life, events and trips (images only).',
    icon: 'Image',
    model: 'Photo',
    fileTypes: ['image'],
    requiredFields: ['title'],
    extraFields: [{ name: 'albumId', label: 'Album', required: true, type: 'album' }],
    map: (item, user) => ({
      album: item.meta.extra?.albumId,
      url: item.file.url,
      publicId: item.file.publicId,
      caption: item.meta.title,
      uploadedBy: user.userId,
      contentItem: item._id,
    }),
  },
};

function get(key) {
  const dest = destinations[key];
  if (!dest) throw new Error(`Unknown destination: ${key}`);
  return dest;
}

// Catalog for the Studio UI and the AI prompt (no functions).
function catalog() {
  return Object.entries(destinations).map(([key, d]) => ({
    key,
    label: d.label,
    description: d.description,
    icon: d.icon,
    fileTypes: d.fileTypes || null,
    requiredFields: d.requiredFields,
    extraFields: d.extraFields,
  }));
}

function createTarget(key, item, user) {
  const dest = get(key);
  if (dest.fileTypes && !dest.fileTypes.includes(item.file.type)) {
    throw Object.assign(
      new Error(`${dest.label} only accepts: ${dest.fileTypes.join(', ')}`),
      { status: 400 }
    );
  }
  for (const field of dest.requiredFields) {
    if (!item.meta?.[field]) {
      throw Object.assign(new Error(`Missing required field: ${field}`), { status: 400 });
    }
  }
  for (const extra of dest.extraFields) {
    if (extra.required && !item.meta?.extra?.[extra.name]) {
      throw Object.assign(new Error(`Missing required field: ${extra.label}`), { status: 400 });
    }
  }
  const Model = mongoose.model(dest.model);
  return Model.create(dest.map(item, user));
}

module.exports = { get, catalog, createTarget, destinations };
