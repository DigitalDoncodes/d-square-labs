# AI Runtime V2 Migration Report

> **Superseded.** This document's "Future Migration Plan" (below) proposed
> V2 eventually replacing V1 as a competing runtime, ending in "V1
> Decommission." That direction was never adopted past step 1 — the app has
> run in `v1_only` mode the entire time. The current, active direction is
> the opposite: **Dax (the V1-rooted orchestrator) is canonical; Runtime V2
> is infrastructure that gets adopted underneath it, not a rival runtime.**
> See `/MIGRATION_BLUEPRINT.md` at the repo root for the plan actually being
> executed. This document is kept for historical context on why
> `aiGateway.js` and its four modes exist — don't follow its phase table.

## Modified Files

| File | Change | Impact |
|------|--------|--------|
| `server/ai/aiGateway.js` | **Created** — central gateway with 4 modes | New file, no existing code changed |
| `server/models/RuntimeComparison.js` | **Created** — Mongoose schema for cross-runtime metrics | New model, auto-creates collection |
| `server/ai/agents/pipeline.js` | Replaced `run()` call with `aiGateway.process()` | All pipeline-based routes (aiRoutes.js, briefing automation) now route through gateway |
| `server/ai/runner.js` | Added gateway delegation at top of `run()` | All direct-`run()` callers (automation jobs, newsEnhancer) now route through gateway |
| `server/routes/chatRoutes.js` | Replaced direct `provider.complete()` with `aiGateway.process()` | Chat endpoint now routes through gateway |
| `server/routes/automationRoutes.js` | Added `GET/PUT /gateway-mode`, `GET /runtime-comparison` | Admin dashboard now has runtime comparison + mode controls |

### Files NOT modified
- `server/routes/aiRoutes.js` — unchanged (routes through pipeline which routes through gateway)
- `server/automation/**/*.js` — all 8 automation job files unchanged (route through runner which delegates to gateway)
- `server/ai/router.js` — unchanged (still used for task-to-tier mapping within V1 path)
- `server/ai/validator.js` — unchanged
- `server/ai/providers/**` — unchanged
- `server/ai/runtime-v2/**` — unchanged (all 20 V2 modules as previously built)

## Execution Flow

```
HTTP Request / Automation Job
        │
        ▼
  ┌──────────────────────────────────────────────┐
  │  runner.js run()   ◄── automation jobs (8)   │
  │  pipeline.js       ◄── aiRoutes (5 endpoints)│
  │  chatRoutes.js     ◄── POST /api/chat        │
  └────────┬─────────────────────────────────────┘
           │
           ▼
  ┌──────────────────────────────────────────────┐
  │           aiGateway.process()                │
  │                                              │
  │   ┌──────────┬──────────┬──────────┐        │
  │   │ v1_only  │ v2_only  │  shadow  │ hybrid │
  │   └────┬─────┴────┬─────┴────┬─────┴────────┘
  │        │          │          │
  │        ▼          ▼          ▼
  │   ┌────────┐ ┌────────┐ ┌────────┐
  │   │runner  │ │runtime-│ │ BOTH   │
  │   │.run()  │ │v2      │ │ (V1→cli│
  │   │  (V1)  │ │  (V2)  │ │ V2→log)│
  │   └────────┘ └────────┘ └────────┘
  └──────────────────────────────────────────────┘
           │
           ▼
    RuntimeComparison model
    (metrics persisted for dashboard)
```

### Mode Behaviors

| Mode | V1 Runs | V2 Runs | Response Returned | Metrics Persisted |
|------|---------|---------|------------------|-------------------|
| `v1_only` | Yes | No | V1 | Selected runtime + mode |
| `v2_only` | No | Yes | V2 | Selected runtime + mode |
| `shadow` | Yes | Yes | V1 | Both runtimes' metrics + diff |
| `hybrid` | Selected intents→V2, rest→V1 | Hybrid | Each request's selected runtime |

### Hybrid Mode Intent Routing

