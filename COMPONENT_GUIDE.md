# DATAD Component Guide

## Reusable Component Specifications & Patterns

> This document defines every reusable component in the DATAD design system.
> All components live under `src/components/common/` unless otherwise noted.
> No component shall be duplicated across feature directories.

---

## 1. Component Hierarchy

```
Layout
├── AppShell          → Sidebar + Header + Footer + ChatBot
├── WorkspaceLayout   → Secondary tab strip
├── AuthShell         → Centered auth card
└── Footer            → Links + branding

Common
├── Button            → primary / secondary / ghost / danger
├── Card              → .card (passive) / .card-hover (interactive)
├── Modal             → Overlay dialog
├── ConfirmModal      → Confirmation dialog (danger mode)
├── Input             → .input base + variants
├── SmartSelect       → Dropdown / pill-group with "Other" option
├── PageHeader        → Title + subtitle + action + insight
├── EmptyState        → Icon + title + description + CTA
├── Loader            → Full-page spinner (deprecated in favor of skeletons)
├── Skeleton          → Shimmer primitive + layout variants
├── ErrorBoundary     → Class-based render error catch
├── ProtectedRoute    → Auth gate
├── TierGate          → Subscription tier gate
├── CrownBadge        → Tier indicator pill
├── AIBadge           → AI attribution badge
├── AIInsight         → AI insight panel
├── CommandPalette    → ⌘K global search
├── NotificationBell  → Dropdown notification center
├── Logo / DatadMark  → Brand wordmark
├── InviteCard        → Referral code display
├── UpcomingGrid      → Coming-soon feature grid (to be removed)
└── ReadinessCard     → Score ring + component breakdown (to be split)

Motion
├── Page              → CSS fade-up entrance
├── Stagger           → CSS staggered children
├── StaggerItem       → Individual staggered element
└── AnimatedNumber    → Static number display (no JS animation)

Chat
├── ChatBubble        → User/assistant message bubble
├── TypingIndicator   → Animated typing dots
└── AICoach           → Dashboard AI coach widget

Experience
├── LivingSurface     → Dashboard orchestrator
├── AdaptiveWorkspace → Widget prioritization engine (logic only)
├── DailyMissionCard  → Today's mission
├── ExplainableRecCard→ Recommendation with reason
├── GoalProgress      → Goal tracking
├── ReadinessTrend    → Readiness score mini-widget
├── SmartCard         → Generic smart surface
├── WeeklyReview      → Weekly summary
└── AICoach           → (shared with chat)
```

---

## 2. Button System

### 2.1 Component Specification

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `icon` | `LucideIcon \| null` | `null` | Left icon |
| `iconRight` | `LucideIcon \| null` | `null` | Right icon |
| `loading` | `boolean` | `false` | Show spinner, disable |
| `disabled` | `boolean` | `false` | Gray out, no interaction |
| `fullWidth` | `boolean` | `false` | `w-full` |
| `onClick` | `() => void` | — | Click handler |
| `type` | `'button' \| 'submit'` | `'button'` | HTML type |
| `children` | `ReactNode` | — | Button content |

### 2.2 Styling Tokens

```css
/* Base — shared by all variants */
.btn {
  @apply inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 
         text-sm font-medium transition-colors duration-150 
         disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Primary — indigo fill, white text */
.btn-primary {
  @apply btn bg-indigo-600 text-white hover:bg-indigo-500 
         active:scale-[0.97];
}

/* Secondary — white/gray-900 fill, border */
.btn-secondary {
  @apply btn border border-gray-200 bg-white text-gray-700 
         hover:border-gray-300 hover:bg-gray-50 
         dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 
         dark:hover:border-gray-700 dark:hover:bg-gray-800;
}

/* Ghost — transparent, subtle hover */
.btn-ghost {
  @apply btn border-transparent bg-transparent px-3 text-gray-500 
         hover:bg-gray-100 hover:text-gray-700 
         dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200;
}

/* Danger — rose fill, white text */
.btn-danger {
  @apply btn bg-rose-600 text-white hover:bg-rose-500 
         active:scale-[0.97];
}
```

### 2.3 Size Variants

