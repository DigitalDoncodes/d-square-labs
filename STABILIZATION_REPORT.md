# DATAD Stabilization Report

**Scope:** Phases 1–3 of the stabilization pass (Stability → Cleanup → Validation).
**Method:** Static analysis, build verification, module load verification, route-map
tracing, and live browser checks where a login was not required. No code changed
during this pass — this is the audit that precedes fixes, per the "wait for
approval before continuing" rule.

**Bottom line:** the build is green, no page is currently known to crash, and the
work from the last session (three critical bug fixes) is intact. But there is one
finding that outranks everything else: **the app currently runs two independent,
fully-built AI systems side by side**, and **two entire backend route files have
been silently orphaned**. Neither breaks anything today. Both are exactly the kind
of thing that causes a real incident three weeks from now, when someone fixes a bug
in the dead file and can't understand why nothing changed.

---

## Critical Issues

### C1 — Two live, independently-built AI systems render on the same screens
**Where:** Dashboard, Resume, Planner, Notes, Career, Finance (6 pages)

Every one of those pages now renders **two unrelated AI features** stacked on top
of each other:

- A `<Dax ...>`-branded feature (chat, resume review, etc.) that calls
  `POST /api/dax` → `daxService.js` → `runPipeline`/`aiGateway`.
- An `<AIEnhancement page="..." action="...">` card that calls `POST /api/enhance`
  → `studentIntelligenceEngine.js` (`ai/runtime-v2/`) — a **completely separate**
  engine with its own routing, its own prompts, its own quota bucket.

**Why this is Critical, not cosmetic:** the last major initiative in this codebase
was explicitly "one AI identity called Dax — the student should never feel they
are interacting with separate tools" (see `DAX_NAMING.md`). This is that exact
problem, reintroduced at the architecture level. A user on `/career` or
`/me/finance` today sees an unbranded "AI Enhancement" insight card sitting right
next to a Dax-branded action. It undoes the identity work directly, and it's the
kind of thing a user notices even if they can't name it — "why does this feel like
two different products stitched together?"

**Not fixing this yet.** This needs a decision, not a patch: does `/api/enhance`
get folded into Dax's pipeline (so `AIEnhancement` calls `daxTask()` under the
hood), or does `AIEnhancement` get relabeled and folded into the Dax visual
identity, or is one of the two engines killed outright? All three are valid;
none of them is safe to guess at unilaterally.

### C2 — Two backend route files are fully orphaned but still mounted
**Where:** `server/routes/aiRoutes.js` (~330 lines), `server/routes/chatRoutes.js` (~215 lines)

Traced every client call site. Nothing calls `/api/ai/*` or `/api/chat/*` anymore —
`api/ai.js`, `api/aiTools.js`, and `api/chat.js` were all quietly rewired to go
through `api/dax.js` → `POST /api/dax`. Both old route files are still `app.use()`-mounted
in `server/index.js`, still enforce their own (now-divergent) feature-gating and
quota logic, and still expose their own copy of `/memory` — none of it reachable.

**Confirmed, not assumed:** grepped every `import ... from '../api/{ai,aiTools,chat}'`
call site and traced each function to its actual `fetch`/`axios` target. Zero calls
land on `/api/ai/*` or `/api/chat/*`.

**Why this matters:** this is exactly how the last session's Dax Memory fix almost
got lost — I fixed the bug in `chatRoutes.js`, and it turned out the client had
already moved on to `daxService.js` (which, fortunately, got a faithful copy of
the same fix). Next time the luck may not hold. Dead code that still runs at
require-time and still holds routes is a trap for the next person who touches it.

**Not deleting yet.** Recommend confirming with you that nothing external (a
mobile client, a Postman collection, a partner integration) still targets these
paths, since deleting a route is a breaking API change even if today's web client
doesn't use it.

### C3 — Uncommitted parallel work is still live in the tree
**Where:** `.claude/worktrees/agent-a02580189f920506f`, `.claude/worktrees/agent-acfbd5abf6929ef94`,
plus ~35 modified/untracked files at the repo root not yet committed

This is the direct cause of C1 and C2 — the `/api/dax`, `/api/enhance`,
`AIEnhancement`, and Dax Memory panel work all arrived as uncommitted changes from
a parallel process, on top of (and in one case, overwriting) work from the
previous session. It already caused one real regression this week (`FinanceHubPage`
and `CareerHubPage` were silently rewritten mid-session, which is why the build
broke and had to be re-fixed).

