# DATAD — Dax Migration Blueprint

**Scope:** analysis only. No code modified. This document assumes the
architectural decision recorded in `AI_ARCHITECTURE_REPORT.md`: **Dax is the
canonical product; Runtime V2 is infrastructure, not a separate AI product.**
Every disposition below is justified against that decision, with evidence.

**One thing found while producing this blueprint that changes its shape:**
there is a **third, already-abandoned migration attempt** sitting in the repo
(`ai/runtime-v2/migration.js`, `ai/runtime-v2/index.js`,
`ai/runtime-v2/MIGRATION_REPORT.md`) that predates `aiGateway.js`. I tested it
directly — `require('./ai/runtime-v2/migration')` throws immediately
(`Cannot find module '../index'`) because it depends on a `server/ai/index.js`
that was never created. Its own report even documents this as a known,
unfixed risk. Nothing outside `runtime-v2/` requires either file (grepped,
confirmed zero results). This blueprint formally supersedes that old plan —
see §0.

---

## 0. Superseding the existing `runtime-v2/MIGRATION_REPORT.md`

That document (dated before this decision) proposes the **opposite direction**
of what's been decided: a 6-phase plan ending in "V1 Decommission" — i.e., V2
*replacing* V1 entirely as a competing product. That plan was never executed
past step 1 (`v1_only`, still the default today). It should not be read as
active guidance going forward. This blueprint's Phase 1 includes formally
marking that document as historical (see Phase 1, item P1-5) so it stops being
a second, contradictory source of truth. The runtime-v2 *infrastructure* it
describes is exactly what we're keeping — only the "V2 as a rival runtime"
framing is being retired.

---

## 1. Target Architecture

```
Frontend  (unchanged contract)
   │  POST /api/dax  { task, ...payload }
   ▼
Dax API                 server/routes/daxRoutes.js
   │  tier-gate, quota, task dispatch (unchanged contract)
   ▼
Dax Orchestrator         server/ai/daxService.js  (evolves in place)
   │  gathers context (resume/task/note/memory), composes withDaxIdentity()
   │  prompt, decides routing/caching/verification via infra below
   ▼
Runtime V2 Infrastructure   server/ai/runtime-v2/*  (imported directly —
   │                          NOT via the broken index.js/migration.js)
   │  modelRouterV2 (routing) · cacheLayer · circuitBreaker · costOptimizer
   │  latencyOptimizer · responseVerifierV2 · telemetryEngine · modelRegistry
   │  capabilityEngine · intentEngine · contextBuilder (context assembly)
   ▼
Model Providers           server/ai/providers/*  (already shared, unchanged)
   Groq / Anthropic / OpenAI-compatible / NVIDIA
```

**What does not change at any point in this migration:** the frontend's
contract (`POST /api/dax {task, ...}`, `GET/PATCH/DELETE /api/dax/memory`,
`GET /api/dax/chat/history`, `DELETE /api/dax/chat`). Every phase below is
entirely behind that boundary. This is what makes zero-downtime, zero-flag-day
possible — the thing the frontend calls never moves.

---

## 2. File-by-file disposition

Legend: **Keep** (no change needed) · **Merge** (functionality folds into
another file, this file's name goes away) · **Adapt** (stays, but its internals
change to fit the new role) · **Deprecate** (stop calling it, leave it in place
with a notice) · **Remove later** (delete only after a deprecation window with
zero traffic confirmed).

### Frontend

