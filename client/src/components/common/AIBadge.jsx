import { Sparkles } from 'lucide-react';

// Phase 8 — Trust
// Inline badge for AI-generated content. Never hide the AI source.
export default function AIBadge({ provider, confidence, className = '' }) {
  const pct = confidence != null ? Math.round(confidence * 100) : null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-400 ${className}`}>
      <Sparkles className="h-2.5 w-2.5" />
      AI{provider ? ` · ${provider}` : ''}
      {pct != null ? ` · ${pct}% confidence` : ''}
    </span>
  );
}
