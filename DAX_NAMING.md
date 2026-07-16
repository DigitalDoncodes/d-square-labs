# Dax — naming rules

DATAD has one AI identity: **Dax**. Not a chatbot, not a suite of tools — one
intelligence that shows up in different places doing different jobs. A student
should never wonder which AI they're talking to, because there is only one.

This document exists because "make it all say Dax" is the easy half. The hard
half is knowing where *not* to say it, and that judgement is what keeps the
rename from breaking the product.

## Source of truth

| Side | File | Use |
|---|---|---|
| Frontend | `client/src/utils/dax.js` | `DAX`, `DAX_CAPABILITY`, `DAX_WELCOME`, `daxAttribution()` |
| Backend | `server/ai/dax.js` | `DAX_CORE`, `withDaxIdentity()` |

Never hardcode the string `"Dax"` in a component or a prompt. Import it. The
whole point is that the name lives in one place.

## The rule

> **If a student (or admin) can read it, it says Dax.**
> **If a machine reads it, it does not.**

## Capability names

Use `DAX_CAPABILITY` rather than inventing a label:

`Dax Chat` · `Dax Insights` · `Dax Resume Review` · `Dax Planner` ·
`Dax Research` · `Dax Memory` · `Dax Recommendations` · `Dax Career Coach` ·
`Dax Notifications` · `Dax Summaries`

Renamed away from generic labels:

| Was | Now | Why |
|---|---|---|
| "DATAD AI" (chat header) | **Dax** | The product is DATAD; the assistant is Dax. Two names for one thing was the core confusion. |
| "AI Insight" | **Dax Insights** | Same intelligence, named. |
| "Document Summarizer" | **Dax Summaries** | A tool name implies a separate tool. |
| "Resume Reviewer" | **Dax Resume Review** | ” |
| "Career Advisor" | **Dax Career Coach** | ” |
| "Smart Search" | **Dax Research** | "Smart" says nothing; Dax says who. |
| "AI Tools Studio" | **Dax Studio** | It was a page of tools — the exact anti-pattern. |
| "AI suggestions" (planner) | **Dax Planner** | |
| "AI actions per day" (pricing) | **Dax actions per day** | The quota meters Dax, so name it Dax. |
| "AI Center" (admin) | **Dax Center** | Admins are users too. |

## Deliberately NOT renamed

These look like candidates and are not. Changing them breaks things.

**`role: 'assistant'` — the message protocol.** This is the OpenAI/Groq/
Anthropic wire format, not our copy. Every model call and every persisted
`ChatMessage.role` uses it. Renaming it breaks inference *and* orphans history.

**Model providers (Groq, Anthropic, OpenAI).** Provenance, not identity. Dax is
the author; the provider is which engine ran underneath. `AIBadge` shows both —
that's the trust story ("never hide the source"), not a naming inconsistency.

**`AiUsage` model, its collection, and `aiQuota` middleware.** Persisted data
and internal plumbing. Renaming the Mongoose model changes the collection name
and silently loses every existing quota row. Not user-facing; no reason to risk it.

**API routes (`/api/ai/*`, `/api/chat`).** Renaming to `/api/dax/*` breaks any
client on an older bundle mid-deploy. Backwards compatibility was an explicit
requirement. If these should move, do it as an additive alias with the old paths
kept, in its own change — not folded into a rename.

**`GROQ_API_KEY` and other provider env vars.** They name the vendor, and the
vendor is not Dax. Renaming breaks every deploy for zero user benefit.

**"AI" as a subject, not our assistant.** `AI & Technology` (a career interest),
`AI & Data` (a goal), `AI-guided` (a learning style). A student picking "AI &
Technology" as an industry interest is not picking Dax. Renaming these would be
nonsense.

**"AI infrastructure" on the Support page.** That's a real cost line — GPU time
and model API spend. The money goes to compute, not to a persona. The
product-facing mention next to it ("the AI assistant") *did* become Dax.

**Directory and file names** (`server/ai/`, `client/src/api/ai.js`,
`AIBadge.jsx`). Internal structure. The brief said not to rename technical names
that aren't user-facing, and churning import paths across the repo buys nothing.

## Voice

Dax speaks in the first person ("I'd start with…"), never refers to itself in
the third person, and never announces that it is an AI — `AIBadge` already
discloses that, and saying it twice is noise.

## Prompts

`server/ai/prompts/index.js` and `server/routes/aiRoutes.js` compose every
system prompt through `withDaxIdentity(specialisation)`. The string you pass is
**what Dax is doing right now**, not who Dax is:

```js
// Wrong — a second persona
system: `You are an expert case interview coach...`

// Right — Dax, specialised
system: withDaxIdentity(`You are writing the daily practice case...`)
```

Before this, nine prompt templates and seven route handlers each declared their
own persona. They really were different assistants; students could feel the
seams. One core, many jobs.
