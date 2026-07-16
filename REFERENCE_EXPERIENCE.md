# REFERENCE_EXPERIENCE.md — LivingSurface Redesign

## Objective

Transform LivingSurface into the single definitive DATAD Reference
Experience — the page every other page is measured against.

No new backend functionality. No API changes. No redesign of other pages.

---

## Narrative Arc (6 sections, linear scroll)

The page tells a story the student doesn't have to read — it just *feels*
right as they scan down the page.

```
ARRIVE ──→ MISSION ──→ INSIGHT ──→ PROGRESS ──→ RECOMMENDATIONS ──→ REFLECTION
```

Each section answers exactly one unspoken question.

---

### 1. ARRIVAL — "Am I in the right place?"

**Layout:** Full-width, top of page, no card wrapper.

```
┌─────────────────────────────────────────────────────────┐
│  Wednesday, 16 July                     ○ ○ ○           │
│                                                        │
│  Good morning, Aarav                                    │
│                                                        │
│  Clear morning. 3 tasks waiting. You've got this.      │
└─────────────────────────────────────────────────────────┘
```

- Date label: `text-xs font-semibold uppercase tracking-wide text-gray-400`
- Greeting: `text-2xl font-semibold tracking-tight` with name in
  `<span className="accent-text">`
- Context line: One generated sentence synthesizing readiness + overdue +
  encouragement. Concise. Calm. No emoji.

**Data used:** `user.name`, time of day, `readiness`, `tasks`, `reflection`

**Design rationale:** The student opens the page and immediately sees their
name + the current context. No buttons. No actions. Just orientation. This
is the "calm" principle: the page acknowledges them before asking anything.

---

### 2. MISSION — "What should I do right now?"

**Layout:** `Card` component, `padding="lg"`, high visual emphasis.

```
┌────────────────────────────────────────────────────────────┐
│  [Target]  Today's Mission                                 │
│                                                            │
│  Complete your case study analysis for Marketing 301       │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ①  Read the HBS case study          ○              │   │
│  │  ②  Write your analysis              ○              │   │
│  │  ③  Submit on the portal             ○              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Clock   │  │ Trending │  │  Star    │                  │
│  │  ~45 min │  │  Impact  │  │  Reward  │                  │
│  │  Time    │  │  Major   │  │  +2 read │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                            │
│  Why this mission? Based on your upcoming exam schedule    │
│  and your current readiness score, this case is your       │
│  highest-impact task for today.                            │
└────────────────────────────────────────────────────────────┘
```

- Uses shared `Card` component with `variant="hover"` and inner stat tiles
- No emoji anywhere (replace 💪/🌱/⭐/🏆 with Lucide equivalents or text)
- Mission reasoning shown as a subdued `.card`-like section
- Uses existing `DailyMissionCard` logic but restructured into Card semantics

**Data used:** `mission` from `/recommendations/daily-mission`

**Interaction:** The mission is not interactive on this page. Clicking it
navigates to the relevant workspace. The check circles are visual placeholders
(not toggleable here — that belongs in the workspace).

**Design rationale:** This is the single most important element on the page.
It gets the largest Card, a top position, and visual weight through padding.
The stat tiles provide glanceable "is this worth my time?" information.

If no mission is available, this section shows a calm empty state:
"Nothing urgent today. Here's something to explore →"

---

### 3. AI INSIGHT — "What does the AI see that I don't?"

**Layout:** Uses shared `AIInsight` component.

```
┌────────────────────────────────────────────────────────────┐
│  ✦  AI Insight  ·  Based on your data                     │
│                                                            │
│  Your readiness dropped 8 points this week — mostly due    │
│  to missed quiz practice sessions.                         │
│                                                            │
│  [Why? ▾]                                                  │
│  Three of your last five quiz attempts were skipped. Even  │
│  15 minutes of practice would reverse this trend.          │
│                                                            │
│  [Review quiz schedule →]              [× Dismiss]         │
└────────────────────────────────────────────────────────────┘
```

- Uses the existing `AIInsight` component from `components/common/`
- Insight generated from readiness trend + recent activity patterns
- Dismissible via localStorage (existing AIInsight pattern)
- "Why?" expandable section for transparency

**Data used:** `readiness` (score + components + trend), `reflection`

**Source of insight:** Synthesized from the data already fetched. The
frontend can derive one meaningful observation from the intersection of:
- Readiness score change (if previous data available)
- Number of overdue tasks
- Streak of daily case solves
- Recent note-taking activity

**Rationale:** The insight section is deliberately *after* the mission.
The student sees "what to do" first, then "why the AI thinks it matters."
This follows the ARRIVE → ORIENT → ACT loop.

If no meaningful insight can be derived, this section is omitted entirely
(no empty state — silence is better than noise).

---

### 4. PROGRESS — "Am I on track?"

