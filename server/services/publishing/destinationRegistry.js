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
require('../../models/Company');

const FILE_TYPE_TO_RESOURCE_TYPE = {
  pdf: 'pdf', word: 'word', excel: 'excel', ppt: 'ppt', zip: 'zip', video: 'video',
};

const COMPANY_SECTORS = ['it_services', 'banking', 'fmcg', 'auto', 'consulting', 'manufacturing', 'startup', 'other'];
const QUESTION_CATEGORIES = ['hr', 'technical', 'case', 'guesstimate'];

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Pull question-looking lines out of extracted document text.
function parseQuestions(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter((l) => l.length >= 10 && l.length <= 500 && /\?$/.test(l));
}

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
      // Direct publishes (module forms) pass verbatim content via extra;
      // studio uploads compose content from the description + attachment.
      content: item.meta.extra?.content ?? [
        item.meta.description,
        item.analysis?.summary && `\n## AI Summary\n${item.analysis.summary}`,
        item.file?.url && `\n[Attached file: ${item.file.originalName}](${item.file.url})`,
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
      type: item.meta.extra?.resourceType || FILE_TYPE_TO_RESOURCE_TYPE[item.file.type] || 'link',
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
      body: item.meta.extra?.body
        ?? [item.meta.description, item.file?.url && `\nAttachment: ${item.file.url}`]
          .filter(Boolean).join('\n'),
      priority: item.meta.extra?.priority === 'important' ? 'important' : 'normal',
      pinned: Boolean(item.meta.extra?.pinned),
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
      caption: item.meta.extra?.caption ?? item.meta.title,
      uploadedBy: user.userId,
      contentItem: item._id,
    }),
  },
  companies: {
    label: 'Career Hub → Companies',
    description: 'Recruiter prep cards: company overview, hiring process, salaries, prep tips.',
    icon: 'Briefcase',
    model: 'Company',
    requiredFields: ['title', 'description'],
    extraFields: [
      { name: 'sector', label: 'Sector', required: true, options: COMPANY_SECTORS },
      { name: 'website', label: 'Website', required: false },
      { name: 'salaryRange', label: 'Salary range', required: false },
    ],
    // Custom create: slug must be unique, so a plain map() isn't enough.
    create: async (item, user) => {
      const Company = mongoose.model('Company');
      const name = item.meta.company || item.meta.title;
      let slug = slugify(name);
      for (let n = 2; await Company.exists({ slug }); n += 1) slug = `${slugify(name)}-${n}`;
      const overview = [
        item.meta.description,
        item.analysis?.summary && `\n${item.analysis.summary}`,
        item.file?.url && `\nReference: ${item.file.url}`,
      ].filter(Boolean).join('\n').slice(0, 2000);
      return Company.create({
        name: name.slice(0, 120),
        slug,
        sector: COMPANY_SECTORS.includes(item.meta.extra?.sector) ? item.meta.extra.sector : 'other',
        website: item.meta.extra?.website,
        salaryRange: item.meta.extra?.salaryRange,
        overview,
        createdBy: user.userId,
        contentItem: item._id,
      });
    },
  },

  'interview-questions': {
    label: 'Career Hub → Interview Questions',
    description: 'Interview question sets that attach to an existing company prep card.',
    icon: 'MessageCircleQuestion',
    model: 'Company',
    requiredFields: ['title'],
    extraFields: [
      { name: 'companyId', label: 'Company', required: true, type: 'company' },
      { name: 'category', label: 'Category', required: false, options: QUESTION_CATEGORIES },
      { name: 'questions', label: 'Questions (one per line, auto-extracted from the file if left empty)', required: false, type: 'textarea' },
    ],
    // Custom create: appends to an existing Company rather than creating a record.
    create: async (item) => {
      const Company = mongoose.model('Company');
      const company = await Company.findById(item.meta.extra?.companyId);
      if (!company) {
        throw Object.assign(new Error('Selected company not found'), { status: 400 });
      }
      const manual = (item.meta.extra?.questions || '')
        .split('\n').map((l) => l.trim()).filter((l) => l.length >= 10 && l.length <= 500);
      const parsed = manual.length ? manual : parseQuestions(item.analysis?.ocrText);
      if (!parsed.length) {
        throw Object.assign(
          new Error('No questions found — enter them in the Questions field (one per line)'),
          { status: 400 }
        );
      }
      const category = QUESTION_CATEGORIES.includes(item.meta.extra?.category)
        ? item.meta.extra.category : 'hr';
      const existing = new Set(company.interviewQuestions.map((q) => q.question.toLowerCase()));
      for (const question of parsed) {
        if (!existing.has(question.toLowerCase())) {
          company.interviewQuestions.push({ category, question });
        }
      }
      await company.save();
      return company;
    },
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
  if (dest.create) return dest.create(item, user);
  const Model = mongoose.model(dest.model);
  return Model.create(dest.map(item, user));
}

module.exports = { get, catalog, createTarget, destinations };
