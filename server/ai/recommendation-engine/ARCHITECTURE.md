# Recommendation Intelligence V2 — Architecture

## Overview

Recommendation Intelligence V2 extends the V1 recommendation engine with lifecycle management, feedback-driven ranking, dependency resolution, 9-dimensional scoring, goal alignment, a recommendation planner with dedup/conflict resolution, and a daily mission generator.

All V2 modules are backward compatible with V1 — no existing generator, route, or model field is removed or rewritten.

## Directory Structure

```
server/ai/recommendation-engine/
├── index.js              # Orchestrator (runs generators → V2 pipeline)
├── recommendationFactory.js  # V1 scoring + recommendation builder
├── livingSurface.js      # RecommendationStream hydration (updated for V2)
├── workspace.js          # Workspace widget data
├── ARCHITECTURE.md       # This file
├── generators/           # 11 V1 generators (unchanged)
│   ├── focusGenerator.js
│   ├── priorityGenerator.js
│   ├── studySessionGenerator.js
│   ├── aiActionGenerator.js
│   ├── weakTopicGenerator.js
│   ├── placementGenerator.js
│   ├── resumeGenerator.js
│   ├── interviewGenerator.js
│   ├── deadlineGenerator.js
│   ├── plannerGenerator.js
│   └── wellnessGenerator.js
├── lifecycleManager.js       # V2: State machine for lifecycle transitions
├── feedbackEngine.js         # V2: Feedback recording + ranking adjustment
├── dependencyGraph.js        # V2: DAG of prerequisite recommendation types
├── scoringEngineV2.js        # V2: 9-dimensional scoring
├── goalAligner.js            # V2: Map rec types to student goals
├── recommendationPlanner.js  # V2: Dedup, conflict resolution, merging, prioritization
└── dailyMission.js           # V2: Generate one daily mission from planned recs
```

## Pipeline Flow

```
Generators (11)
    │
    ▼
V1 Scoring (sortByScore)
    │
    ▼
Goal Aligner (alignAll)
    │
    ▼
V2 Scoring (computeV2Scores)  ── 9 dimensions
    │
    ▼
Dependency Resolution (resolveDependencies)
    │
    ▼
Planner (plan)
    ├─ Deduplicate
    ├─ Resolve conflicts
    ├─ Merge similar
    ├─ Prioritize by goals
    └─ Assign plan order
    │
    ▼
Persist to MongoDB
    │
    ▼
Daily Mission Generator (generateDailyMission)
```

## V2 Modules

### lifecycleManager.js
- State machine with 9 states: `generated → seen → accepted → started → completed / dismissed / ignored / expired / regenerated`
- Each transition records `{ from, to, at }` timestamp
- `transition(userId, recId, toState)` — atomic update with validation
- `markSeen(userId, ids)` — batch mark as seen
- `expireOld(maxAgeMs)` — auto-expire stale recs
- `getByState(userId, state)` — filter by lifecycle state

### feedbackEngine.js
- 6 feedback types: `helpful`, `not-helpful`, `already-done`, `remind-tomorrow`, `never-suggest`, `lower-priority`
- `recordFeedback(userId, recId, type)` — persists and applies side effects (auto-dismiss, auto-complete)
- `getAdjustedRanking(recs)` — re-ranks based on feedback history
- `getFeedbackStats(recs)` — aggregate counts

### dependencyGraph.js
- Static DAG defining prerequisites per recommendation type
- Example: `resume-suggestion → interview-suggestion → placement-readiness`
- `resolveDependencies(userId, recs)` — annotates each rec with `{ satisfied, missing, blocked }`
- `getNextInChain(userId, recType)` — suggests next uncompleted type in chain
- `TYPE_PREREQUISITES` — full graph definition

### scoringEngineV2.js
- 9 dimensions, each 0–100:
  - `expectedValue` — baseline + urgency/signal/profile adjustments
  - `estimatedTime` — derived from `estimatedCompletionTime` string
  - `difficulty` — baseline by type
  - `personalRelevance` — overlap with weak/strong/recent topics, goals, career signals
  - `goalAlignment` — matches rec type against student goals
  - `freshness` — decays from 100 (1hr) to 20 (72hr+)
  - `confidence` — from generator (passthrough)
  - `urgency` — from generator (passthrough)
  - `impact` — baseline + deadline/readiness adjustments
- `composite` — weighted sum of all 9 dimensions

### goalAligner.js
- Maps each recommendation type to a default goal (e.g. `placement-readiness → placement`)
- `alignAll(recs, profile)` — computes best goal match per rec based on student's `identity.goals`
- `getGoalSummary(recs)` — aggregates by goal with avg relevance

### recommendationPlanner.js
- **Deduplication**: keyed by `type:title`, removes exact duplicates
- **Conflict resolution**: defined `CONFLICT_GROUPS` keep highest urgency, remove others (e.g. `study-session` conflicts with `ai-action`)
- **Merging**: `MERGEABLE_TYPES` (e.g. `deadline-alert` → `priority`) concatenates descriptions, sourceSignals, actions
- **Goal-based prioritization**: sorts by goal match + urgency; caps at `MAX_DAILY_RECOMMENDATIONS` (12)
- **Plan order**: assigns sequential `planOrder` to each surviving rec

### dailyMission.js
- Picks the top-3 highest-scored non-focus/non-wellness recs
- Computes total estimated time
- Generates `reasoning` from focus, urgency, motivation, goals
- Returns `expectedReadinessImprovement` string

## Modified Files

| File | Change |
|------|--------|
| `server/models/Recommendation.js` | Added `lifecycle`, `dependencies`, `goalAlignment`, `v2Scores`, `feedback`, `planner` fields |
| `server/models/RecommendationStream.js` | Added `lifecycleState`, `v2Scores.composite`, `goalAlignment` to stream entries; added `dailyMission` subdocument |
| `server/ai/recommendation-engine/index.js` | Integrated V2 pipeline: goal alignment, V2 scoring, dependency resolution, planner |
| `server/ai/recommendation-engine/livingSurface.js` | Stream hydration includes V2 fields + daily mission generation |
| `server/routes/recommendationRoutes.js` | Added lifecycle transition, feedback, mark-seen, daily-mission, feedback-stats endpoints |

## API Endpoints (V2 additions)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/recommendations/generate` | Updated — returns dailyMission alongside generated recs |
| POST | `/api/recommendations/:id/lifecycle` | Transition lifecycle state (body: `{ toState }`) |
| POST | `/api/recommendations/:id/feedback` | Record feedback (body: `{ type }`) |
| GET | `/api/recommendations/feedback/stats` | Aggregate feedback counts |
| POST | `/api/recommendations/lifecycle/mark-seen` | Batch mark recs as seen (body: `{ ids }`) |
| GET | `/api/recommendations/daily-mission` | Get today's daily mission |
| GET | `/api/recommendations/stream` | Updated — includes lifecycleState, v2Scores, goalAlignment, dailyMission |

## Migration Notes

1. Existing V1 recommendations in MongoDB will have no `lifecycle`, `v2Scores`, etc. — they will be treated as `generated` state by the lifecycle manager.
2. The planner runs **after** all generators, so V2 does not change generator output format.
3. `dismissRecommendation` now uses lifecycleManager.transition internally.
4. Daily mission is regenerated on stream hydration if older than 1 hour.
5. Running `npm test` to verify no existing tests break is recommended after deployment.
