import { useEffect, useState } from 'react';

const RING_COLOR = (score) => {
  if (score >= 75) return 'stroke-emerald-500';
  if (score >= 45) return 'stroke-amber-500';
  return 'stroke-indigo-500';
};

/**
 * Circular score ring — a single SVG ring with animated fill.
 *
 * Props:
 *   score      number  0–100  — the value to display
 *   size       number        — diameter in Tailwind h/w units (default 28 = 112px)
 *   showLabel  boolean       — show "/100" below the number (default true)
 *   className  string        — additional wrapper classes
 */
export default function ScoreRing({ score, size = 28, showLabel = true, className = '' }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const t = requestAnimationFrame(() =>
      setOffset(C - (Math.min(score ?? 0, 100) / 100) * C)
    );
    return () => cancelAnimationFrame(t);
  }, [score, C]);

  // Map size to Tailwind h/w (h-28 = 112px, h-24 = 96px, etc.)
  const sizeCls = `h-${Math.min(size, 28)} w-${Math.min(size, 28)}`;

  return (
    <div className={`relative shrink-0 ${sizeCls} ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50" cy="50" r={R}
          fill="none" strokeWidth="9"
          className="stroke-gray-100 dark:stroke-gray-800"
        />
        <circle
          cx="50" cy="50" r={R}
          fill="none" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          className={`${RING_COLOR(score)} transition-[stroke-dashoffset] duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{score ?? 0}</span>
        {showLabel && <span className="text-[10px] text-gray-400">/ 100</span>}
      </div>
    </div>
  );
}