| Size | Padding | Font | Icon |
|---|---|---|---|
| `sm` | `px-3 py-1.5` | `text-xs` | `h-3.5 w-3.5` |
| `md` | `px-4 py-2` | `text-sm` | `h-4 w-4` |
| `lg` | `px-5 py-2.5` | `text-sm` | `h-4 w-4` |

### 2.4 Usage Rules

1. **Primary** for the main action on a page (save, create, submit).
2. **Secondary** for alternative actions (cancel, back, view all).
3. **Ghost** for tertiary actions in dense areas (table actions, inline edits).
4. **Danger** for destructive actions (delete, remove, archive).
5. **Never use inline button styles.** Always use `<Button variant="primary">`.

### 2.5 Migration: Current Inline Patterns

| File | Current Pattern | Replace With |
|---|---|---|
| `LoginPage.jsx:56` | `"w-full rounded-xl bg-indigo-600 py-2.5..."` | `<Button variant="primary" fullWidth>` |
| `PlannerPage.jsx:195` | `"rounded-lg bg-indigo-600 px-3 py-2..."` | `<Button variant="primary" size="sm">` |
| `ConfirmModal.jsx:83` | Inline danger button | `<Button variant="danger">` |
| `RegisterPage.jsx:145` | `"rounded-xl border border-gray-200..."` | `<Button variant="secondary">` |

---

## 3. Card System

### 3.1 Component Specification

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'passive' \| 'hover' \| 'interactive'` | `'passive'` | Card behavior |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| `hoverable` | `boolean` | `false` | Enables hover effect |
| `onClick` | `() => void \| null` | `null` | Makes card clickable |
| `as` | `'div' \| 'a' \| 'button' \| Link` | `'div'` | Rendered element |
| `className` | `string` | `''` | Additional classes |
| `children` | `ReactNode` | — | Card content |

### 3.2 Styling Tokens

```css
/* Passive — flat surface, no interaction */
.card {
  @apply rounded-2xl border border-gray-200/80 bg-white p-5 
         dark:border-gray-800/80 dark:bg-gray-900;
}

/* Hover — responds with subtle depth */
.card-hover {
  @apply card transition-shadow duration-150 ease-out 
         hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)]
         dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)];
}

/* Interactive — clickable card */
.card-interactive {
  @apply card-hover cursor-pointer;
}
```

### 3.3 When to Use Which

| Variant | Example |
|---|---|
| `passive` | Note detail content, journal entry, settings section |
| `hover` | Note card in grid, company card, stat tile (with Link) |
| `interactive` | Feature cards on MeHub, widget cards |

### 3.4 Padding Variants

| Padding | Value | When |
|---|---|---|
| `sm` | `p-4` (16px) | Dense grids, small stat tiles |
| `md` | `p-5` (20px) | Default — most cards |
| `lg` | `p-6` (24px) | Hero cards, feature cards |

**Rule:** All cards default to `p-5`. The `sm` variant is only for grids where space is tight. The `lg` variant is only for hero/emphasis cards.

---

## 4. Input System

### 4.1 Text Input

Uses the global `.input` class with no overrides:

```tsx
<input className="input" placeholder="Enter text..." />
```

### 4.2 Select

Uses `.input` styled as select:

```tsx
<select className="input" aria-label="...">
  <option>Option 1</option>
</select>
```

### 4.3 Textarea

Extends `.input` with `resize-none` and `min-h-[80px]`:

```tsx
<textarea className="input resize-none min-h-[80px]" rows={3} />
```

### 4.4 SmartSelect

A compound component handling dropdown, pill-group, and "Other" custom input. Already exists at `components/common/SmartSelect.jsx`. Migrate all select patterns to use it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array<{value, label}>` | `[]` | Available options |
| `value` | `string` | `''` | Current value |
| `onChange` | `(value: string) => void` | — | Change handler |
| `label` | `string \| null` | `null` | Field label |
| `placeholder` | `string` | `'Select…'` | Placeholder text |
| `variant` | `'dropdown' \| 'pills'` | `'dropdown'` | Visual variant |
| `allowOther` | `boolean` | `true` | Show "Other..." option |
| `required` | `boolean` | `false` | Required marker |
| `error` | `string \| null` | `null` | Validation error |

### 4.5 Migration: Current Input Patterns

