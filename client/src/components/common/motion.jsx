// Entrance animations are CSS-driven (see index.css) so content always settles
// visible even if the tab is backgrounded / the JS animation loop is throttled.

// Page-level entrance wrapper.
export function Page({ children, className }) {
  return <div className={`animate-in ${className || ''}`}>{children}</div>;
}

// Container whose direct children fade+rise in sequence (CSS nth-child delays).
export function Stagger({ children, className }) {
  return <div className={`stagger ${className || ''}`}>{children}</div>;
}

// Item inside a <Stagger>. Just a wrapper div — the parent's CSS drives it.
export function StaggerItem({ children, className }) {
  return <div className={className}>{children}</div>;
}

// Stat number. Rendered statically (no per-frame JS animation) — a count-up
// forced constant repaints that conflicted with CSS transforms and left paint
// artifacts. The tile still enters via the CSS stagger.
export function AnimatedNumber({ value, className, format = (n) => n.toLocaleString('en-IN') }) {
  return <span className={className}>{format(value ?? 0)}</span>;
}