**Layout:** Three unified sub-elements in a row, telling one story.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Readiness   │  │  Goals       │  │  Weekly      │
│              │  │              │  │  Trend       │
│  [ScoreRing] │  │  ┌──┐       │  │  ▲ +5 pts   │
│   72/100     │  │  │█ │  60%  │  │  This week  │
│              │  │  └──┘       │  │              │
│  On track    │  │  2 of 3     │  │  Strong      │
│  +3 this wk  │  │  complete   │  │  momentum    │
└──────────────┘  └──────────────┘  └──────────────┘
```

Each sub-element is a `Card` component with `padding="md"` (denser), in a
`grid grid-cols-1 sm:grid-cols-3 gap-3`.

**4a. Readiness:** ScoreRing component + label + week-over-week delta.
- Uses existing `ScoreRing` + `ReadinessTrend` logic
- Delta: `+N` (emerald), `-N` (rose), `—` (gray)

**4b. Goal Progress:** Simplified single-metric display.
- Overall completion percentage as a progress bar
- "X of Y goals complete" label
- Uses existing `GoalProgress` API but displays the overall metric only

**4c. Weekly Trend:** Simplified from `WeeklyReview`.
- Trend direction icon + delta value
- Status label (Strong / Building / Needs focus)
- "This week" time label

**Data used:** `readiness`, `goalProgress`, `weeklyReview`

**Rationale:** These three metrics together answer "am I on track?" without
requiring the student to visit three separate pages. The row tells a unified
story: readiness shows current state, goals show long-term trajectory,
weekly trend shows momentum.

If any metric is unavailable, the corresponding card shows `—` or a subtle
"Not enough data" placeholder — not a spinner. Data availability should not
block the rest of the page.

---

### 5. RECOMMENDATIONS — "What else should I consider?"

**Layout:** One featured recommendation as a `Card`, remaining as compact rows.

```
┌──────────────────────────────────────────────────────────┐
│  ✦  Recommended for you                          [View all] │
│                                                            │
│  ┌──────────────── featured ──────────────────────────┐   │
│  │  [Focus]  ·  Goal: Placements                       │   │
│  │                                                     │   │
│  │  Complete your resume draft before Friday's         │   │
│  │  deadline — 4 sections remaining                    │   │
│  │                                                     │   │
│  │  ┌─────┐   ┌─────┐                                 │   │
│  │  │~15min│   │92% match│                            │   │
│  │  └─────┘   └─────┘                                 │   │
│  │                                                     │   │
│  │  [Accept & start]    [Dismiss]    [Why? ▾]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Priority]  Review Marketing quiz questions       │    │
│  │  ~10 min · 85% match                      [→]     │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  [Study]   Watch the recorded lecture on NPV       │    │
│  │  ~20 min · 78% match                      [→]     │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

- Featured rec uses `Card` component with `padding="lg"`
- Remaining recs use compact `Card` components with `padding="sm"`
- Uses existing `ExplainableRecCard` data but restructured into Card system
- Each rec shows: type badge, title, estimated time, confidence match
- Actions: accept/dismiss use `Button` component (variant="primary"/"secondary")
- "View all" link navigates to `/briefing`

**Data used:** `stream.entries` from `/recommendations/stream`

**Rationale:** Only the top recommendation gets visual emphasis. The rest
are secondary — glanceable, skimmable. The section doesn't overwhelm with
options; it surfaces one clear choice and hints at more.

If no recommendations exist, this section is omitted.

---

### 6. REFLECTION — "How am I doing, really?"

**Layout:** Two items side by side — small win + encouragement.

```
┌──────────────────────────────────┐  ┌──────────────────────┐
│  [BookOpen]                      │  │   "One page today    │
│  Your last note: "Marketing      │  │    is better than    │
│  Mix Framework"                  │  │    ten pages some-   │
│                                  │  │    day."             │
│  You've written 5 notes this     │  │                      │
│  week — consistent progress.     │  │  [View weekly          │
│                                  │  │   review →]          │
│  [View note →]                   │  │                      │
└──────────────────────────────────┘  └──────────────────────┘
```

- Left card: small win (streak or recent note or completed task)
- Right card: encouragement quote with link to weekly review
- Both use `Card` component with `padding="md"`
- No emoji (replace any existing emoji in the current SmallWin with Lucide)
- The encouragement card is subtly different — it's a "thoughtful" surface
  that exists only to make the student feel seen

**Data used:** `caseData.streak`, `notes[0]`, `reflection.quote`

**Rationale:** The page ends on a calm, encouraging note. The student has
seen what to do, why it matters, how they're tracking, and what else is
available. Now they leave with a sense of progress and a small moment of
recognition.

---

## Layout Hierarchy (mobile-first)