| File | Disposition | Why |
|---|---|---|
| `client/src/api/dax.js` | **Keep** | Already the canonical transport. No change — this *is* the "Dax API" client boundary. |
| `client/src/api/ai.js`, `client/src/api/aiTools.js` | **Merge** into `api/dax.js` | Both are thin wrappers that already call `daxTask()` under the hood (confirmed in `AI_ARCHITECTURE_REPORT.md` §1). Merging removes two files with zero behavior change — every function they export already resolves to the same endpoint. |
| `client/src/api/chat.js` | **Keep, unchanged** | Already a compatibility shim over `api/dax.js` (fixed last session). No further action — it's doing exactly its job. |
| `client/src/api/enhance.js` | **Deprecate → Remove later** | Only caller is `useEnhancement.js`. Removed once Phase 3 retires `/api/enhance` (its only endpoint). |
| `client/src/hooks/useEnhancement.js` | **Deprecate → Remove later** | Same — single-purpose wrapper around `enhance()`. No other consumer (confirmed 1 importer: `AIEnhancement.jsx`). |
| `client/src/components/common/AIEnhancement.jsx` | **Deprecate → Remove later** | Per `UX_REVIEW.md`, this is also the component responsible for the "AI chrome has crept back" finding. Its removal is a UX fix and an architecture fix at the same time — same root cause, one change. |
| `client/src/pages/{Resume,Planner,Notes,Career,Finance,Dashboard}*.jsx` (6 files) | **Adapt** | Each currently renders one or more `<AIEnhancement>` cards alongside a Dax-branded feature. Adapting means: remove the `<AIEnhancement>` card, keep (or add, where missing — e.g. Notes has no Dax-branded summarize button today) the equivalent Dax-branded call. This is a per-page content change, not a structural one — layout/design stays exactly as-is per `UX_REVIEW.md`'s "no redesigns" stance. |

### Backend — routes

| File | Disposition | Why |
|---|---|---|
| `server/routes/daxRoutes.js` | **Adapt** | Stays as the sole live controller. Internals evolve across Phase 2 to call the orchestrator's new infra-backed path; its HTTP contract (paths, request/response shape, tier-gate map, quota map) does not change. |
| `server/routes/enhanceRoutes.js` | **Deprecate (Phase 3) → Remove later (Phase 4)** | Its only job — dispatching to `studentIntelligenceEngine.enhance()` — has no reason to exist once that engine's infrastructure is called from inside the Dax Orchestrator instead. Removing the *route* is safe once §Phase 3's traffic check confirms zero callers; removing the *engine file* is a separate, later decision (see below — its logic partially survives). |
| `server/routes/aiRoutes.js` | **Remove later**, no deprecation window needed | Already orphaned today — confirmed zero live callers in `AI_ARCHITECTURE_REPORT.md` §4. The only reason this isn't in Phase 1 is your instruction to hold all deletions until this blueprint existed. It can move to Phase 1 cleanup (see P1-1) since "remove later" here really means "remove as soon as convenient," not "wait for a migration to complete" — there's no migration dependent on this file. |
| `server/routes/chatRoutes.js` | **Remove later**, same reasoning as `aiRoutes.js` | Zero live callers, confirmed. Its logic is already a verbatim ancestor of `daxService.js`'s live chat handler — nothing to port, it was already ported. |
| `server/routes/aiRoutes.js.tmp` | **Remove now** (Phase 1) | Empty placeholder, not `require()`'d by anything. Pure debris. |

### Backend — `server/ai/` core (V1 / Dax's current runtime)