The following intents route to Runtime V2 in hybrid mode:
- `chat`
- `explain`
- `summarise`
- `research`
- `resume_review`
- `career_advice`

All other intents use Runtime V1.

## Backward Compatibility

| Aspect | Status | Details |
|--------|--------|---------|
| V1 Runtime | **Untouched** | `runner.js` still exports `run()`; all original V1 code path intact |
| V2 Runtime | **Untouched** | `runtime-v2/` modules unchanged; V2 is additive |
| Existing Endpoints | **Unchanged** | `aiRoutes.js`, `chatRoutes.js`, `automationRoutes.js` API signatures identical |
| Automation Jobs | **Unchanged** | All 8 jobs import `run()` from runner.js as before; code logic not modified |
| Response Shape | **Preserved** | `pipeline.js` still returns `{ result, meta, validation }` |
| Chat Response | **Preserved** | `POST /api/chat` still returns `{ reply, remaining }` |
| Auth/Quota | **Preserved** | All middleware (verifyToken, aiQuota, rateLimiter) unchanged |
| Provider Config | **Preserved** | `automation.js` config unchanged |
| Mongoose Models | **Additive only** | `RuntimeComparison` is new; no existing model modified |
| Fallback | **Built-in** | If gateway fails to load, runner falls back to native V1 execution |

### Default Behavior
Default mode is `v1_only` — all requests go through V1. System behaves identically to pre-gateway state until an admin explicitly changes the mode.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Circular dependency (runner ↔ gateway) | Medium | Lazy `require()` in `runner.js` breaks cycle at call time, not module load time |
| Gateway failure takes down all AI calls | Medium | `runner.js` has try/catch around gateway delegation; falls back to native `_nativeRun()` if gateway unavailable |
| V2 executor throws unhandled error in shadow mode | Low | `Promise.allSettled` used; V2 failures are caught and logged, V1 response still returned |
| Messages format not supported by V2 | Low | Gateway detects `messages` array and forces V1 path regardless of mode |
| RuntimeComparison model writes slow down requests | Low | Metrics persisted fire-and-forget (`.catch(() => {})` in chat; background in shadow) |
| Missing `server/ai/index.js` referenced in old migration.js | None | Old `runtime-v2/migration.js` had `require('../index')` — this was never wired in production; gateway bypasses it entirely |
| Confidence/verification null for V1 calls in some paths | Low | V1 path doesn't run V2's `verifyResponse()`; confidence comes from legacy `validator.js` which has different thresholds |

## Future Migration Plan

| Phase | Action | Criteria |
|-------|--------|----------|
| **1. Shadow (current)** | Run gateway in `v1_only` mode. All requests use V1. No behavioral change. | Immediate — already deployed |
| **2. Data Collection** | Switch to `shadow` mode. Collect 7+ days of V1 vs V2 comparison data. | Admin enables via `PUT /api/automation/gateway-mode` |
| **3. Evaluation** | Review dashboard at `/api/automation/runtime-comparison`. Compare latency, cost, confidence, verification rates. | ≥500 shadow comparisons per runtime |
| **4. Hybrid Rollout** | Switch to `hybrid` mode. V2 handles `chat`, `explain`, `summarise`, `research`, `resume_review`, `career_advice`. Gradually expand. | V2 metrics match or exceed V1 on selected intents |
| **5. Full V2** | Switch to `v2_only` mode. All requests use V2. | All intents verified; V2 > V1 on all metrics |
| **6. V1 Decommission** | Remove V1 code paths, simplify to `v2_only` permanently. | ≥30 days of stability in `v2_only` mode |

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/automation/gateway-mode` | GET | View current gateway mode and available options |
| `/api/automation/gateway-mode` | PUT | Change gateway mode (`body: { mode: "shadow" }`) |
| `/api/automation/runtime-comparison` | GET | Full comparison dashboard (7-day window) |

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_GATEWAY_MODE` | `v1_only` | Override startup mode: `v1_only`, `v2_only`, `shadow`, `hybrid` |