**Recommendation:** commit the current working state in small, reviewed chunks
(exactly per your own rule — "prefer small, safe commits") rather than leaving
~50 files uncommitted indefinitely. I have not committed anything yet, since
"never batch unrelated changes" cuts against dumping this all into one commit,
and I want your sign-off on grouping before I do.

---

## High Priority

### H1 — `AdminAIDashboardPage` bypasses the shared API layer
**Where:** `client/src/pages/admin/AdminAIDashboardPage.jsx`

Every other page in the app calls the backend through `api/axios.js` (shared
instance: base URL, auth interceptor, consistent error shape). This page instead
does:
```js
fetch(`/api/admin/ai${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
```
Not broken today, but it silently drops the app's centralized 401-handling and
error normalization, and it will produce a *different* failure mode than every
other admin page the next time a token expires mid-session.

### H2 — Feature-gating logic duplicated three ways, already diverging
**Where:** `aiRoutes.js` (`requireFeature` middleware), `daxRoutes.js`
(`TASK_FEATURES` map), `enhanceRoutes.js` (`ENHANCE_FEATURES` map)

Three separate hand-maintained maps decide who can access what. They agree today
(spot-checked several features), but nothing enforces that they stay in sync, and
two of the three (`aiRoutes.js`'s) are unreachable anyway per C2. Once C1/C2 are
resolved this collapses to one map by construction.

### H3 — Stray build artifacts committed/left in the working tree
**Where:** `client/package-lock.json.bak`, `client/eslint.config.js.bak`,
`client/package.json.bak`, `server/routes/aiRoutes.js.tmp`

None are imported or referenced by anything (verified). Pure debris from an
earlier migration attempt. See **Safe Code Removal** below — these are the
lowest-risk deletions in this whole report.

---

## Medium Priority

### M1 — Lint is effectively disabled
**Where:** `client/eslint.config.cjs`

There are three ESLint config files in `client/` (`.eslintrc.json`,
`eslint.config.cjs`, `eslint.config.js.bak`). ESLint 8.57 resolves the flat
config (`eslint.config.cjs`), which is a minimal stub — no `jsx-a11y` (despite
`eslint-plugin-jsx-a11y` being an installed dependency), no
`eslint-plugin-react-hooks`, and no `react/jsx-uses-vars`, which means it
misreports JSX-only imports as unused. There is also no `"lint"` script in
`package.json`, so this has likely never run in CI or locally.

**Why Medium, not Critical:** it doesn't break anything today. But it is the
direct reason the three bugs fixed last session (a blank page, a crashing
workspace, an unreachable feature) shipped in the first place — a working
`no-undef`/`jsx-uses-vars` config would have caught every one of them
automatically. This is the single highest-leverage fix available once C1–C3 are
settled.

### M2 — `formatINR` / `exportCSV` duplicated across finance pages
**Where:** `FinanceTrackerPage.jsx`, `FinanceHubPage.jsx` (both live);
`FinancePage.jsx`, `FinanceOverviewPage.jsx` (both dead — see Safe Code Removal)

Once the two dead files are removed, this shrinks to two live duplicates. Worth
promoting to a shared `utils/finance.js` when convenient — not urgent, no bug
today.

### M3 — `.env.example` documents ~15 variables the running `.env` doesn't have
**Where:** `server/.env.example` vs `server/.env`

None are in `REQUIRED_ENV` (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`), so the
server boots fine without them. But `.env.example` is meant to be the onboarding
checklist for a new environment, and right now it overstates what's actually
required. Low effort to reconcile once the AI-provider consolidation (C1) lands
and it's clear which providers are actually in use.

---

## Low Priority

### L1 — Two admin AI dashboards, possibly-overlapping scope
**Where:** `/admin/ai-center` (`AdminAICenterPage.jsx`, cost/usage tracking) vs.
`/admin/ai-runtime` (`AdminAIDashboardPage.jsx`, provider health/observability)

Both are intentionally linked in the admin sidebar and appear to cover distinct
concerns (spend vs. runtime health) rather than being true duplicates. Flagging
for a product decision, not treating as a bug.