| File | Disposition | Why |
|---|---|---|
| `server/ai/daxService.js` | **Adapt** — becomes the formal Dax Orchestrator | This is the file that changes the most. Today it calls `runPipeline`/`aiGateway` for execution. It evolves to call Runtime V2 infrastructure modules directly for routing, caching, verification, and telemetry, while keeping its own context-gathering, `withDaxIdentity()` composition, and memory read/write exactly as they are. |
| `server/ai/aiGateway.js` | **Adapt, then shrink** | Its `_execV1` path (and everything `_execV1` depends on) keeps working throughout Phase 1–2 — nothing routes through `_execV2`/`_routeV2`/`_routeShadow`/`_routeHybrid` today regardless (dormant, confirmed). Those four functions, plus the V1/V2 mode-switching scaffolding (`getMode`/`setMode`/`_currentMode`/the `modes` array), become dead once the orchestrator calls infrastructure directly instead of going through this gateway's mode switch — **Deprecate in Phase 2, Remove later in Phase 4.** The parts of this file that do real work today (`_buildProfile`/`_enrichWithProfile`, the `intelligence-layer` integration, `persistExecutionMetrics`) need a new home — see `intelligence-layer` note below. |
| `server/ai/agents/pipeline.js` | **Adapt** | Keeps its RAG-context-injection role (`_buildEnrichedSystem`) but its call to `aiGateway.process()` is redirected to call the orchestrator's new execution path once that exists (Phase 2). Everything upstream of that one call (building `enrichedSystem` from `systemPrompt`/`memoryContext`/`ragContext`) is unaffected. |
| `server/ai/runner.js` | **Keep** | Used directly by 8 automation job files (per the OLD `runtime-v2/MIGRATION_REPORT.md`'s own accounting, which I have no reason to doubt — automation jobs are outside this migration's scope). Its gateway-delegation-with-fallback design (`_gatewayBypass`, lazy `require`) is sound and unaffected by anything in this plan. |
| `server/ai/router.js` (`routeTask` — task-to-provider-tier mapping) | **Keep, for now — likely mergeable into `modelRouterV2` later** | Does a simpler version of what `modelRouterV2.routeRequest()` does. Not touching this in Phases 1–3; flagging as a Phase-4-or-later simplification candidate once the orchestrator is fully on Runtime V2 routing and this file's callers have migrated. |
| `server/ai/validator.js` | **Deprecate → Merge into `responseVerifierV2` usage** | Called today by `agents/pipeline.js` (confirmed). `responseVerifierV2.js` does the same job (verify output quality) with a more complete feature set (task/intent-aware, supports retry). Once the orchestrator adopts `responseVerifierV2` in Phase 2, this file's single caller goes away and it can be removed in Phase 4. |
| `server/ai/memory.js` | **Keep — this is the canonical memory layer** | Richer field set, bug-fixed, actively used. Nothing about this migration should touch it. |
| `server/ai/retriever.js` | **Keep through Phase 2, then Adapt/Merge into `contextBuilder`** | Its three composed functions (`buildResumeRAGContext`, `buildPlannerRAGContext`, `buildCareerHubRAGContext`) do the same *kind* of job as `runtime-v2/contextBuilder.js`'s generic `buildContext(userId, {contextKeys})`, but hand-built per feature rather than key-driven. `contextBuilder.js`'s design is more extensible and is genuinely infrastructure-grade — a reasonable Phase 2/3 target is porting `retriever.js`'s three composed functions into `contextBuilder.js`'s `CONTEXT_KEY_LOADERS` registry, then retiring `retriever.js`. Not required for Phase 2 to succeed — can trail behind. |
| `server/ai/prompts/index.js` | **Keep — canonical prompt source** | Carries `withDaxIdentity()` composition (via `daxService.js`/`aiRoutes.js`'s usage pattern). Stays exactly as-is; it's the identity-bearing prompt content in this whole system. |
| `server/ai/dax.js` (`withDaxIdentity`, `DAX_CORE`) | **Keep, unchanged** | The actual identity definition. Nothing in this migration touches product identity. |

### Backend — `server/ai/intelligence-layer/` (student profile enrichment)

| File | Disposition | Why |
|---|---|---|
| `server/ai/intelligence-layer/*` (profileFactory, scoringEngine, 8 collectors) | **Keep, unchanged — but its caller moves** | Currently invoked by `aiGateway.js`'s `_buildProfile()` for *every* request (`processRequest()` calls it before the V1/V2 branch, confirmed at `aiGateway.js:85`). Since this enrichment step has nothing to do with the V1/V2 duplication — it's a third, orthogonal system that both `/api/dax` and `/api/enhance` currently benefit from via `aiGateway.js` — Phase 2 needs to relocate this one call (`_buildProfile`/`_enrichWithProfile`) into `daxService.js` directly, so students don't lose profile-enriched prompts when `aiGateway.js`'s mode-switch machinery is retired. This is the one piece of `aiGateway.js` that must be explicitly ported, not just dropped. |

### Backend — `server/ai/runtime-v2/` (the infrastructure being adopted)

| File | Disposition | Why |
|---|---|---|
| `modelRouterV2.js` | **Adapt → becomes the orchestrator's router** | `routeRequest()`/`resolveProvider()` already reuse the shared `ai/providers` layer (confirmed). This is the direct replacement for `aiGateway.js`'s mode-switch logic. |
| `cacheLayer.js` | **Keep as-is, wire in** | Self-contained (`set`/`get`/`hasCache`/`invalidate`). No dependency on the broken `migration.js`/`index.js`. Safe to import directly. |
| `circuitBreaker.js` | **Keep as-is, wire in** | Same — self-contained, provider-health-aware call gating. |
| `costOptimizer.js`, `latencyOptimizer.js` | **Keep as-is, wire in** | Model-selection heuristics; no external dependency risk. |
| `responseVerifierV2.js` | **Keep as-is, wire in** | Replaces `ai/validator.js` per above. |
| `telemetryEngine.js` | **Keep as-is, wire in — replaces `persistExecutionMetrics`** | `aiGateway.js`'s `persistExecutionMetrics`/`_persistShadowMetrics` write to `RuntimeComparison`; once the mode-switch is gone, `RuntimeComparison`'s V1-vs-V2-comparison purpose goes with it. `telemetryEngine.recordCall`/`persistCall` becomes the one metrics path going forward — a cleaner model than the current dual-write. |
| `modelRegistry.js` | **Keep as-is, wire in** | The largest file in the directory (41KB) — a static model/capability/pricing table. Pure data + lookup functions, zero risk. |
| `capabilityEngine.js`, `intentEngine.js` | **Keep as-is, wire in** | Feed `modelRouterV2`'s routing decision. Self-contained. |
| `contextBuilder.js` | **Adapt** | Becomes the target for `retriever.js`'s functionality (see above). Its `CONTEXT_KEY_LOADERS` design is the extensibility win worth keeping from Runtime V2. |
| `providerHealthEngine.js` | **Keep as-is, wire in** | Feeds `circuitBreaker.js`. |
| `promptVersionManager.js`, `learningEngine.js` | **Keep as-is, wire in later (Phase 3+)** | Genuinely useful (prompt A/B tracking, outcome-based model ranking) but not load-bearing for correctness — safe to adopt after the core routing/caching/verification path is stable, not required for Phase 2 to close. |
| `knowledgeGraphAdapter.js` | **Keep as-is, low priority** | `init(graphApi)` suggests this expects an external graph API that may not be configured — worth a direct question before wiring it in, not a migration blocker either way. |
| `promptRegistry.js` | **Adapt, fix before wiring in** | Two known bugs must be fixed as part of adopting this file (not before — they're irrelevant while it's only reachable via the dead `/api/enhance` path, but become load-bearing the moment the orchestrator depends on it): (1) `PROMPT_REGISTRY` is never seeded — `registerPrompt()` is exported but never called; (2) `V1_PROMPT_TASK_MAP['summarise-note']` points at a `summariseNote` key that doesn't exist in `ai/prompts/index.js` (§ `AI_ARCHITECTURE_REPORT.md` Trace C). Both are Phase 2 prerequisites, not Phase 4 cleanup — shipping the orchestrator on top of a prompt registry with silent empty-string fallbacks would reproduce the exact quality bug this whole migration exists to fix. |
| `studentIntelligenceEngine.js` | **Merge, selectively** | Its `enhance()` function is 100 lines of genuinely reusable orchestration logic (build context → compute capabilities → route → resolve provider → generate → verify → format → record telemetry) — this is close to what the Dax Orchestrator's new internals should look like. Recommend: extract this control flow into `daxService.js` as its new execution path, rather than keeping `enhance()`/`PAGE_ACTIONS` as a separate entry point. `PAGE_ACTIONS`'s 17 action definitions should be reconciled with `daxService.js`'s 14 `HANDLERS` (§ the overlap table in `AI_ARCHITECTURE_REPORT.md` §4) — 11 are the same feature under two names; the 3 with no Dax equivalent (`dashboard:detect-problems`, `recommend:next`, plus whichever of `dashboard:view`/`resume:ats` don't already map) need a decision on whether they become new Dax tasks or are dropped. **This file's `healthCheck()` function should be kept and re-pointed at whatever admin dashboard needs it** (`AdminAIDashboardPage.jsx`/`AdminAICenterPage.jsx` — not fully traced in this pass, flag for direct check before Phase 3). |
| `ai/runtime-v2/memoryAdapter.js` | **Remove — do not port** | Writes to the same `UserMemory` collection as `ai/memory.js` (already the canonical layer) but with a narrower, partially-broken field set (`AI_ARCHITECTURE_REPORT.md` §4 — two of its three write fields are silently dropped by the schema). No value to preserve here; `ai/memory.js` already does this job correctly. |
| `ai/runtime-v2/migration.js` | **Remove now (Phase 1)** | Proven to crash on `require()` — see the top of this document. Dead on arrival, never wired to anything live, zero risk to remove immediately rather than waiting for a later phase. |
| `ai/runtime-v2/index.js` | **Remove now (Phase 1)** | Depends on `migration.js` at its own top-level `require`, so it inherits the same crash. Zero external callers (confirmed by grep). The orchestrator will import individual `runtime-v2/*` submodules directly rather than through this barrel file — cleaner, and avoids resurrecting broken scaffolding. |
| `ai/runtime-v2/MIGRATION_REPORT.md` | **Keep, annotate as historical** | Genuinely useful documentation of *why* `aiGateway.js` exists and how its modes work — don't delete the history. Add a one-line pointer at the top to this document so nobody follows its now-superseded 6-phase plan. (This is a documentation edit, not a code change — still out of scope for this analysis-only pass, noted for Phase 1.) |

