# DATAD Content Studio — Design Document

One centralized, AI-powered publishing system that becomes the single entry point for all admin content. Replaces per-module upload forms with a shared **publishing engine** that existing modules also call internally.

---

## 1. Architecture

```
┌──────────────────────────── Client (React) ───────────────────────────┐
│  /admin/studio                                                        │
│  UploadDropzone → UploadQueue → AnalysisCard → ReviewScreen → Publish │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ /api/studio/*
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Publishing Engine (server)                      │
│                                                                        │
│  ingestService ──► storageService (Cloudinary) ──► ContentItem (draft) │
│        │                                                               │
│        └─► analysisService (async)                                     │
│              ├─ extractors: pdf-parse / mammoth / xlsx / unzipper /    │
│              │              sharp / Cloudinary transforms (thumbnail)  │
│              ├─ ai/providers getProvider() → metadata + destination    │
│              ├─ ai/embeddings embed() → vector                         │
│              └─ duplicateService (sha256 + cosine similarity)          │
│                                                                        │
│  publishService ──► destinationRegistry ──► target model               │
│        │              (notes / resources / gallery / announcements /   │
│        │               companies / interview-questions / cases …)      │
│        └─► post-publish hooks: search index, tags, cache invalidation, │
│            ActivityLog, notifications                                  │
│                                                                        │
│  scheduler (cron) ──► publishes ContentItems where scheduledFor <= now │
└────────────────────────────────────────────────────────────────────────┘
```

Key principles:

- **`ContentItem` is the system of record for every upload.** Target modules (Note, Resource, Photo, Announcement…) keep their own schemas; publishing creates the target record and links back.
- **`destinationRegistry` is the only place that knows module specifics.** Adding a new destination = registering one object (label, model, field mapper, hooks). No changes to the engine.
- **Analysis is async.** Upload returns immediately; the client polls (or receives SSE) while status moves `uploaded → analyzing → ready_for_review`.
- **Existing module endpoints stay but delegate.** `resourceController.uploadFile`, `photoController.uploadPhoto`, etc. call `publishService.publishDirect()` with a pre-set destination — same engine, no AI step, zero client breakage.

## 2. Database changes

### New model: `server/models/ContentItem.js`

```js
const contentItemSchema = new mongoose.Schema({
  status: { type: String, enum: ['uploaded','analyzing','ready_for_review','draft',
           'scheduled','published','rejected','failed'], default: 'uploaded', index: true },

  file: {
    originalName: String,
    url: String,            // Cloudinary secure_url
    publicId: String,       // Cloudinary public_id (for delete/replace)
    mime: String,
    type: { type: String }, // pdf|word|excel|ppt|image|zip|video|audio|markdown|text
    size: Number,
    hash: { type: String, index: true },   // sha256 for exact dedupe
    pageCount: Number,
  },

  analysis: {               // AI-suggested values (never edited)
    title: String, description: String, summary: String,
    subject: String, semester: String, course: String,
    company: String, category: String,
    keywords: [String],
    language: String,
    handwritten: Boolean,
    ocrText: String,        // capped, for search/embedding only
    thumbnailUrl: String,
    confidence: Number,     // 0–1
    suggestedDestination: String,   // registry key
    model: String,          // which AI provider/model produced this
  },

  // Admin-confirmed values (analysis copied here, then edited on review screen)
  meta: {
    title: String, description: String, subject: String, semester: String,
    course: String, company: String, category: String, tags: [String],
    visibility: { type: String, enum: ['public','members','admins'], default: 'members' },
  },

  destination: {
    key: String,                                    // registry key, e.g. 'notes'
    targetModel: String,                            // 'Note'
    targetId: mongoose.Schema.Types.ObjectId,       // set on publish
  },

  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentItem' },
  version: { type: Number, default: 1 },
  supersedes: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentItem' },

  embedding: { type: [Number], select: false },     // from ai/embeddings/embed.js
  scheduledFor: Date,
  publishedAt: Date,
  rejectedReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

contentItemSchema.index({ 'meta.title': 'text', 'analysis.summary': 'text', 'meta.tags': 'text' });
contentItemSchema.index({ status: 1, createdAt: -1 });
```