```
max-w-5xl mx-auto px-4 py-6

├── Section 1: ARRIVAL        (no card, inline spacing)
├── Section 2: MISSION        (Card lg, full width)
├── Section 3: INSIGHT        (AIInsight component, hidden if no insight)
├── Section 4: PROGRESS       (grid-cols-1 sm:grid-cols-3 gap-3)
│   ├── Card: Readiness
│   ├── Card: Goal Progress
│   └── Card: Weekly Trend
├── Section 5: RECOMMENDATIONS (hidden if no recs)
│   ├── Section header + "View all"
│   ├── Card lg: featured rec
│   └── Card sm × N: remaining recs
└── Section 6: REFLECTION     (grid-cols-1 sm:grid-cols-2 gap-3)
    ├── Card: Small win
    └── Card: Encouragement
```

### Breakpoint behavior

- **Mobile (< 640px):** Single column, sections stack vertically.
  Mission Card padding reduces to `md`.
- **Tablet (≥ 640px):** Progress row becomes 3 columns. Reflection row
  becomes 2 columns. Recommendations can show 2 compact recs side by side.
- **Desktop (≥ 1024px):** Full layout as described. Featured rec gets
  space to expand.
- **Wide (≥ 1280px):** Same as desktop; extra space absorbed by
  `max-w-5xl` centering.

---

## Component Usage Map

| Section | Component(s) | Props |
|---------|-------------|-------|
| Arrival | — (inline JSX) | `user.name`, `readiness`, `tasks`, `reflection` |
| Mission | `Card` variant="hover" padding="lg" | mission data + inner stat tiles |
| Insight | `AIInsight` | insight text, why, action, dismissKey |
| Progress | 3× `Card` variant="passive" padding="md" | readiness score, goals, weekly trend |
| Recs | `Card` for featured, `Card` padding="sm" for rest | stream entries |
| Reflection | 2× `Card` padding="md" | streak/note, reflection quote |

### Components used from shared system

- `Card` — every surface
- `Button` — accept/dismiss/view actions
- `ScoreRing` — readiness display
- `AIInsight` — insight section
- `Skeleton` (variants) — loading states
- `Page` from `motion.jsx` — page entrance
- `Stagger`, `StaggerItem` — section entrance sequencing

### Components NOT used (by design)

- `DailyMissionCard` — inlined into Card system
- `ReadinessTrend` — simplified into Card
- `GoalProgress` — simplified into Card
- `WeeklyReview` — simplified trend into Card
- `ExplainableRecCard` — data reused but surface replaced with Card

The old widget components remain in the codebase for backward compat but
LivingSurface no longer imports them, except when their data-fetching
logic is reused.

---

## Loading States

Each section loads independently. The page skeleton shows the full layout
with `Skeleton` placeholders matching each section's shape:

```
Section 1: Skeleton h-3 w-32 → h-8 w-56 → h-4 w-3/4
Section 2: Skeleton h-48 w-full rounded-2xl (Card skeleton)
Section 3: Skeleton h-24 w-full rounded-2xl (AIInsight skeleton)
Section 4: 3× Skeleton h-28 rounded-2xl (Card skeleton, 1/3 width each)
Section 5: Skeleton h-40 + 2× Skeleton h-16 rounded-2xl
Section 6: 2× Skeleton h-20 rounded-2xl
```

On initial load, a single `loading` state triggers all skeletons. Once data
arrives, each section transitions independently (instant swap, no fade).

---

## Data Flow

All data is fetched in parallel via `Promise.allSettled` (existing pattern).
Each section handles its own null/error state:

```
fetchAll()
├── getDailyMission()       → Section 2 (null → hide section)
├── getRecommendationStream() → Section 5 (null/empty → hide section)
├── getReadiness()          → Section 1, 4a (null → show "—")
├── listTasks()             → Section 1 context (null → 0)
├── listNotes({limit:1})    → Section 6 (null → hide)
├── getTodayReflection()    → Section 1, 6 (null → hide)
└── getTodayCase()          → Section 6 (null → hide)
```

No new API endpoints. No new backend logic. The frontend synthesizes the
insight for Section 3 from data it already has.

---

## Success Criteria

1. Every surface uses `<Card>` or `.card` class — zero inline card styles
2. Every button uses `<Button>` component — zero inline button styles
3. Body text is `text-sm` everywhere
4. No emoji in UI elements
5. Full dark mode support
6. Loading skeletons match final layout
7. Empty states are calm and contextual
8. Page entrance uses CSS `animate-in` + `stagger`
9. All Lucide icons at correct sizes
10. No new API calls — only existing endpoints

---

## Measuring Success (subjective)

- A student should be able to scan the page in <3 seconds and know:
  "What to do" (Mission), "Why it matters" (Insight), "How I'm doing"
  (Progress), "What else" (Recs), "I'm seen" (Reflection)
- The page should feel like a single thought, not a dashboard of widgets
- No section should feel "empty" — if data is missing, the section
  collapses gracefully
- The page should fit in one viewport on desktop (maybe with slight scroll
  for recs + reflection) — no endless feed
