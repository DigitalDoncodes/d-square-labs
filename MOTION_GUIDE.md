# DATAD Motion Guide

## Animation Philosophy, Timing & Transitions

---

## 1. Motion Philosophy

**Motion in DATAD serves one purpose: to reduce cognitive load.**

A student opening DATAD is already processing lectures, deadlines, assignments, and life. Animation should never add to that load. Every motion must answer a question the user didn't ask:

- *"Where did that come from?"* → Fade + rise
- *"What just happened?"* → Subtle scale or color shift
- *"Where do I look next?"* → Directional motion
- *"Is it working?"* → Micro-feedback (button press, skeleton shimmer)

If an animation cannot answer one of these questions, remove it.

---

## 2. Motion Tokens

### Timing Curve

The standard easing curve for all DATAD motion:

```css
cubic-bezier(0.16, 1, 0.3, 1)
```

This is an **overshoot-free ease-out** curve. It starts quickly (feeling responsive), settles smoothly (feeling calm). It never overshoots.

| Property | Value |
|---|---|
| Name | `ease-out` |
| Function | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Character | Quick start, smooth end, no bounce |

This is already defined in `tailwind.config.js` as `transitionTimingFunction.out` and in `index.css` for all keyframes. Use it everywhere.

### Duration Scale

| Token | Duration | Usage |
|---|---|---|
| `duration-instant` | 50ms | Button press, hover state toggle |
| `duration-fast` | 100ms | Micro-interactions, color transitions |
| `duration-normal` | 200ms | Button hover, card hover, link color |
| `duration-slow` | 300ms | Panel slide, modal entrance, skeleton shimmer |
| `duration-page` | 400ms | Page transition (fade-up) |
| `duration-emphasis` | 700ms | Progress bar fill, score ring animation |

### Duration Rules

1. **150–250ms** is the standard range for most interactions. Faster feels cheap; slower feels sluggish.
2. **Never exceed 400ms** for a UI transition. Longer feels like waiting.
3. **Page entrances** are the only exception at 200ms per element with stagger.
4. **Progress animations** (score ring, progress bar) can be longer (700ms–1000ms) because they communicate growth, not navigation.

---

## 3. Animation Types

### 3.1 Page Entrance (CSS-driven)

Every page entrance uses the `.animate-in` class:

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.animate-in {
  animation: fade-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

- **Duration:** 200ms
- **Distance:** 6px (subtle — feels like content settling, not flying in)
- **Opacity:** 0 → 1
- **Trigger:** On mount (every page)
- **JS dependency:** None (pure CSS — works even if JS is throttled)

### 3.2 Staggered Children (CSS-driven)

When a page contains multiple elements that should enter in sequence:

```css
.stagger > * {
  animation: fade-up 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Delays: 20ms, 50ms, 80ms, 110ms, 140ms, 170ms */
.stagger > *:nth-child(1) { animation-delay: 0.02s; }
.stagger > *:nth-child(2) { animation-delay: 0.05s; }
.stagger > *:nth-child(3) { animation-delay: 0.08s; }
.stagger > *:nth-child(4) { animation-delay: 0.11s; }
.stagger > *:nth-child(5) { animation-delay: 0.14s; }
.stagger > *:nth-child(6) { animation-delay: 0.17s; }
```

- **Max delay offset:** 170ms (all children visible within 400ms total)
- **Usage:** Card grids, list items, stat tiles
- **JS dependency:** None (CSS-driven via motion.jsx `Stagger` component)

### 3.3 Hover States (Tailwind Transitions)

```css
/* Card hover — subtle shadow/border change */
.card-hover {
  @apply transition-shadow duration-150 ease-out;
}
.card-hover:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04),
              0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Button hover — color fill */
.btn-primary {
  @apply transition-colors duration-150;
}

/* Link hover — color shift */
a {
  @apply transition-colors duration-150;
}
```

- **Duration:** 150ms
- **Properties:** `color`, `background-color`, `border-color`, `box-shadow`, `opacity`
- **Never animate:** `width`, `height`, `margin`, `padding` on hover (causes layout shift)
- **Never use:** `transform: scale()` on hover except on the LandingPage

### 3.4 Button Press (50ms)

Buttons provide tactile feedback on press:

```css
button:active {
  transform: scale(0.97); /* Subtle — only on primary buttons */
}
```

- **Duration:** 50ms (instant — not a transition, just a frame)
- **Only on primary/action buttons**, not on ghost or secondary buttons
- The `active:scale-95` Tailwind utility can be used for this

### 3.5 Skeleton Shimmer (CSS-driven)

```css
.skeleton::after {
  content: '';
  @apply absolute inset-0;
  background: linear-gradient(90deg, transparent,
    rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.4s ease-out infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  to { transform: translateX(100%); }
}
```

- **Duration:** 1.4s per cycle (slow enough not to trigger migraines)
- **Intensity:** Soft — matches the card surface
- **Dark mode:** Reduces shimmer opacity (rgba(255,255,255,0.05))

### 3.6 Chat Typing Indicator

```css
@keyframes pulse-ring {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse-indigo {
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

- **Duration:** 2s (leisurely — typing is not urgent)
- **Applied to:** Live/active indicator dots in chat

---

## 4. Framer Motion Usage

### When to use Framer Motion

Framer Motion is reserved for animations that CSS cannot handle:

| Use Case | Why CSS Can't | Example |
|---|---|---|
| Drag gestures | CSS has no drag | Kanban board, swipe-to-delete |
| Physics-based springs | CSS has no spring curve | Landing page feature cards |
| Layout animations | `layout` prop auto-animates | List reordering, filter transitions |
| Shared element transitions | `layoutId` prop | Expanding cards to full page |
| Scroll-triggered animations | `whileInView` | Landing page sections |

### When NOT to use Framer Motion

| Use Case | Better Approach | Reason |
|---|---|---|
| Page entrance | CSS `.animate-in` | Works when tab is backgrounded |
| Hover effects | Tailwind `transition-colors` | Simpler, no JS |
| Stagger children | CSS `.stagger` | Simpler, no JS |
| Skeleton shimmer | CSS `@keyframes` | No JS dependency |

### Framer Motion Configuration

```tsx
import { motion } from 'framer-motion'

// Standard ease-out (matches CSS)
const easeOut = [0.16, 1, 0.3, 1]

// Page-level entrance (only if CSS-driven approach can't work)
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25, ease: easeOut }}
>
```

### Reduced Motion

Framer Motion does not automatically respect `prefers-reduced-motion`. All Framer Motion animations must use:

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedElement() {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div>{children}</div> // No animation
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}
```

