import { useMemo } from 'react';

// Pure-CSS falling-binary backdrop for the login page. Each column is a
// tall repeating string of 0/1 animated with a translateY keyframe
// (index.css's `binary-fall`) — no canvas, no per-frame JS, so it costs
// nothing beyond a GPU-composited transform per column.
function randomBits(length) {
  let s = '';
  for (let i = 0; i < length; i++) s += Math.round(Math.random()) + '\n';
  return s;
}

export default function BinaryRainBackground({ columns = 28 }) {
  const cols = useMemo(
    () =>
      Array.from({ length: columns }, (_, i) => ({
        id: i,
        left: `${(i / columns) * 100}%`,
        duration: 9 + Math.random() * 10, // 9–19s per loop
        delay: -Math.random() * 15, // negative delay: already mid-loop on mount
        opacity: 0.15 + Math.random() * 0.25,
        text: randomBits(48),
      })),
    [columns]
  );

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gray-950">
      {cols.map((c) => (
        <pre
          key={c.id}
          aria-hidden
          className="absolute top-0 select-none whitespace-pre font-mono text-[11px] leading-4 text-emerald-400"
          style={{
            left: c.left,
            opacity: c.opacity,
            animation: `binary-fall ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.text}
        </pre>
      ))}
      {/* Darkest directly behind the card (which sits centered), fading out
          to fully show the rain toward the edges of the viewport. */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, rgba(3,7,18,0.88) 0%, rgba(3,7,18,0.5) 40%, rgba(3,7,18,0.1) 75%)' }}
      />
    </div>
  );
}