### Changes to existing models (additive, all optional — no migration required)

Each publishable model (Note, Resource, Photo, Album, Announcement, Company, DailyCase, EntertainmentItem) gains:

```js
contentItem: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentItem' }
```

Legacy records simply have it unset. New `InterviewQuestionSet` model if Career-Hub interview questions don't yet have a home (currently they live inside `Company`; the registry can map to `Company.interviewQuestions` push instead — decided per destination in the registry, not the engine).

## 3. Upload workflow

1. Admin drops files (multi-file) on `/admin/studio`.
2. `POST /api/studio/uploads` — new middleware `server/middleware/studioUpload.js`: extends the `docUpload` mime table with `audio/*`, `text/markdown`, `text/plain`; limit 100 MB; memory storage (same pattern as today).
3. `ingestService` per file:
   - sha256 the buffer → **exact-duplicate check** against `ContentItem.file.hash`. If hit, item is created with `duplicateOf` set (the review screen surfaces it — upload is not blocked).
   - Upload to Cloudinary (`resource_type: 'auto'`, folder `datad/studio/`).
   - Create `ContentItem` (`status: 'uploaded'`), respond `201` with the items immediately.
   - Fire-and-forget `analysisService.analyze(itemId)` (status → `analyzing`).
4. Client polls `GET /api/studio/items/:id` every ~2s until `ready_for_review` or `failed`.

## 4. AI analysis workflow (`services/publishing/analysisService.js`)

**Stage A — deterministic extraction** (per file type):

| Type | Extractor | Output |
|---|---|---|
| PDF | `pdf-parse`; if <50 chars/page → treat as scanned, OCR via Cloudinary OCR add-on or `tesseract.js` (flagged optional) | text, pageCount, `handwritten` heuristic |
| Word | `mammoth` | text |
| Excel | `xlsx` (sheet names + first rows) | tabular sample |
| PowerPoint | `pptx` text via `officeparser` | slide text |
| Image | `sharp` metadata; Cloudinary thumbnail transform | dimensions, thumb |
| ZIP | `unzipper` — file listing only (never extract executables) | manifest |
| Video/Audio | Cloudinary metadata + poster frame | duration, thumb |
| Markdown/Text | raw (capped 20k chars) | text |

Thumbnails: Cloudinary URL transforms for images/video/PDF page 1; generic type icon otherwise.

**Stage B — LLM analysis.** One call through the existing `ai/providers` `getProvider()` (works with Groq primary, Anthropic/OpenAI fallback — same pattern as `services/aiService.js`). Prompt includes: filename, extracted text sample (≤6k chars), file stats, and the **destination registry catalog** (key + description of each destination). Strict JSON response:

```json
{"title":"…","description":"…","summary":"…","subject":"…","semester":"…",
 "course":"…","company":"…","category":"…","keywords":["…"],"language":"en",
 "handwritten":false,"suggestedDestination":"notes","confidence":0.87}
```

If AI is not configured (`getProvider` throws): fall back to filename-derived title + mime-based destination heuristics, `confidence: 0.3`. The studio must degrade gracefully.

**Stage C — embedding + near-duplicate.** `embed(title + summary + text sample)` via `ai/embeddings/embed.js`; cosine similarity against existing embeddings (top-20 by text-index prefilter). Similarity > 0.92 → set `duplicateOf` with a "similar content" flag distinct from exact hash match.

Status → `ready_for_review`. Any stage error → `failed` with `rejectedReason`, retryable via `POST …/reanalyze`.

## 5. Publishing workflow (`services/publishing/publishService.js`)

`POST /api/studio/items/:id/publish` (or the scheduler firing):

