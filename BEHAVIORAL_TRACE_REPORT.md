# DATAD — Behavioral Trace Report

**Scope:** analysis only, no application file modified. This report is built
from **actual runtime execution**, not static reading. Method is disclosed in
full below — I did not guess at any answer in the matrix.

## Method — what "instrumented" means here, precisely

I wrote a standalone Node script (outside the repo, in a scratchpad
directory — never touched `client/` or `server/`) that:

1. **Required the real server modules** (`daxService.js`,
   `studentIntelligenceEngine.js`, `aiGateway.js`, `ai/memory.js`,
   `ai/dax.js`, `ai/prompts/index.js`, `runtime-v2/contextBuilder.js`,
   `runtime-v2/promptRegistry.js`, `intelligence-layer/index.js`) and drove
   them with real inputs.
2. **Monkey-patched three boundaries, in-process only, nothing written to
   disk:**
   - `ai/providers/index.js:getProvider` — stubbed so no real LLM call was
     made (zero API cost, no real completion text). The stub still runs the
     *real* resolution logic to record what provider/model was actually
     selected — it only intercepts the network call itself.
   - Mongoose writes (`UserMemory.findOneAndUpdate`, `ChatMessage.insertMany`,
     `RuntimeComparison.create`, `AutomationLog.create`) — stubbed to record
     the call without touching the database.
   - Everything else (`getUserMemory`, `formatMemoryContext`,
     `withDaxIdentity`, all 16 prompt templates, `contextBuilder.buildContext`,
     `buildStudentProfile`, `promptRegistry.getPromptForIntent`) — wrapped to
     **observe**, not alter. The real logic ran untouched.
3. **Read real data** from the live dev database (read-only queries only —
   no document was created, modified, or deleted) to find real
   users/resumes/notes/tasks to drive the trace with.
4. Called the real entry-point functions directly
   (`daxService.process(userId, task, body, user)` for every Dax-branded
   feature, `studentIntelligenceEngine.enhance({...})` for every
   `AIEnhancement`-card feature) and recorded what happened at each observed
   boundary.

**What this proves vs. what it doesn't:** every "was memory loaded,"
"which prompt was selected," "was identity injected," "which runtime ran"
answer below is a **directly observed fact from real code execution**, not
an inference. What it does *not* prove is what a real LLM would have
*replied* — that boundary was intentionally stubbed to keep this pass free
of cost and side effects. Where the database itself had no data for a
feature (confirmed separately, not assumed), I say so rather than papering
over it.

---

## Headline finding — unrelated to the Dax/Runtime V2 duplication story

**Chat's provider resolution is fragile in this environment, and I confirmed
it two ways: reading the actual code, and probing the actual infrastructure.**