### L2 — `useOfflineQueue` hook is fully built but never called
**Where:** `client/src/hooks/useOfflineQueue.js`

A complete IndexedDB-backed mutation queue with Background Sync support, zero
importers. `OfflineBanner` shows offline status but nothing actually queues
mutations while offline. This reads as an unfinished feature rather than dead
code — recommend leaving it alone until Phase 4 decides whether to wire it up
or remove it.

---

## Suggested Refactors
*(Not performed — listed for future scoping, per "recommend deletions/changes
before making them.")*

1. **Consolidate `api/ai.js`, `api/aiTools.js`, and `api/dax.js`** into one
   module once C1 is resolved. All three already just wrap `daxTask()` — the
   split serves no purpose today.
2. **Collapse the three feature-gating maps (H2)** into one shared source once
   C2 is resolved.
3. **Promote `formatINR`/`exportCSV` (M2)** to `utils/finance.js`.

---

## Safe Code Removal
*(Recommended, not yet executed — awaiting your go-ahead per "work one issue at
a time.")*

Confirmed zero references for every item below:

| File | Why it's safe |
|---|---|
| `client/package-lock.json.bak` | Backup artifact, not read by npm/Vite |
| `client/eslint.config.js.bak` | Superseded by `eslint.config.cjs`; ESLint doesn't read `.bak` |
| `client/package.json.bak` | Backup artifact |
| `server/routes/aiRoutes.js.tmp` | Placeholder file, not `require()`'d anywhere |
| `client/src/pages/FinancePage.jsx` (604 lines) | Zero importers; fully superseded by `FinanceHubPage` |
| `client/src/pages/career/ReadinessPage.jsx` | Unrouted; absorbed into `CareerHubPage` last session |
| `client/src/pages/me/FinanceOverviewPage.jsx` | Unrouted; absorbed into `FinanceHubPage` last session |
| `client/src/hooks/useValidation.js` | Zero importers; logic duplicated inline in `useRegisterForm.js` |
| `client/src/components/dashboard/PremiumPanel.jsx` | Zero importers |
| `client/src/components/dashboard/TodayFocus.jsx` | Zero importers |
| `client/src/components/entertainment/DashboardWidget.jsx` | Zero importers |

**Not included:** `aiRoutes.js`, `chatRoutes.js`, `api/aiTools.js` — these are
dead by *usage* but deleting them is entangled with the C1/C2 decision, so they
wait for that call rather than being removed as routine cleanup.

---

## Ready for Production

Confirmed working, verified where a login wasn't required to do so:

- **Build:** green, zero warnings, zero errors.
- **Module graph:** every route/service file `require()`s cleanly; no boot-time crash.
- **`/about`:** verified live in a browser (was broken last session; fix holds).
- **Core workspaces route correctly:** Study, Career, Community, Life, Finance,
  Admin all have valid `<Route>` entries resolving to files that exist and
  default-export.
- **No console.log/debugger statements** left in `client/src`.
- **Dark mode / theme resolution:** pre-paint script + `ThemeContext` verified
  consistent (from last session).
- **Design system consistency:** container measure, gradients, button/card
  primitives — all previously audited and holding.

**Not yet verified (needs a login):** authenticated navigation end-to-end, API
success/failure states under real data, mobile viewport rendering of
authenticated pages, empty/loading states for Notes/Planner/Community/Wellbeing,
Dax Memory against a real account, screen-reader pass. These are Phase 3 items
that require walking through the app as a user — next step once you're ready.

---

## What I'd fix first, in order

1. **Decide C1/C2 together** — they're the same decision (which AI pipeline is
   canonical) wearing two hats. This is the one thing worth a real conversation
   before I touch code.
2. **C3** — commit the current stable state in reviewed chunks so we stop
   working on a moving target.
3. **H1** (`AdminAIDashboardPage` fetch pattern) — small, isolated, zero
   dependency on the C1 decision.
4. **M1** (fix lint) — highest leverage per line of effort; catches this whole
   class of bug automatically going forward.
5. **Safe Code Removal** table — batch these as one low-risk commit once you
   confirm.

I have not made any code changes in this pass. Tell me which of the above to
start with, or reorder — per your own rules I'm treating this report as the
checkpoint to wait at.