1. Validate `meta` against the destination's `requiredFields`.
2. `destinationRegistry[key].map(contentItem)` → target document payload; create record in the target collection (e.g. `Note.create`, `Resource.create`, `Photo.create` + album assignment, `Announcement.create`).
3. Write back `destination.targetId`, `publishedAt`, `status: 'published'`.
4. Post-publish hooks (registry-defined + global): update tag aggregates, refresh embedding with final metadata, invalidate any in-memory caches, `logActivity()` entry, optional notification/announcement.
5. Duplicate resolution: if publishing an item with `duplicateOf`, admin chose **Replace** (old ContentItem → `rejected`, target record updated in place, Cloudinary asset of old file deleted) or **Version** (`version = old.version + 1`, `supersedes` set).

`publishDirect({ file|url, destinationKey, meta, user })` — the backwards-compatibility entry point existing controllers call: creates a ContentItem already in `published` state, runs steps 2–4, skips AI.

**Draft** = save edits, status `draft`. **Schedule** = status `scheduled` + `scheduledFor`; a cron job (register in the existing automation setup in `server/index.js`, every minute) publishes due items. **Cancel/Reject** = status `rejected` (asset kept 30 days, then a cleanup job deletes from Cloudinary).

## 6. UI components (`client/src/pages/admin/StudioPage.jsx` + `client/src/components/studio/`)

Follows existing admin page conventions ([shared.jsx](../client/src/pages/admin/shared.jsx), Modal, EmptyState).

- **`UploadDropzone`** — full-width drag-and-drop + file picker, multi-file, type/size validation client-side, per-file progress bars.
- **`UploadQueue`** — cards for in-flight items with animated "Analyzing…" state (skeleton + shimmering AI badge).
- **`ReviewScreen`** (route `/admin/studio/:id`) — two-pane: left = preview (thumbnail, inline PDF/image/video preview, ZIP manifest); right = editable form pre-filled from `analysis`: title, description, AI summary (collapsible), subject/semester/course/company/category, tags (chip input), visibility, **DestinationPicker** (icon grid of registry destinations, AI suggestion pre-selected with **ConfidenceBadge** — green ≥0.8, amber ≥0.5, red below), metadata table (size, pages, language, typed/handwritten). Buttons: **Publish** (primary), **Save Draft**, **Schedule** (datetime popover), **Cancel**.
- **`DuplicateWarningBanner`** — shown when `duplicateOf` set: side-by-side comparison, actions *Replace existing*, *Publish as new version*, *Discard*.
- **`RecentUploads`** — tabbed table (All / Drafts / Scheduled / Published / Rejected), thumbnail, title, destination chip, status pill, uploader, date; row click → ReviewScreen.
- **Success animation** — confetti/checkmark micro-animation + toast with a link to the published item's live page.
- Sidebar/admin-hub entry: "Content Studio" becomes the first item; old per-module upload buttons become links into the Studio with the destination pre-selected (`/admin/studio?dest=notes`).

## 7. API endpoints (`server/routes/studioRoutes.js` — all `verifyToken` + `checkRole('admin')`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/studio/uploads` | Multipart, up to 10 files; returns created items |
| GET | `/api/studio/items` | List; filters: `status`, `destination`, `search`, pagination |
| GET | `/api/studio/items/:id` | Item detail (poll target during analysis) |
| PATCH | `/api/studio/items/:id` | Edit `meta`, `destination.key`, visibility |
| POST | `/api/studio/items/:id/publish` | Publish now (body: duplicate resolution choice) |
| POST | `/api/studio/items/:id/schedule` | Body `{ scheduledFor }` |
| POST | `/api/studio/items/:id/draft` | Save as draft |
| POST | `/api/studio/items/:id/reanalyze` | Re-run analysis |
| DELETE | `/api/studio/items/:id` | Reject/cancel (keeps asset 30 days) |
| GET | `/api/studio/destinations` | Registry catalog for the DestinationPicker |
| GET | `/api/studio/items/:id/duplicates` | Similar-content candidates |

Client API wrapper: `client/src/api/studio.js` (same axios pattern as `api/admin.js`).

## 8. Services (new `server/services/publishing/`)