- The trace shows `routeTask('chat')` resolves to **`ollama`**, not Groq —
  confirmed live, not assumed (`ai/router.js`'s `TASK_CAPABILITY['chat'] =
  'explain'`, fallback chain "NVIDIA NIM → Ollama (local) → Error").
- `getProvider()`'s availability check (`ai/providers/openaiCompatible.js:26`,
  `isAvailable() { return Boolean(this._config.apiKey); }`) is a **static
  config check, not a live reachability probe** — and Ollama's configured
  `apiKey` is a hardcoded placeholder string (`'ollama'`, `automation.js:50`,
  comment: "no real key needed"), so this check **always passes for Ollama
  regardless of whether anything is actually running.**
- I probed `http://localhost:11434` directly: **`HTTP 000` — nothing is
  listening.** Not inferred, directly observed.
- The chat-specific code path (`aiGateway.js`'s messages-branch,
  `_execV1` lines 215-227) has **zero retry and zero fallback** — a single
  `await p.complete(...)` with no `try/catch` around it. Compare this to the
  non-chat path (`ai/runner.js:_nativeRun`), which *does* retry up to
  `AI_RETRY_ATTEMPTS` (default 3) — but re-reading that loop shows each
  retry calls `getProvider(preferredProvider)` with the **same** preferred
  name, and since availability is a static check that doesn't change between
  attempts, a failing Ollama call would very likely be retried against
  Ollama three times, not against Groq.

**Net effect, stated carefully:** I did not send a real chat message through
the live HTTP server with a real auth session (no login available, consistent
with every prior report in this engagement). But I traced every line of the
call chain a real request would take, and independently confirmed the one
external fact the whole chain depends on — and it fails. The honest
statement is: **a real Dax Chat request in this environment today would very
likely throw at the provider-call step**, for a reason that has nothing to
do with the Dax/Runtime V2 duplication this whole engagement has been about.
This deserves investigation before any migration work, not after.

---

## Per-feature trace

For each feature: the 10 questions, answered from the trace where the
feature actually executed, or from direct static/infrastructure evidence
where it didn't reach the LLM boundary (stated explicitly either way).

### 1. Chat
1. **Frontend component:** `ChatBot.jsx` (confirmed in `AI_ARCHITECTURE_REPORT.md`, unchanged).
2. **Endpoint:** `POST /api/dax {task:'chat'}` → `daxRoutes.js`.
3. **Service:** `daxService.js`'s `HANDLERS.chat` — **correction to my own
   prior report:** I previously wrote "chat is NOT in the HANDLERS map." That
   was wrong. Rereading `daxService.js` directly during this pass:
   `process(userId, task, body, user)` dispatches purely via
   `HANDLERS[task]`, and `chat:` **is** a key in that object (line 372).
   Stated plainly rather than silently fixed.
4. **Prompt:** not from `ai/prompts/index.js` — built inline inside the
   `chat` handler (student profile + tasks + memory composed into a custom
   system string), then wrapped in `withDaxIdentity()`.
5. **Model/provider:** requested `'ollama'` (per `routeTask('chat')`);
   resolution reported success (`isAvailable()` passed) — **but see the
   headline finding: this is very likely to fail on an actual network call
   in this environment.**
6. **Dax identity injected:** **Yes** — observed directly:
   `withDaxIdentity called: true, startsWithDaxCore: true`.
7. **Memory loaded:** **Yes** — observed directly: `getUserMemory found: true`,
   `formatMemoryContext producedNonEmptyContext: true` (123 chars, from a
   real user's real `UserMemory` document).
8. **Runtime V2 used:** No. This request never touches any `runtime-v2/*` module.
9. **Student Intelligence used:** **Yes, but specifically the
   `intelligence-layer` profile system** (`buildStudentProfile`, called via
   `aiGateway.js`'s `_buildProfile`) — observed directly:
   `built: true, hasEnrichedContext: true`. This is a **different system**
   from `runtime-v2/studentIntelligenceEngine.js` despite the near-identical
   name — see the naming-collision note at the end of this report.
10. **Response path:** `daxService.process()` → `{reply, remaining}` →
    `daxRoutes.js` → JSON response. (Persistence — `ChatMessage.insertMany`,
    `UserMemory` topic append — was observed as *attempted*, stubbed from
    actually writing.)

### 2. Resume Review — **two reachable code paths, confirmed live**

**2a. Dax-branded button (`ResumePage.jsx`'s "Review with Dax"):**
1. Component: `ResumePage.jsx` → `AIReviewPanel`.
2. Endpoint: `POST /api/dax {task:'review-resume'}`.
3. Service: `daxService.js` `HANDLERS['review-resume']`.
4. Prompt: inline (`withDaxIdentity('You are coaching on career
   direction...')`) — not from `ai/prompts/index.js`.
5–10: **The trace threw before reaching the provider:**
   `NotFoundError: No resume found — build one first`. This is real,
   correct guard behavior — but it happened because **this dev database's
   `Resume` collection has 0 documents** (confirmed directly: `Resume.countDocuments()
   → 0`, not a query bug). This is a property of this specific database's
   current state, not a code defect. **I could not observe the
   memory/provider/identity steps for this specific path** because the
   real code stops before reaching them for any user without a saved resume.

**2b. `AIEnhancement` card, same page, same time:**
1. Component: `ResumePage.jsx` → `<AIEnhancement page="resume" action="review">`.
2. Endpoint: `POST /api/enhance {page:'resume',action:'review'}`.
3. Service: `runtime-v2/studentIntelligenceEngine.js:enhance()`.
4. Prompt: **observed directly — resolves to the empty fallback.**
   `getPromptForIntent` returned `resolvedPromptId: "chat", systemWasEmpty: true`.
   This confirms, with a real execution rather than static reading, the
   quality gap I found by tracing code alone in the prior report.
5. Model/provider: `groq` / `llama-3.3-70b-versatile` — resolved cleanly (Groq
   is the one provider with a real key in this environment).
6. **Dax identity injected: No** — `withDaxIdentity` was never called on
   this path (confirmed by the absence of that event in the trace for this
   feature — every other feature where it *was* called shows the event
   explicitly).
7. Memory loaded: not observed as a distinct step here — `contextBuilder`
   included `'memory'` in its requested `contextKeys`, but its internal
   memory read isn't the same wrapped function I instrumented (`ai/memory.js`'s
   `getUserMemory`); it goes through `runtime-v2/memoryAdapter.js` instead,
   which I did not separately wrap in this pass.
8. Runtime V2 used: **Yes**, fully — `contextBuilder`, `promptRegistry`,
   `modelRouterV2` (via the `routing` object in the return value) all fired.
9. Student Intelligence used: **Yes, but the `studentIntelligenceEngine.js`
   meaning, not the `intelligence-layer` meaning** — `buildStudentProfile`
   was never called on this path (absent from the trace).
10. Response path: `enhance()` → `{page, action, insight, verification,
    routing, cost, latencyMs}` → `enhanceRoutes.js` → JSON. Verification
    reported `status: "failed"` — **this is a stub artifact** (my fake
    provider response isn't a realistic completion for the verifier to
    grade), not a claim about real-world verification behavior.

**Both paths are live, reachable from the same page, in the same session.**
Path 2a carries the product's identity and a hand-tuned prompt; path 2b does
not carry identity and — confirmed by direct execution, not inference — runs
with no system prompt for this specific action.

### 3. Note Summary — **single live path, and it is not the Dax-branded one**
1. Component: `NoteDetailPage.jsx` → `<AIEnhancement page="notes" action="summarize">`.
   Confirmed directly (again) in this pass: `summariseNote()` — the
   Dax-branded equivalent, exported from `api/ai.js`/`api/dax.js` and backed
   by a real `daxService.js` `HANDLERS['summarise-note']` — has **zero
   callers anywhere in `client/src`**. Grepped explicitly.
2. Endpoint: `POST /api/enhance {page:'notes',action:'summarize'}`.
3. Service: `studentIntelligenceEngine.js:enhance()`.
4. Prompt: **observed directly — empty fallback**, same as 2b:
   `resolvedPromptId: "chat", systemWasEmpty: true`. This confirms, by
   execution, the broken `summariseNote` key mapping found by static tracing
   in the prior report (`V1_PROMPT_TASK_MAP['summarise-note'] → 'summariseNote'`,
   a key that doesn't exist in `ai/prompts/index.js`).
5. Provider: `groq` / `llama-3.3-70b-versatile`.
6. Identity injected: **No.**
7. Memory: same caveat as 2b — routed through `memoryAdapter.js`, not directly observed in this pass.
8. Runtime V2 used: **Yes.**
9. Student Intelligence: `studentIntelligenceEngine.js` sense only; `intelligence-layer` not invoked.
10. Response path: same shape as 2b.

*(This dev database also has 0 `Note` documents — confirmed directly — so
the actual note-content portion of context assembly was empty for this
trace; the code path and prompt-resolution findings above are unaffected by
that, since they happen regardless of whether note content is present.)*

### 4. News Summary — **not a live, user-triggered feature at all**
1. Frontend component: **none.** No page, no button, no component calls
   anything related to news summarization.
2. Endpoint: **none.** There is no HTTP route for this.
3. Service: `server/services/newsEnhancer.js`, invoked by `newsFetcher.js`.
4. Prompt: `ai/prompts/index.js:newsEnhance` — called directly.
5. Provider: routed via `ai/runner.js:run()` directly (not through
   `daxService.js`, not through `aiGateway.js`'s Dax-branded path — though
   `runner.js` does lazily delegate to `aiGateway` when available, so it
   would still resolve a provider through the same shared layer).
6. Identity injected: **Yes** — `newsEnhance`'s system prompt calls
   `withDaxIdentity()` like every other template in that file — but this
   matters less here since nothing shows this content to a student as "Dax
   said this"; it's batch-processed into cached articles.
7. Memory loaded: **No** — this is a batch job over a set of articles, not
   a per-student request; there is no `userId` in scope for it to load
   memory for.
8. Runtime V2 used: **No.**
9. Student Intelligence used: **No** (neither meaning).
10. Response path: **none to a client.** Output is written to the `NewsItem`
    collection for later display, not returned synchronously to any request.

**This is confirmed by tracing its actual trigger, not assumed:** it's wired
into a scheduled automation job (`automation/news/` — the directory exists;
its contents are cron-triggered per `config/automation.js`'s `schedules`
block), structurally different in kind from the other 8 features on this
list. It should not be represented in the matrix as if it shared the same
request/response shape as the others.

### 5. Career Advice — **single live path, not the Dax-branded one**
Same pattern as Note Summary, confirmed the same way:
`careerAdvice()` (`api/ai.js`/`api/dax.js`, backed by real
`daxService.js` `HANDLERS['career-advice']`) has **zero frontend callers** —
grepped explicitly this pass, not assumed from the prior report.
1. Component: `CareerHubPage.jsx` → `<AIEnhancement page="career" action="roadmap">`.
2. Endpoint: `POST /api/enhance`.
3. Service: `studentIntelligenceEngine.js:enhance()`.
4. Prompt: **observed — empty fallback**, `resolvedPromptId: "chat", systemWasEmpty: true`
   (`V1_PROMPT_TASK_MAP['career-advice']` is `null` — an intentional gap, not
   a broken key like Note Summary's, but the runtime effect is identical).
5. Provider: `groq` / `llama-3.3-70b-versatile`.
6. Identity injected: **No.**
7–10: same shape as Note Summary.

### 6. Finance Advice — **single live path, not Dax-branded — but the one exception with a real prompt**
`financeAssist()` — zero frontend callers, confirmed. `FinanceHubPage.jsx`
only renders `<AIEnhancement page="finance" action="advise">`.
1–3: same shape as above.
4. Prompt: **the one case in this trace where the V2 fallback actually
   resolves to real content** — `resolvedPromptId: "v1:finance-assist",
   systemWasEmpty: false`. `V1_PROMPT_TASK_MAP['finance-assist'] = 'financeAssist'`,
   and that key *does* exist in `ai/prompts/index.js`, so
   `_resolveV1Prompt` succeeds and calls the real V1 `financeAssist` template.
5. Provider: `groq` / `llama-3.3-70b-versatile`.
6. **Dax identity injected: Yes** — and this is a genuinely important
   correction to my prior static report. I previously wrote "zero
   references to `withDaxIdentity` anywhere in `runtime-v2/*.js`" — that's
   still true of the runtime-v2 *code itself*, but I hadn't traced through to
   what happens when its V1-prompt fallback *succeeds*: every template in
   `ai/prompts/index.js` calls `withDaxIdentity()` internally (confirmed —
   all 16), so when `promptRegistry.js` borrows a working V1 template, **it
   transitively inherits the Dax identity**, observed directly in this
   trace (`withDaxIdentity called: true`). The identity gap is real, but
   it's narrower than "runtime-v2 never carries identity" — it's "runtime-v2
   carries identity only for the subset of tasks whose V1-prompt fallback
   actually resolves," which per the earlier audit is roughly 9 of ~14 tasks
   — and finance-advise is one of the ones that works.
7. Memory: routed via `contextBuilder` (`'memory'` in requested `contextKeys`), not separately confirmed via `ai/memory.js`.
8. Runtime V2 used: **Yes.**
9. Student Intelligence: `studentIntelligenceEngine.js` sense only.
10. Response path: same shape as above.

### 7. Dashboard Insights — **single live path, not Dax-branded, same exception as Finance**
`dashboardInsights()` — zero frontend callers, confirmed.
`LivingSurface.jsx` renders `<AIEnhancement page="dashboard" action="view">`
(and `detect-problems`/`recommend` variants).
1–3: same shape.
4. Prompt: `resolvedPromptId: "v1:dashboard-insights", systemWasEmpty: false`
   — same "fallback actually works" case as Finance Advice
   (`V1_PROMPT_TASK_MAP['dashboard-insights'] = 'dashboardInsights'`, and that
   key exists).
5. Provider: `groq` / `llama-3.3-70b-versatile`.
6. **Identity injected: Yes** — same mechanism as Finance Advice.
7. Memory: same caveat as above.
8. Runtime V2 used: **Yes.**
9. Student Intelligence: `studentIntelligenceEngine.js` sense only.
10. Response path: same shape.

### 8. Planner — **two reachable code paths, confirmed live, and they behave differently**

**8a. Dax-branded button (`PlannerPage.jsx`, "Get suggestions"):**
1–3: `PlannerPage.jsx` → `plannerSuggest()` → `POST /api/dax {task:'planner-suggest'}` → `daxService.js HANDLERS['planner-suggest']`.
4. Prompt: inline, `withDaxIdentity(...)`.
5. Provider: requested `groq` this time (not `ollama` — `routeTask('planner-suggest')`
   evidently resolves differently from `routeTask('chat')`; both map to
   `TASK_CAPABILITY` entries but land on different capability categories —
   `planner-suggest → 'planner'` vs `chat → 'explain'` — and the capability
   scorer apparently ranks Groq ahead of Ollama for the planner capability
   in this environment). **This is a real, observed difference in provider
   selection between two Dax-branded tasks**, worth noting since it means
   the Ollama-fragility risk found under Chat does not uniformly apply to
   every Dax task — it appears task-specific.
6. Identity injected: **Yes** (observed directly).
7. Memory loaded: **Yes** (observed directly, same real user/document as Chat).
8. Runtime V2 used: **No.**
9. Student Intelligence used: **Yes, `intelligence-layer` sense** (observed directly).
10. Response path: `daxService.process()` return. (Its shape in this trace
    — `{stub, _meta}` — is an artifact of my stubbed provider returning fake
    JSON that the handler parsed as-is; not a real response shape.)

**8b. `AIEnhancement` card, same page:**
1–3: `PlannerPage.jsx` → `<AIEnhancement page="planner" action="optimize">` → `POST /api/enhance` → `studentIntelligenceEngine.js:enhance()`.
4. Prompt: **empty fallback**, `resolvedPromptId: "chat", systemWasEmpty: true`
   (`V1_PROMPT_TASK_MAP['planner-suggest'] = null`).
5. Provider: `groq`.
6. Identity injected: **No.**
7. Memory: routed via `contextBuilder`, not directly confirmed.
8. Runtime V2 used: **Yes.**
9. Student Intelligence: `studentIntelligenceEngine.js` sense only.
10. Response path: `enhance()` return shape.

**Same page, two buttons/cards, two different provider choices, one with
identity and memory, one without.** This is the second confirmed dual-path
feature, alongside Resume Review.

### 9. Wellbeing — **no AI feature exists on any Wellbeing page**
Checked all five Wellbeing pages
(`WellbeingPage`, `WellbeingStudyPage`, `WellbeingMemoryPage`,
`WellbeingRoutinesPage`, `WellbeingSupportPage`) directly this pass:
zero imports of `AIEnhancement`, `useEnhancement`, `api/ai`, or `api/dax`
anywhere. **All 10 questions are not applicable** — there is nothing to
trace. If Wellbeing is meant to have an AI feature, it hasn't been built yet;
this isn't a duplication or routing problem like the other 7, it's an
absence.

---

## The matrix

| Feature | Endpoint | Prompt | Memory | Runtime | Identity | Provider |
|---|---|---|---|---|---|---|
| Chat | `POST /api/dax` | inline (custom, via `withDaxIdentity`) | ✅ loaded (real data) | V1 | ✅ | `ollama` requested — **likely unreachable, see headline finding** |
| Resume Review — Dax button | `POST /api/dax` | inline, `withDaxIdentity` | *(not reached — no resume in DB)* | V1 | *(not reached)* | *(not reached)* |
| Resume Review — AI card | `POST /api/enhance` | **empty (`system:''`)** | not confirmed | V2 | ❌ | `groq` |
| Note Summary | `POST /api/enhance` *(only live path)* | **empty (`system:''`)** | not confirmed | V2 | ❌ | `groq` |
| News Summary | *(none — cron job)* | `newsEnhance`, direct | ❌ (no per-user request) | neither | ✅ *(unused by anyone)* | resolved via `runner.js` |
| Career Advice | `POST /api/enhance` *(only live path)* | **empty (`system:''`)** | not confirmed | V2 | ❌ | `groq` |
| Finance Advice | `POST /api/enhance` *(only live path)* | `financeAssist` (real content) | not confirmed | V2 | ✅ *(inherited via V1 fallback)* | `groq` |
| Dashboard Insights | `POST /api/enhance` *(only live path)* | `dashboardInsights` (real content) | not confirmed | V2 | ✅ *(inherited via V1 fallback)* | `groq` |
| Planner — Dax button | `POST /api/dax` | inline, `withDaxIdentity` | ✅ loaded (real data) | V1 | ✅ | `groq` |
| Planner — AI card | `POST /api/enhance` | **empty (`system:''`)** | not confirmed | V2 | ❌ | `groq` |
| Wellbeing | *(none — no AI feature exists)* | — | — | — | — | — |

**"Not confirmed" on Memory** means: `contextBuilder.buildContext` requested
`'memory'` as a context key, but its actual read goes through
`runtime-v2/memoryAdapter.js`, which I did not individually instrument in
this pass (unlike `ai/memory.js`, which I did). This is a real gap in this
specific trace, not a claim that memory definitely wasn't used — flagging
honestly rather than guessing either way.

## Features reachable by two different code paths depending on how they're triggered

**Resume Review** and **Planner** — confirmed live, both paths executed
successfully (or reached a real guard) in this trace, on the same page, and
they resolve to materially different behavior (identity present/absent,
prompt content present/empty, in Chat's case a different provider
preference entirely). These are the two features where "which code path
runs" depends on which UI element the student happens to click, not on any
server-side configuration — both paths are always reachable, simultaneously,
regardless of any flag or mode.

**Note Summary, Career Advice, Finance Advice, Dashboard Insights** are
each single-path today, but the *unreachable* path (the matching
`daxService.js` `HANDLERS` entry) is fully built, tier-gated, and quota-metered
on the server — it's just never called by any current UI. Worth knowing this
distinction precisely before Phase 3 of the migration blueprint, since "add
the missing frontend call" is a smaller change than "build the feature from
scratch."

## Note on the "Student Intelligence" naming collision

Question 9 in the brief ("Was Student Intelligence used?") has **two
different real answers depending on which system is meant**, and this trace
confirms they are mutually exclusive per code path:

- **`ai/intelligence-layer/`** (`buildStudentProfile`) — used exclusively by
  `aiGateway.js`'s `_buildProfile()`, i.e., only on the Dax/V1 path (Chat,
  Planner button, and Resume Review button if it got past the guard).
- **`ai/runtime-v2/studentIntelligenceEngine.js`** — used exclusively by
  `/api/enhance`, i.e., only on the `AIEnhancement`-card path.

No traced feature used both. This matters directly for the migration blueprint's
Phase 2, §"Risks" — that document already flagged `_buildProfile`'s
relocation as something that needs an explicit positive check; this trace
is the first real evidence of what that enrichment actually looks like in
practice (`hasEnrichedContext: true`, sourced from real identity/memory/task
data for a real user).

---

## What this changes about the migration blueprint

Nothing structural — the target architecture and phase plan in
`MIGRATION_BLUEPRINT.md` still holds. But two things should be folded into
Phase 2 rather than discovered mid-migration:

1. **The Ollama/Chat provider fragility is unrelated to the migration and
   should be fixed independently, ideally before Phase 2 starts** — a
   migration is exactly the wrong time to also be debugging an unrelated
   "why is chat suddenly failing" report.
2. **The identity-inheritance nuance changes the "8 of 17 actions have no
   prompt" framing slightly** — it's not that those actions have no
   *possible* identity, it's that the specific tasks whose `V1_PROMPT_TASK_MAP`
   entry is `null` (an intentional gap) or broken (`summarise-note`) get
   neither content nor identity, while the ones that *do* resolve get both
   for free, as a side effect of reusing the V1 template. This makes
   `promptRegistry.js`'s fix (Migration Blueprint P2-1) slightly higher
   value than originally scoped — fixing the broken key and seeding the
   registry doesn't just add missing prompt content, it also closes the
   identity gap for those tasks automatically, without a separate change.

---

*No application files were modified in the production of this report. The
diagnostic harness script and its output remain outside the repository.*