| File | Current Pattern | Replace With |
|---|---|---|
| `LoginPage.jsx:9` | `fieldClass` string | Removed — use `.input` |
| `PlannerPage.jsx:81` | `inputClass` string | Removed — use `.input` |
| `FinanceOverviewPage.jsx:38` | `inputClass` string | Removed — use `.input` |
| `JournalPage.jsx:27` | `inputClass` string | Removed — use `.input` |
| `SubscribePage.jsx:180` | Inline input classes | Use `.input` |

---

## 5. Modal System

### 5.1 Modal (Generic)

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Show/hide |
| `onClose` | `() => void` | — | Close handler |
| `title` | `string` | — | Dialog title |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Max-width variant |
| `children` | `ReactNode` | — | Dialog content |

**Size variants:**
- `sm` → `max-w-sm` (384px) — confirmations, simple forms
- `md` → `max-w-md` (448px) — default, most dialogs
- `lg` → `max-w-lg` (512px) — complex forms, previews

### 5.2 ConfirmModal

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Show/hide |
| `onClose` | `() => void` | — | Cancel |
| `onConfirm` | `() => void` | — | Confirm action |
| `title` | `string` | `'Are you sure?'` | Dialog title |
| `message` | `string \| null` | `null` | Description |
| `danger` | `boolean` | `false` | Red confirm button |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |

### 5.3 Modal Rules

1. **Backdrop** uses `bg-black/40 backdrop-blur-[2px]` — enough to dim, not enough to disorient.
2. **Close on backdrop click** — always. Close on Escape — always.
3. **Focus trap** — on open, focus the first interactive element (close button for Modal, confirm button for ConfirmModal).
4. **Only one modal open at a time.** No stacked modals.
5. **Animation** — Modal appears with CSS `.animate-in` (fade-up 200ms). No animation on close (instant removal).

---

## 6. PageHeader

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `LucideIcon \| null` | `null` | Section icon |
| `title` | `string` | — | Page title |
| `subtitle` | `string \| null` | `null` | Page description |
| `action` | `{ label, onClick, icon? } \| JSX \| null` | `null` | Primary action |
| `insight` | `string \| null` | `null` | AI insight pill |
| `className` | `string` | `''` | Additional classes |

**Styling:**
```tsx
<div className="mb-6">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0">
      <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-gray-400" />}
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
  {insight && <AIInsight text={insight} />}
</div>
```

---

## 7. EmptyState

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `LucideIcon \| null` | `null` | Hero icon |
| `title` | `string` | — | Primary message |
| `description` | `string \| null` | `null` | Secondary message |
| `action` | `{ label, to } \| { label, onClick } \| null` | `null` | CTA button |

**Styling:**
```tsx
<div className="flex flex-col items-center gap-4 py-16 text-center">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl 
                  bg-gray-100/80 ring-1 ring-gray-200/60 
                  dark:bg-gray-800/80 dark:ring-gray-700/60">
    <Icon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
  </div>
  <div className="max-w-xs">
    <p className="font-semibold text-gray-700 dark:text-gray-200">{title}</p>
    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{description}</p>
  </div>
  {action && <Button variant="primary">{action.label}</Button>}
</div>
```

---

## 8. Skeleton System

### 8.1 Base Skeleton

```tsx
function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}
```

### 8.2 Layout Skeletons

| Component | Matches | Columns | Usage |
|---|---|---|---|
| `CardSkeleton` | Note/company card | Single | Inside grids |
| `CardGridSkeleton` | Card grid | Param (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) | Any card grid |
| `RowSkeleton` | List row | Single | Feed, task list |
| `FeedSkeleton` | Row stack | Single (vertical stack) | List pages |
| `TileSkeleton` | Stat tile | `grid-cols-2` | Dashboard stats |

### 8.3 Skeleton Rules

1. Always match the real layout dimensions exactly.
2. Never show less than 2 skeletal items (except for single-item pages like detail views).
3. Never fade skeleton into content — replace instantly.
4. Skeleton should fill the viewport height to prevent layout shift.

---

## 9. AI Components

### 9.1 AIBadge

