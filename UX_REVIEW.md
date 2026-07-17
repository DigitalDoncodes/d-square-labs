# DATAD — Product & UX Review

**Stance:** no redesigns. Everything below assumes the current visual language,
layout, and navigation stay exactly as they are. This is about removing friction
and noise from what's already built, not proposing new screens.

**Note on sequencing:** several items here (marked with →) are downstream of the
architectural decision in `STABILIZATION_REPORT.md` (Critical #1 — two AI
systems). I'm flagging them here because they're real, visible UX problems, but
the actual fix happens as a side effect of that decision, not as separate work.

---

## Cross-cutting

### The most important finding in this whole review: AI chrome has crept back
**Where:** Resume, Notes (worst case), Planner, Career, Finance, Dashboard

**User problem:** `NoteDetailPage` stacks three independent AI cards
(summarize / flashcard / quiz) that each load, error, and dismiss separately.
`ResumePage` stacks two. `FinanceHubPage`, `CareerHubPage`, and `PlannerPage`
each carry one `AIEnhancement` card *in addition to* their Dax-branded features.
Every one of these cards fetches independently on mount, so a student opening
a note can watch three separate loading spinners resolve at three different
times before the page settles.

**Why it matters:** this repo's own design principles state it directly — "one
AI insight is more valuable than five AI widgets." That philosophy shaped a
prior redesign of this exact product. This is that problem, back. It also
directly works against "calm" as a brand attribute — a page that's still
popping in AI cards a full second after it "loaded" doesn't read as calm, it
reads as busy.

**Effort:** → Large, and entangled with Critical #1 in the stability report —
whichever engine wins, the fix is the same: one insight surface per page,
not one per feature.
**Impact:** High. This is visible on 6 of the app's highest-traffic screens.
**Recommend:** Before launch. This is the single highest-leverage item in this
entire review.

---

### Loading states settle unevenly across a page
**Where:** `LivingSurface` (dashboard), most workspace hubs

**User problem:** the dashboard has ~6 independently-loading sections (mission,
insight, progress, recommendations, reflection, plus the AI cards above), each
with its own skeleton. Nothing is wrong technically — every section handles its
own loading/empty/error correctly — but the page doesn't have one moment where
it feels "loaded." It settles in pieces over 1–2 seconds.

**Why it matters:** perceived performance is about the *feeling* of a page
being ready, not the actual network timing. A page that settles all at once
feels fast even if it technically took just as long.

**Effort:** Small — a single top-level skeleton state that resolves once the
critical-path data (not every card) is in, letting secondary sections
stream in underneath without each one announcing itself.
**Impact:** Medium.
**Recommend:** After launch. Real, but not urgent — the current behavior is
functional, just not maximally polished.

---

## Page by page

### Landing / Auth
Already recently reworked (calmed gradients, one accent, CSS-driven entrance
motion). Nothing further recommended here — this is a "don't redesign what
works" case.

### Dashboard (`LivingSurface`)
Strongest page in the product — one focus, one nudge, one next step, exactly
matching the stated brand promise. The only note is the cross-cutting loading
and AI-chrome items above; the underlying six-section narrative structure
itself is good and shouldn't change.

### Notes
**User problem:** three stacked `AIEnhancement` cards (see cross-cutting item)
make the top of a note page feel like an AI feature showcase before the
student has read a single word of their own note.
**Why it matters:** the note itself — the thing the student actually came for —
is pushed below three cards of varying load states.
**Effort:** Small once the cross-cutting fix lands (consolidate to one card with
a picker, or move to on-demand rather than auto-fetch-on-mount).
**Impact:** Medium-high — Notes is a daily-use surface.
**Recommend:** Before launch, bundled with the cross-cutting fix.