### Models

| File | Disposition | Why |
|---|---|---|
| `models/UserMemory.js` | **Keep, unchanged** | Single source of truth for memory; both current writers already target it. No schema change required by this migration (though the `promptVersionManager`/`telemetryEngine` adoption may eventually want their own collections — out of scope here). |
| `models/RuntimeComparison.js` | **Deprecate → Remove later** | Existed specifically to compare V1 vs V2 output — that comparison has no purpose once there's one orchestrator, not two competing runtimes. Keep through Phase 2 (still being written to, harmless), stop writing in Phase 3, remove in Phase 4 once confirmed nothing reads historical rows that matter. |
| `models/AiUsage.js` | **Keep, unchanged** | Already the single shared quota counter for both current pipelines (confirmed in `AI_ARCHITECTURE_REPORT.md` Risks). Nothing changes here. |

---

## 3. Dependency-break analysis

What would break, precisely, if each orphaned/legacy file were removed *today*, before any phase runs:

| If removed today... | Breaks | Confirmed by |
|---|---|---|
| `routes/aiRoutes.js` | Nothing. No client code targets `/api/ai/*`. | Traced every `api/ai.js`/`api/aiTools.js` function to its real request target — all resolve to `/api/dax`. |
| `routes/chatRoutes.js` | Nothing. No client code targets `/api/chat/*` (only `/api/dax/chat/*`, a different route file). | Traced `api/chat.js` — imports exclusively from `api/dax.js`. |
| `routes/aiRoutes.js.tmp` | Nothing. Not `require()`'d anywhere. | Direct grep, zero references. |
| `ai/runtime-v2/migration.js` | Nothing live. Would break the (already-broken) `runtime-v2/index.js` further, but that file is also unreferenced. | Directly executed `require()` — confirmed crash, confirmed zero external callers. |
| `ai/runtime-v2/index.js` | Nothing. Zero requires from outside `runtime-v2/`. | Grepped explicitly. |
| `routes/enhanceRoutes.js` **(not yet — Phase 3 only)** | `AIEnhancement.jsx` on 6 pages would get network errors immediately. **Do not remove before the frontend stops calling it.** | 6 confirmed render sites in `AI_ARCHITECTURE_REPORT.md` §1. |
| `ai/runtime-v2/studentIntelligenceEngine.js` **(not yet)** | Same as above — `enhanceRoutes.js` requires it directly. Also: if any of its logic hasn't been ported into `daxService.js` first, those specific features (e.g. `dashboard:detect-problems`, which has no Dax equivalent today) disappear entirely, not just move. | Confirmed sole caller is `enhanceRoutes.js`; confirmed 3 `PAGE_ACTIONS` have no matching `daxService.js` `HANDLERS` key. |
| `ai/validator.js` **(not yet)** | `agents/pipeline.js` would throw on import (`require('../validator')` unresolved) — breaks every RAG-augmented Dax task (resume review, career advice, etc.), i.e. most of the live product. **Hard dependency; do not remove until `agents/pipeline.js` is repointed at `responseVerifierV2`.** | Direct grep confirms this is the only caller and it's a top-level `require`. |
| `aiGateway.js`'s V1 path (`_execV1` and everything under it) **(not until Phase 2 is fully verified)** | Every live `/api/dax` request that isn't rerouted to the new orchestrator path would fail — this is the actual execution engine behind Dax Chat and most other tasks today. | Traced in `AI_ARCHITECTURE_REPORT.md` Trace A — this is the live path for chat. |
| `ai/intelligence-layer/*` **(not ever, without relocating its caller first)** | Every AI response across the whole app silently loses `[Student Context]` enrichment — not a crash, a quality regression, since `_buildProfile` fails soft (`try { } catch { return null }`, confirmed at `aiGateway.js:109-116`). This is the kind of break that wouldn't show up in a smoke test. | Confirmed `_buildProfile`'s try/catch swallows failure; confirmed it's called unconditionally in `processRequest()`. |

