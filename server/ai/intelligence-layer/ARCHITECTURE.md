# Student Intelligence Layer

## Overview

The Student Intelligence Layer is an adaptive profiling system that sits **before** the AI Runtime Gateway. Every AI request is prefaced with a computed profile of the student's current state, enabling context-aware routing and personalized response generation.

```
Request → Student Intelligence Layer → AI Gateway → V1 / V2 Runtime → Response
                │
                ▼
         Student Profile
         (scores, context, state)
```

## Architecture

### Components

```
server/ai/intelligence-layer/
├── index.js                    # Entry point: buildStudentProfile(), getIntelligence()
├── profileFactory.js           # Profile structure factory + enriched context builder
├── scoringEngine.js            # Computes 10 intelligence scores from collected data
├── ARCHITECTURE.md             # This document
└── collectors/
    ├── identityCollector.js    # User, UserProfile, StudentIdentity, SiteMeta
    ├── memoryCollector.js      # UserMemory (AI-accumulated student context)
    ├── taskCollector.js        # Task (pending, overdue, deadlines)
    ├── noteCollector.js        # Note (subjects, topics, count)
    ├── plannerCollector.js     # PivotPlan, Project (career plans, skill gaps)
    ├── careerCollector.js      # Resume, PlacementApplication, CompanyRead, StarStory
    ├── learningCollector.js    # HabitLog, DailyCaseSolve, streak, consistency
    ├── activityCollector.js    # ChatMessage, AiUsage (recent queries, engagement)
    └── stressCollector.js      # Task deadlines, application status (stress inference)
```

### Flow

1. **Request arrives** at gateway with a `userId` (from route handler/automation job)
2. **Gateway calls** `intelligenceLayer.buildStudentProfile(userId)`
3. **Collectors run in parallel** — each queries its model(s) and returns structured data
4. **Scoring engine** computes 10 scores from the collected data
5. **Profile factory** assembles the final profile + builds a human-readable `enrichedContext` string
6. **Gateway uses the profile** to:
   - Inject `enrichedContext` into the V1 system prompt (`[Student Context]` block)
   - Pass `_profile` to V2 for context-aware processing
   - Override hybrid routing decisions (e.g., high urgency → V1)
   - Attach `profile.scores` and `profile.enrichedContext` to every gateway response

## Student Intelligence Profile

### Raw Data (collected)

| Field | Source | Contents |
|-------|--------|----------|
| `identity` | User, UserProfile, StudentIdentity, SiteMeta | Name, tier, batch, specialization, days to placement, learning style, goals, challenges, college |
| `memory` | UserMemory | Specialization, career interests, target companies, readiness score, recent topics, strengths, weaknesses, preferred explanation style |
| `tasks` | Task | Total/pending/overdue/completed counts, upcoming deadlines, task type distribution |
| `notes` | Note | Total count, recent subjects, recent titles |
| `planner` | PivotPlan, Project | Has pivot plan, career change direction, skill gaps, active projects |
| `career` | Resume, PlacementApplication, CompanyRead, StarStory | Resume completion %, skills, experience, applications by status, companies researched, STAR stories count |
| `learning` | HabitLog, DailyCaseSolve, UserMemory, Task | Streak, consistency %, study minutes, pomodoros, week-over-week progress, weak/strong topics |
| `activity` | ChatMessage, AiUsage | Chat messages today, AI calls today, recent query topics |
| `stress` | Task, PlacementApplication | Stress level (0-100), indicators list, overdue/near-deadline counts, rejection count |

### Computed Scores

| Score | Range | Description |
|-------|-------|-------------|
| `currentFocus` | string | Detected focus area: `deadline-pressure`, `catch-up`, `placement-prep`, `interview-prep`, `task-management`, `skill-building`, `exploration`, `general` |
| `currentChallenges` | string[] | Top 4 challenges detected (e.g., "High stress", "Overdue tasks", "Imminent placement season") |
| `recommendedTone` | string | `supportive`, `direct`, `encouraging`, `professional`, `curious`, `neutral`, `detailed` |
| `recommendedResponseLength` | string | `short`, `moderate`, `long` |
| `recommendedExamples` | string[] | Personalised example topics based on skills, industries, recent topics |
| `urgencyLevel` | 0–100 | Pressure from overdue tasks, near deadlines, placement proximity |
| `motivationLevel` | 0–100 | Inferred from streak, consistency, interview activity, rejections |
| `confidence` | 0–100 | Built from skill depth, experience, readiness score, rejections |
| `learningVelocity` | 0–100 | Rate of progress from consistency, streak, task completion, study volume |
| `careerReadiness` | 0–100 | Placement preparedness from resume, skills, research, stories, applications |
| `contextQualityScore` | 0–100 | How many data sources were available for this profile |
| `intelligenceScore` | 0–100 | Weighted composite: readiness(20%), urgency(15%), motivation(15%), confidence(15%), velocity(15%), contextQuality(15%), inverse-urgency(5%) |