```tsx
function AIBadge({ provider, confidence, className = '' }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full 
                     border border-indigo-200 bg-indigo-50 px-2 py-0.5 
                     text-[10px] font-medium text-indigo-600 
                     dark:border-indigo-800/60 dark:bg-indigo-900/30 
                     dark:text-indigo-400">
      <Sparkles className="h-2.5 w-2.5" />
      AI{provider ? ` · ${provider}` : ''}
      {confidence != null ? ` · ${Math.round(confidence * 100)}%` : ''}
    </span>
  )
}
```

### 9.2 ChatBubble (New — Extract from AICoach/ChatBot)

A unified chat bubble component that replaces the duplicated implementations in `AICoach.jsx` and `ChatBot.jsx`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `role` | `'user' \| 'assistant'` | — | Who sent the message |
| `content` | `string` | — | Message text |
| `timestamp` | `string \| null` | `null` | Optional time display |

**Styling:**
```tsx
const bubbleUser  = 'rounded-2xl rounded-tr-sm bg-indigo-600 text-white'
const bubbleAssistant = 'rounded-2xl rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'

const container = role === 'user' ? 'flex-row-reverse' : 'flex-row'
const bubble = role === 'user' ? bubbleUser : bubbleAssistant

return (
  <div className={`flex gap-2 ${container}`}>
    {role === 'assistant' && <AssistantAvatar />}
    <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${bubble}`}>
      {content}
    </div>
  </div>
)
```

### 9.3 TypingIndicator (New — Extract from AICoach/ChatBot)

```tsx
function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <AssistantAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm 
                      bg-gray-100 px-4 py-3 dark:bg-gray-800">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}