---

## 4. Migration Phases

Every phase ends with the application in a fully working state. No phase
depends on "finishing" the next one — each is independently shippable.

### Phase 1 — No behavioral changes

Goal: clear the ground. Nothing a user could notice changes.

- **P1-1.** Remove `routes/aiRoutes.js.tmp` (placeholder debris, zero references).
- **P1-2.** Remove `ai/runtime-v2/migration.js` and `ai/runtime-v2/index.js`
  (both proven dead — crash on load, zero external callers, not part of any
  live request path today).
- **P1-3.** Remove `routes/aiRoutes.js` and `routes/chatRoutes.js` **from
  `server/index.js`'s mount list** — but do not delete the files yet. This is
  the safest possible first step on the "retire two dead routes" question:
  un-mounting is instantly reversible (one line each), fully confirms nothing
  external was depending on them (a 404 will surface immediately in logs if
  something was), and carries none of the risk of an outright file deletion.
  If nothing breaks after a reasonable observation window, delete the files
  in Phase 4 rather than Phase 1 — no reason to rush an irreversible step
  when the reversible one already proves safety.
- **P1-4.** Consolidate `api/ai.js` and `api/aiTools.js` into `api/dax.js` on
  the frontend, updating their ~5 import sites (`ResumePage`, `PlannerPage`,
  `CommandPalette`, `AIToolsPage`, `AdminCasesPage`, `DaxMemoryPanel`) to
  import from `api/dax.js` directly. Zero behavior change — every function
  already calls the same endpoint; this only removes the extra file.