### Planner
Functionally solid. The one `AIEnhancement` card here is less disruptive than
on Notes since it's singular, but it still sits above the actual task list on
first load — a student opening Planner wants to see today's tasks first, the
AI suggestion second.
**Effort:** Small (reorder — AI suggestion below the task list, not above).
**Impact:** Low-medium.
**Recommend:** After launch.

### Resume Builder
Two `AIEnhancement` cards (review + ATS) plus the separate Dax-branded review
button covered under the cross-cutting item. Beyond that, the builder itself
is complete and the save/preview flow is clear — no further notes.

### Career
Placement Journey is a genuinely good signature object — a clear five-step
visual with real progress. The `AIEnhancement` card sits above it, which means
a student's first view of "your placement journey" is an AI card, not their
journey. Simple reorder fixes this independent of the bigger AI-consolidation
question.
**Effort:** Small.
**Impact:** Medium — this is the page's own named signature moment, and it's
currently upstaged by chrome.
**Recommend:** Before launch — this one is cheap and undercuts the page's own
best feature.

### Finance
Budget Progress (the signature object, from prior work) is solid: spend vs.
budget, category breakdown, quick actions. The `AIEnhancement` "advise" card
sits above it, same pattern as Career — recommend the same small reorder.
**Effort:** Small. **Impact:** Medium. **Recommend:** Before launch.

### Community
Not deeply re-reviewed this pass (unchanged since last audit) — still reads as
the least distinctive of the five workspaces; a plain card grid rather than
having its own "Meaningful Conversations" moment the way Career has Placement
Journey. This is a Phase 4 item per the original brief ("finish Community
experience"), not a stabilization fix.
**Effort:** Large (needs an actual signature feature, not a tweak).
**Impact:** Medium. **Recommend:** After launch — explicitly a Phase 4 item.

### Wellbeing
Not re-reviewed this pass; no new findings. Sub-pages (breathing, study
techniques, memory, routines, support) are complete per the route map.

### Settings
Comprehensive — appearance, profile, referral, password, delete account, and
now Dax Memory. The one soft note: it's the longest page in the app (~600
lines) and Dax Memory was added onto the end of an already-long list rather
than getting its own visual weight befitting "the thing that makes Dax feel
personal." Worth a heavier visual treatment for that section specifically,
not a restructure of the page.
**Effort:** Small (styling only, same section, more presence).
**Impact:** Low-medium — most users configure this once.
**Recommend:** After launch.

### Admin
Functional, plainer than the product proper — which is the right call for an
internal tool; no changes recommended. One process note carried over from the
stability report: two AI admin dashboards (`ai-center` / `ai-runtime`) exist
side by side and their scopes aren't obviously distinguished from the sidebar
label alone. If they stay separate, a one-line subtitle difference in the nav
would help; not urgent.

### Dax Chat
The floating launcher + panel pattern works and the memory feature (prior
session) gives it real continuity. The main product-identity gap isn't the
chat panel itself — it's everything covered under "AI chrome has crept back"
above. Once that's resolved, Dax stops competing with itself across the app
and Chat becomes unambiguously the one place "talking to Dax" happens.

---

## Summary table

| Item | Effort | Impact | Timing |
|---|---|---|---|
| Consolidate AI chrome (cross-cutting) | Large | High | **Before launch** |
| Notes: reduce 3 stacked AI cards | Small* | Medium-high | **Before launch** |
| Career: AI card below Placement Journey | Small | Medium | **Before launch** |
| Finance: AI card below Budget Progress | Small | Medium | **Before launch** |
| Dashboard: unify loading into one settle | Small | Medium | After launch |
| Planner: AI card below task list | Small | Low-medium | After launch |
| Settings: give Dax Memory visual weight | Small | Low-medium | After launch |
| Community: build its signature moment | Large | Medium | After launch (Phase 4) |

\* *Small once the cross-cutting consolidation lands; large if attempted alone,
since it's really the same fix repeated per page.*

No changes have been made. This is analysis only, same as the stability report —
ready for you to prioritize against it.