```

### 9.4 AIInsight (Inline Insight Pill)

```tsx
function AIInsight({ text }) {
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full 
                    border border-indigo-200 bg-indigo-50 px-3 py-1 
                    text-xs font-medium text-indigo-700 
                    dark:border-indigo-800/60 dark:bg-indigo-900/30 
                    dark:text-indigo-300">
      <Sparkles className="h-3 w-3 shrink-0" />
      {text}
    </div>
  )
}
```

---

## 10. Tier System Components

### 10.1 CrownBadge (Existing, Clean)

Already well-designed. Keep as-is.

### 10.2 TierGate (Existing, Needs Refactor)

**Current issue:** The COLOR config is duplicated from AppShell's `TIER_BADGE_STYLE`. Extract tier colors into a single shared config.

**Proposed shared config:**
```ts
// src/utils/tiers.js
export const TIER_CONFIG = {
  free:  { label: 'Free',  ring: null,             dot: null, 
           badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  trial: { label: 'Trial', ring: 'ring-2 ring-indigo-400 dark:ring-indigo-500',
           dot: 'bg-indigo-500',
           badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  pro:   { label: 'Pro',   ring: 'ring-2 ring-amber-400 dark:ring-amber-500',
           dot: 'bg-amber-400',
           badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  max:   { label: 'Max',   ring: 'ring-2 ring-purple-500 dark:ring-purple-400',
           dot: 'bg-purple-500',
           badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
}

export const TIER_COLORS = {
  indigo: { /* ...AuthShell COLOR.indigo */ },
  amber:  { /* ...AuthShell COLOR.amber */ },
  purple: { /* ...AuthShell COLOR.purple */ },
}
```

---

## 11. Motion Components

All in `components/common/motion.jsx` (already clean, keep as-is):

```tsx
// Page entrance wrapper
function Page({ children, className }) {
  return <div className={`animate-in ${className || ''}`}>{children}</div>
}

// Staggered children container
function Stagger({ children, className }) {
  return <div className={`stagger ${className || ''}`}>{children}</div>
}

// Individual staggered item
function StaggerItem({ children, className }) {
  return <div className={className}>{children}</div>
}

// Static number display
function AnimatedNumber({ value, className, format = ... }) {
  return <span className={className}>{format(value ?? 0)}</span>
}
```

---

## 12. Component Consolidation Plan

| Action | Component | Reason |
|---|---|---|
| **Extract** | `ChatBubble` | Duplicated in AICoach + ChatBot |
| **Extract** | `TypingIndicator` | Duplicated in AICoach + ChatBot |
| **Extract** | `ScoreRing` | SVG ring pattern in ReadinessCard |
| **Create** | `Button` with all variants | Replace inline button patterns |
| **Create** | `Card` with all variants | Standardize card padding |
| **Create** | `Input` (standardized) | Replace all `inputClass` strings |
| **Consolidate** | `TIER_CONFIG` | 4 duplicate tier color definitions |
| **Remove** | `UpcomingGrid` | Dead code (UPCOMING_FEATURES is empty) |
| **Remove** | `ComingSoonPage` import | Dead code |
| **Rename** | `.gradient-text` → `.accent-text` | Misnamed |
| **Deprecate** | `Loader` | Replace with skeletons everywhere |

---

## 13. Component File Organization

```
src/components/
├── common/
│   ├── Button.jsx          ← NEW: unified button
│   ├── Card.jsx            ← NEW: unified card
│   ├── Input.jsx           ← NEW: unified input
│   ├── ChatBubble.jsx      ← NEW: extracted from AICoach + ChatBot
│   ├── TypingIndicator.jsx ← NEW: extracted from AICoach + ChatBot
│   ├── ScoreRing.jsx       ← NEW: extracted from ReadinessCard
│   ├── Modal.jsx           ← existing (clean)
│   ├── ConfirmModal.jsx    ← existing (clean)
│   ├── PageHeader.jsx      ← existing (clean)
│   ├── EmptyState.jsx      ← existing (clean)
│   ├── Skeleton.jsx        ← existing (clean)
│   ├── SmartSelect.jsx     ← existing (clean)
│   ├── TierGate.jsx        ← existing (needs tier config refactor)
│   ├── CrownBadge.jsx      ← existing (clean)
│   ├── AIBadge.jsx         ← existing (clean)
│   ├── AIInsight.jsx       ← NEW: extracted from PageHeader insight
│   ├── NotificationBell.jsx← existing (clean)
│   ├── CommandPalette.jsx  ← existing (clean)
│   ├── ErrorBoundary.jsx   ← existing (clean)
│   ├── ProtectedRoute.jsx  ← existing (clean)
│   ├── Logo.jsx            ← existing (clean)
│   ├── InviteCard.jsx      ← existing (clean)
│   ├── ReadinessCard.jsx   ← existing (split ScoreRing out)
│   ├── motion.jsx          ← existing (clean)
│   └── Loader.jsx          ← existing (deprecated)
│
├── layout/
│   ├── AppShell.jsx        ← existing (needs tier config refactor)
│   ├── WorkspaceLayout.jsx ← existing (clean)
│   ├── AuthShell.jsx       ← existing (clean)
│   └── Footer.jsx          ← existing (clean)
│
├── chat/
│   ├── AICoach.jsx         ← existing (use extracted ChatBubble/TypingIndicator)
│   └── ChatBot.jsx         ← existing (use extracted ChatBubble/TypingIndicator)
│
├── experience/
│   ├── LivingSurface.jsx   ← existing (orchestrator)
│   ├── AdaptiveWorkspace.jsx← existing (hook-based, keep)
│   ├── AICoach.jsx         ← moved from chat/ (or keep alias)
│   ├── DailyMissionCard.jsx← existing
│   ├── ExplainableRecCard.jsx← existing
│   ├── GoalProgress.jsx    ← existing
│   ├── ReadinessTrend.jsx  ← existing
│   ├── SmartCard.jsx       ← existing
│   └── WeeklyReview.jsx    ← existing
```

---

## 14. Design System Audit Checklist

For every pull request or new component:

- [ ] Uses existing component (Button, Card, Modal, etc.) instead of inline styles
- [ ] Follows the tier config from `src/utils/tiers.js` instead of redefining colors
- [ ] Uses `.input` class for form fields (no `inputClass` strings)
- [ ] Uses `btn-*` classes for buttons (or `Button` component)
- [ ] Uses `.card` or `Card` component for surfaces
- [ ] Has correct `dark:` variants
- [ ] Has loading/empty/error states per Section 2 of UX_PRINCIPLES
- [ ] Has proper `aria-*` attributes
- [ ] Uses Lucide icons at correct sizes
- [ ] No emoji in UI elements
- [ ] Uses CSS `animate-in` or `stagger` for entrance animations (not Framer Motion for page-level entrances)
- [ ] Framer Motion animations use `useReducedMotion()`