- **P1-5.** Annotate `ai/runtime-v2/MIGRATION_REPORT.md` with a pointer to
  this document (documentation only, not a code change).
- **Verification:** full build, full route map re-check, confirm `/api/dax`
  and `/api/enhance` both still respond exactly as before (nothing in Phase 1
  touches either's execution path) — this phase is deletions of already-dead
  weight, so "fully functional" is trivially satisfied, but should still be
  verified rather than assumed.

### Phase 2 — Move Runtime V2 infrastructure behind Dax

Goal: `daxService.js` becomes the real orchestrator. This is the substantial
engineering phase; everything before and after it is comparatively mechanical.

- **P2-1.** Fix `promptRegistry.js`'s two confirmed bugs *before* anything
  depends on it (§2's `promptRegistry.js` entry): seed `PROMPT_REGISTRY` with
  real content for the tasks currently falling through to `system: ''`, and
  correct the `summariseNote` key mismatch. This directly fixes the two live
  quality regressions found in `AI_ARCHITECTURE_REPORT.md` Traces B2/C, as a
  side effect of the migration rather than a separate fix.
- **P2-2.** Relocate `aiGateway.js`'s `_buildProfile`/`_enrichWithProfile`
  (the `intelligence-layer` call) into `daxService.js`, so every Dax task
  keeps its `[Student Context]` enrichment once the gateway's mode-switch is
  no longer in the request path.
- **P2-3.** Give `daxService.js` a new internal execution path that calls
  Runtime V2 infrastructure directly: `modelRouterV2.routeRequest()` for
  routing, `cacheLayer`/`circuitBreaker` around the provider call,
  `responseVerifierV2.verifyResponse()` in place of `ai/validator.js`,
  `telemetryEngine.recordCall()` in place of `persistExecutionMetrics`. This
  is modeled directly on `studentIntelligenceEngine.js`'s `enhance()`
  function (§2) — that control flow is the template, not a mystery to invent.
- **P2-4.** Switch this new path in **behind a request-level flag** (e.g. per
  task, or per percentage of traffic) rather than cutting every task over at
  once — this is the "incremental, zero flag day" requirement in practice.
  `aiGateway.js`'s existing `_currentMode` pattern already demonstrates the
  right shape for this (a runtime-switchable flag with a safe default) — reuse
  that pattern rather than inventing a new one, just pointed at "old
  `_execV1`" vs "new infra-backed path" instead of "V1 vs V2."
- **P2-5.** Once every `daxService.js` task has been verified on the new
  path (per-task, not all-at-once — see P2-4), retire `aiGateway.js`'s
  `_execV2`/`_routeV2`/`_routeShadow`/`_routeHybrid` and the mode-switch
  scaffolding around them. `_execV1` and the messages-array chat path can
  also retire once chat itself is confirmed on the new path — this is the
  last task to move, since it's the highest-traffic one and the most
  valuable to get right before cutting over.
- **Verification, per task, before moving to the next:** identical response
  shape, tier-gating unchanged, quota still decrements the same `AiUsage`
  document, `withDaxIdentity()` still present in the composed prompt, memory
  still reads/writes via `ai/memory.js`. This is exactly the kind of
  regression a working lint/test setup would catch automatically — worth
  revisiting the Stabilization Report's lint-repair recommendation before
  starting this phase, not after.

### Phase 3 — Retire duplicate endpoints

Goal: `/api/enhance` has zero traffic and can be safely turned off. This
phase is entirely about the *frontend* catching up to what Phase 2 built.

- **P3-1.** For each of the 6 pages carrying `<AIEnhancement>` cards
  (`ResumePage`, `PlannerPage`, `NoteDetailPage`, `CareerHubPage`,
  `FinanceHubPage`, `LivingSurface`), replace the card with a call to the
  equivalent `/api/dax` task — which by this point runs on Runtime V2
  infrastructure per Phase 2, so this is not a downgrade. For the 3 actions
  with no existing Dax equivalent (`dashboard:detect-problems`,
  `recommend:next`, and whichever third one §2 flagged), add them as new
  `daxService.js` `HANDLERS` entries first — same infra, just needs a task
  name and a prompt.
- **P3-2.** This is also where `UX_REVIEW.md`'s "AI chrome has crept back"
  fix and this architecture migration are the same change — `NoteDetailPage`
  goes from 3 stacked cards to (at most) 1 Dax-branded surface, which is both
  the UX fix and the endpoint-retirement step, done once.
- **P3-3.** Once all 6 pages are confirmed migrated (verify: zero requests to
  `/api/enhance` in server logs over a real observation window, not just "the
  code doesn't call it anymore" — confirm in production traffic, not just
  in the diff), un-mount `enhanceRoutes.js` from `server/index.js`, the same
  reversible-first approach as P1-3.
- **P3-4.** Stop writing to `RuntimeComparison` (it has no purpose once
  there's one orchestrator) — this can happen as soon as Phase 2's per-task
  cutover is far enough along that the comparison data has no reader left,
  which may be sooner than the rest of Phase 3.
- **Verification:** every one of the 6 pages tested end-to-end (this needs an
  authenticated pass — flagged as outstanding in both prior reports), server
  logs confirm zero live `/api/enhance` traffic before unmounting.

### Phase 4 — Remove legacy code

Goal: delete what Phase 1–3 already proved was safe to delete.

- **P4-1.** Delete `routes/aiRoutes.js`, `routes/chatRoutes.js`,
  `routes/enhanceRoutes.js` (files, not just mount lines — Phase 1/3 already
  did the reversible unmounting; this is the irreversible follow-through
  after the observation window each earned).
- **P4-2.** Delete `ai/runtime-v2/studentIntelligenceEngine.js`,
  `ai/runtime-v2/memoryAdapter.js` — their useful logic was extracted in
  Phase 2/3 (`enhance()`'s control flow, `PAGE_ACTIONS` content); nothing left
  to preserve.
- **P4-3.** Delete `ai/validator.js` (superseded by `responseVerifierV2`
  in Phase 2) and `ai/aiGateway.js`'s dead V1/V2 mode-switch functions —
  either strip them from the file or delete the file entirely if `daxService.js`
  no longer calls into it at all by this point (depends how P2-3/P2-5 landed
  in practice — worth a direct check when you get here, not assumed now).
- **P4-4.** Delete `models/RuntimeComparison.js` (and its collection, via a
  migration script, out of scope for this document but worth flagging as a
  real data-cleanup step, not just a code deletion).
- **P4-5.** Delete `client/src/api/enhance.js`, `hooks/useEnhancement.js`,
  `components/common/AIEnhancement.jsx`.
- **P4-6.** Consider `ai/retriever.js` → `contextBuilder.js` consolidation
  (§2) and `ai/router.js` → `modelRouterV2.js` consolidation here, if not
  already done opportunistically during Phase 2/3 — these were flagged as
  "can trail behind," and Phase 4 is a natural place to close them out.
- **Verification:** full build, full route map, confirm the four target-architecture
  layers in §1 are the *only* AI code paths left in the repo — i.e., re-run
  the same tracing exercise from `AI_ARCHITECTURE_REPORT.md` and confirm the
  "two pipelines" finding no longer holds.

---

## 5. Risks specific to this migration (beyond what `AI_ARCHITECTURE_REPORT.md` already covers)

- **P2-3's per-task cutover needs a real flag, not a guess.** Reusing
  `aiGateway.js`'s existing mode-switch *pattern* is recommended precisely
  because that pattern already exists, is understood, and has a safe default
  — inventing a new flagging mechanism here would be its own small risk.
- **The 3 orphaned `PAGE_ACTIONS`** (`dashboard:detect-problems`,
  `recommend:next`, and the third flagged in §2) are the one place this
  migration could cause an actual feature loss rather than just a
  consolidation, if P3-1 is skipped or rushed. Worth explicit sign-off on
  which of these (if any) are worth keeping before Phase 3 starts.
- **`intelligence-layer` enrichment silently fails soft.** Because
  `_buildProfile`'s `try/catch` swallows errors (§3), a mistake in P2-2's
  relocation would not throw or show up in a build — it would just quietly
  stop enriching prompts with student context. This needs an explicit
  positive check ("context IS present in the composed prompt for a real
  user") during Phase 2 verification, not just "the app didn't crash."
- **This migration and the Stabilization Report's lint fix compound each
  other.** Every regression risk in Phase 2 (wrong prop passed, a field
  silently dropped, an import that resolves to `undefined`) is exactly the
  class of bug a working `no-unused-vars`/`no-undef` setup catches for free.
  Doing that fix first is not required, but it measurably lowers the risk of
  everything in Phase 2 onward.

---

*No files were modified in the production of this document.*
