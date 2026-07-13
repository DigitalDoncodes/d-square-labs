# DATAD Product Audit — Student-First Philosophy

Judged against one question: **does this make a student calmer, clearer, and slightly better today?**
Current surface: 5 workspaces, 30 member-facing tabs, ~12-widget dashboard.
Proposed surface: 5 workspaces, ~19 tabs, 5-element dashboard.

## The core diagnosis

DATAD's problem is not bad features — almost every feature is individually good.
The problem is that the product **presents everything at once and prioritizes nothing**.
An anxious student opening a 12-widget dashboard and 30 tabs experiences the app the
same way they experience the MBA itself: *too much, all equally urgent, no starting point.*
The redesign is therefore mostly subtraction and merging, not building.

## Dashboard — REDESIGN (highest priority)

Current: onboarding card, market strip, daily case, readiness gauge, today section,
recent notes, proactive nudges, premium panel, AI insight, placement countdown,
progress tiles, invite card. Twelve things competing.

New dashboard = exactly five elements, in order:
1. **Today's Focus** — one thing (top task from planner, or today's case). One.
2. **Next deadline** — single line ("Marketing assignment — Friday").
3. **Today's encouragement** — one sentence (DailyReflection already generates this).
4. **Progress** — one visual (streak or readiness delta, not both).
5. **Continue where you left off** — last note/case/company opened.

Everything else moves below a "More" fold or out entirely.
Remove from dashboard: market strip (noise, moves to Career overview), premium panel
(subscribe page exists; one quiet link), invite card (move to Community), AI insight +
nudges (fold the single best nudge into Today's Focus).

## Study — 7 tabs → 4

| Tab | Verdict | Why |
|---|---|---|
| Notes | **REDESIGN** | Reposition as a personal learning journal, not a file dump: paraphrase-first editor, "what did I learn today" framing, sharing is a bonus. |
| Assignments | KEEP | Feeds the deadline element on the dashboard. |
| Projects | **MERGE → Assignments** | Same mental slot: "work I owe." One "Work" tab. |
| Resources | KEEP | Shared file library is distinct from personal notes. |
| AI Tools | **DISSOLVE** | A standalone "AI Tools" page is the anti-pattern the philosophy names. Summarize lives in Notes; suggestions live in Planner. |
| Study Tools | **MERGE → Focus** | Keep pomodoro/flashcards; fold into one "Focus" page together with wellbeing techniques. |

## Career — 8 tabs → 4

| Tab | Verdict | Why |
|---|---|---|
| Overview | **REDESIGN** | Make Readiness *be* the overview: score + "do this one thing today." |
| Readiness | MERGE → Overview | Same page. |
| Companies | KEEP | The core: what company, what role, how to prepare. |
| Questions | **MERGE → Companies** | Question bank already lives on company cards. |
| Placements | KEEP | Rename tab "Opportunities". |
| Internships | **MERGE → Opportunities** | Same job-to-be-done. |
| Resume | KEEP | |
| Skills (exchange) | **MOVE → Community** | It's a peer-to-peer feature, not career prep. If usage is low after the move, cut it. |

## Community — 9 tabs → 6

| Tab | Verdict | Why |
|---|---|---|
| Discussions | **MERGE with Feed** | Two social streams solving one problem ("talk to my batch"). Pick one model. |
| Feed | (merged) | |
| Announcements | KEEP | |
| Events | KEEP | |
| Directory | KEEP | Rename "People". |
| Gallery | **MERGE with Archive → "Memories"** | Both are batch nostalgia; one home. |
| Archive (entertainment) | (merged) | Honest answer: it doesn't make anyone placement-ready, but batch memory *is* belonging, and belonging fights loneliness. Keep, merged, deprioritized. |
| Marketplace | **CUT (or fold into Feed as a post type)** | For a single batch, a marketplace is a looked-cool feature. A "selling/lending" post type in the feed does the job. |

## Me — 5 tabs → 6 (the only place that grows)

| Tab | Verdict | Why |
|---|---|---|
| Journal | KEEP + reflection prompts | Wire the existing DailyReflection content in as optional prompts. |
| Planner | KEEP | Source of Today's Focus. |
| Finance | **REDESIGN** | From expense tracker to financial literacy: lead with short lessons (emergency fund, SIP, compounding, mutual funds) + simple calculators (SIP, compounding, budget rule). Tracker stays, demoted to a tab. Goal: confidence, not accounting. |
| **Wellbeing (NEW)** | ADD | Breathing exercises, study/memory techniques, healthy-routine guidance, positive reinforcement — and the "I'm approachable, here's how to reach me" page with a clear disclaimer that DATAD is not professional mental-health care. This is the founder's actual differentiator. |
| Settings | KEEP | |

## Cross-cutting

- **Intelligence/News + Market**: not self-improvement; demote to a quiet section on
  Career overview. Remove from dashboard.
- **Daily Case**: keep — it is exactly "one small step every day."
- **AI**: no AI pages, no AI branding walls. AI appears as a small action where the
  student already is (Summarize in a note, Suggest in planner, one line of briefing
  on the dashboard). Quotas/tiers already support this.
- **Premium**: current tier model already fits (free tier is genuinely complete,
  AI = paid). Remove any premium panel from the dashboard; never interrupt.
- **Navigation**: 5 workspaces stay; tabs go 30 → ~19; advanced/rare tools hide
  behind overflow ("More") rather than a top-level tab.

## Brutal-honesty cut list

1. Marketplace page (fold into Feed or delete).
2. Standalone AI Tools page (dissolve into context).
3. Market strip + premium panel + invite card on the dashboard.
4. Questions, Internships, Projects, Readiness, Discussions, Archive as separate tabs (all merged above).

## Suggested implementation order

1. Dashboard redesign (biggest emotional impact, one page).
2. Navigation merges (mostly routing + tab config).
3. Wellbeing page (new, small, high trust value).
4. Finance reframe (content + 2–3 calculators).
5. Notes repositioning.