**Current issue:** The `LandingPage` uses `motion.button` with `whileHover={{ y: -6, scale: 1.02 }}` without `useReducedMotion`. This must be fixed.

---

## 5. Micro-Interactions Catalog

| Interaction | Trigger | Animation | Duration | Curve |
|---|---|---|---|---|
| Button hover | `:hover` | Background color shift | 150ms | `ease-out` |
| Button press | `:active` | Scale 0.97 | 50ms | Instant |
| Card hover | `:hover` | Box-shadow appear | 150ms | `ease-out` |
| Link hover | `:hover` | Color shift | 150ms | `ease-out` |
| Page enter | Mount | Fade + rise 6px | 200ms | `ease-out` |
| Staggered children | Mount | Fade + rise, delayed | 220ms each | `ease-out` |
| Modal open | State change | Fade-in backdrop + content | 200ms | `ease-out` |
| Modal close | State change | Instant removal | 0ms | — |
| Dropdown open | Click | Fade-in | 150ms | `ease-out` |
| Skeleton shimmer | Mount | Translate shimmer line | 1.4s loop | Linear |
| Progress bar fill | Data load | Width transition | 700ms | `ease-out` |
| Score ring | Data load | Stroke-dashoffset | 1000ms | `ease-out` |
| Toast appear | Action | Slide down + fade | 200ms | `ease-out` |
| Tooltip appear | Hover | Fade-in | 100ms | `ease-out` |

---

## 6. Accessibility & Motion

### 6.1 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is already in `index.css`. It covers:
- All CSS animations (shimmer, fade-up, stagger)
- All Tailwind transitions
- All Framer Motion animations (when set to respect the OS preference)

### 6.2 What Still Animates with Reduced Motion

- Progress bars (they communicate completion — use `transition: none` with instant width change)
- Skeleton shimmer (replaced with static gray placeholder by removing `::after`)
- Button active state (50ms is below the threshold for triggering vestibular issues)

---

## 7. Performance Guidelines

1. **Prefer `transform` and `opacity`.** These are composited by the GPU. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
2. **Use `will-change` sparingly.** Only on elements that animate continuously (skeleton shimmer).
3. **Avoid JS-driven animations for visible content.** CSS animations run on the compositor thread. JS animations run on the main thread.
4. **The `AnimatedNumber` component is already correct.** It renders statically because JS counter animations caused paint conflicts. Don't re-introduce JS animation.
5. **Keep animation counts low.** No more than 6 elements animating simultaneously on one page.