### Enriched Context

The `enrichedContext` field is a human-readable summary string (pipe-separated) injected into the system prompt. Example:

```
Student: Aarav Sharma | Batch: 2025 | Specialization: Finance | Days to placement: 45 |
Plan: pro | Placement readiness: 72/100 | Target roles: Investment Banking, Consulting |
Skills: Financial Modeling, Excel, Valuation | Pending tasks: 3 | Overdue: 1 |
Upcoming deadlines: Financial Analysis Project | Streak: 12 days | Consistency: 80% |
Weak areas: DCF Modeling | Focus: placement-prep |
Challenges: Imminent placement season; Weak in DCF Modeling |
Motivation: High — encourage continued momentum
```

## Integration with Gateway

### Gateway Modification Points

| Point | Change |
|-------|--------|
| `process()` | Builds profile before any routing decision |
| `_execV1()` | Injects `enrichedContext` into system prompt / messages array |
| `_execV2()` | Passes `_profile` object to V2 request |
| `_routeHybrid()` | Uses `urgencyLevel` override: high urgency → V1 |
| Return value | Attaches `profile.scores` and `profile.enrichedContext` to response |

### Gateway Response Shape (extended)

```js
{
  result: "AI response text",
  runtime: "v1",
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  latencyMs: 1234,
  // ... existing fields ...
  profile: {
    scores: {
      currentFocus: "placement-prep",
      currentChallenges: ["Imminent placement season", "Weak in DCF Modeling"],
      recommendedTone: "professional",
      recommendedResponseLength: "moderate",
      recommendedExamples: ["Financial Modeling", "Investment Banking"],
      urgencyLevel: 45,
      motivationLevel: 78,
      confidence: 65,
      learningVelocity: 72,
      careerReadiness: 68,
      contextQualityScore: 80,
      intelligenceScore: 71,
    },
    enrichedContext: "Student: Aarav Sharma | Batch: 2025 | ..."
  }
}
```

## Routing Strategy with Intelligence

The profile scores directly influence routing decisions:

| Profile Signal | Routing Impact |
|----------------|----------------|
| `urgencyLevel > 70` | Forces V1 (stable, proven) even in hybrid mode |
| `motivationLevel < 30` | Routes to V1 (less experimentation when disengaged) |
| `contextQualityScore < 30` | Routes to V2 (better at filling knowledge gaps) |
| `careerReadiness > 80` | Routes to V2 (capability engine can handle advanced prep) |
| `learningVelocity > 70` | Routes to V2 (benefits from capability-driven routing) |
| `recommendedTone === 'supportive'` | V2 preferred (better tone adaptation) |

## Personalization Strategy

| Score | Response Adaptation |
|-------|-------------------|
| `recommendedTone` | Adjust system prompt tone modifier |
| `recommendedResponseLength` | Adjust `maxTokens` and instruct conciseness/verbosity |
| `recommendedExamples` | Inject relevant examples matching student's context |
| `currentFocus` | Frame response around detected focus area |
| `currentChallenges` | Acknowledge challenges before answering |
| `motivationLevel < 40` | Include encouragement, progress acknowledgment, maintain momentum |
| `confidence < 40` | Provide clear step-by-step guidance, avoid ambiguity |
| `urgencyLevel > 60` | Prioritize actionable steps, minimize theory |

## Backward Compatibility

| Aspect | Status |
|--------|--------|
| Existing routes | No changes to route handlers |
| Gateway API | `process(request)` signature unchanged; profile built internally |
| Response shape | `profile` field added (optional); downstream code ignores unknown fields |
| V1/V2 runtimes | Unmodified |
| Automation jobs | Profile built when `userId` available in request |
| Default behavior | Profile is `null` when no `userId`; gateway operates as before |

## Migration Plan

| Phase | Action |
|-------|--------|
| **1. Shadow profile** | Gateway builds profile but doesn't use it for decisions; log profile quality |
| **2. Context injection** | Enable `enrichedContext` injection into V1 system prompts |
| **3. Hybrid intelligence** | Enable profile-driven hybrid routing overrides |
| **4. Full personalization** | All scores active; response adaptation in both runtimes |
| **5. Feedback loop** | Record which profile scores correlated with high-confidence responses |

## Future Extensions

- **Collect calendar/event data** (once Event + RSVP integration is complete)
- **Collect exam schedule** (from Task.type === 'exam')
- **Knowledge graph integration** (existing adapter but no MongoDB storage yet)
- **Temporal decay** — weight recent activity higher than stale data
- **Cross-session memory** — profile diffing across consecutive requests