| File | Responsibility |
|---|---|
| `ingestService.js` | hash, Cloudinary upload, ContentItem creation, kick off analysis |
| `analysisService.js` | extraction pipeline + LLM metadata + embedding |
| `extractors/` | one module per file type (pdf, docx, xlsx, pptx, image, zip, media, text) |
| `duplicateService.js` | hash lookup + cosine-similarity search |
| `destinationRegistry.js` | destination catalog: `{ key, label, icon, model, requiredFields, map(), hooks }` for notes, resources, gallery (photo/album), announcements, companies, interview-questions, cases, entertainment |
| `publishService.js` | validation, target-record creation, hooks, `publishDirect()` back-compat API |
| `scheduler.js` | cron: publish due scheduled items; purge rejected assets >30 days |

New deps: `pdf-parse`, `mammoth`, `xlsx`, `unzipper`, `officeparser`, `sharp` (all server-side). OCR optional behind `STUDIO_OCR=true`.

## 9. Migration plan (4 phases, each independently shippable)

**Phase 1 — Engine + Studio (additive).** Ship ContentItem, services, routes, StudioPage behind env flag `STUDIO_ENABLED`. Nothing existing changes. Admins can start using the Studio in parallel with old flows.

**Phase 2 — Delegate existing flows.** Refactor `resourceController.uploadFile`, `photoController.uploadPhoto`, note/announcement/company/case create endpoints to call `publishService.publishDirect()` internally. Request/response contracts unchanged → zero client changes, old UIs keep working. From here, every upload produces a ContentItem.

**Phase 3 — UI consolidation.** Replace per-module upload forms with "Add via Content Studio" deep links (`/admin/studio?dest=X`). Old forms kept for one release behind a "classic upload" link, then removed.

**Phase 4 — Backfill (optional).** Script `server/scripts/backfillContentItems.js`: create ContentItem stubs for existing Resources/Photos/Notes with files, so Recent Uploads and duplicate detection cover historical content. Idempotent, batched, dry-run flag.

Rollback at any phase = flip `STUDIO_ENABLED` off; Phase 2 delegation is behavior-preserving so it needs no rollback path of its own.

## 10. Testing checklist

**Unit**
- [ ] Each extractor: valid file, corrupt file, empty file, oversized text truncation
- [ ] analysisService: AI JSON parse, malformed AI response fallback, AI-disabled fallback path
- [ ] duplicateService: exact hash hit, near-duplicate >0.92, no false positive on unrelated docs
- [ ] destinationRegistry: every destination's `map()` produces a valid target document (schema-validate)
- [ ] publishService: required-field validation errors, replace vs version flows

**Integration (API)**
- [ ] Upload each of the 10 supported types → item reaches `ready_for_review`
- [ ] Unsupported mime and >100 MB rejected with clean error
- [ ] Non-admin gets 403 on every `/api/studio/*` route
- [ ] Publish to each destination → target record exists, back-link set, ActivityLog written
- [ ] Draft → edit → publish; Schedule → cron publishes at time; Cancel → status rejected
- [ ] Reanalyze after `failed`; concurrent double-publish of same item is idempotent
- [ ] `publishDirect` back-compat: old `/api/resources/upload` and photo upload still return identical response shapes

**E2E / UI**
- [ ] Drag-drop multi-file, progress, analyzing state, review screen prefill
- [ ] Edit every field + change destination before publish
- [ ] Duplicate banner appears and all three resolutions work
- [ ] Recent Uploads tabs filter correctly; published item link opens live page
- [ ] AI disabled (`GROQ_API_KEY` unset): studio still uploads and publishes with heuristic metadata
- [ ] Mobile/responsive + dark theme on Studio pages

**Non-functional**
- [ ] 100 MB video upload within timeout; analysis doesn't block the event loop (extraction in async chunks)
- [ ] Cloudinary failure mid-ingest leaves no orphan ContentItem (cleanup on error)
- [ ] Rejected-asset purge job removes Cloudinary files
