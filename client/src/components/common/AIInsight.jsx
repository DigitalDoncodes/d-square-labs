// AI Insight banner — used on module pages to surface intelligence.
// Principle: the AI should explain WHY, not just WHAT.
// Shows confidence level and source so users trust the recommendation.
import { useState } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONFIDENCE_LABEL = { high: 'High confidence', medium: 'Based on your data', low: 'Suggested' };
const CONFIDENCE_COLOR = {
  high:   'text-emerald-600 dark:text-emerald-400',
  medium: 'text-indigo-600 dark:text-indigo-400',
  low:    'text-gray-500 dark:text-gray-400',
};

export default function AIInsight({
  insight,          // string — the headline insight
  why,              // string — why this matters (the "because" explanation)
  action,           // { label, to } — CTA link
  confidence = 'medium',  // 'high' | 'medium' | 'low'
  source,           // string — e.g. "Based on your readiness score"
  dismissKey,       // string — localStorage key; omit to make non-dismissible
  className = '',
}) {
  const [dismissed, setDismissed] = useState(() =>
    dismissKey ? !!localStorage.getItem(`datad_insight_${dismissKey}`) : false
  );
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  const dismiss = () => {
    if (dismissKey) localStorage.setItem(`datad_insight_${dismissKey}`, '1');
    setDismissed(true);
  };

  return (
    <div className={`mb-5 rounded-2xl border border-indigo-200/80 bg-indigo-50 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/30 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/60">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">AI Insight</p>
            <span className={`text-[10px] font-medium ${CONFIDENCE_COLOR[confidence]}`}>
              · {CONFIDENCE_LABEL[confidence]}
            </span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">{insight}</p>
          {why && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Less' : 'Why?'}
            </button>
          )}
          {expanded && why && (
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{why}</p>
          )}
          {source && !expanded && (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{source}</p>
          )}
          {action && (
            <Link
              to={action.to}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-transform"
            >
              {action.label}
            </Link>
          )}
        </div>
        {dismissKey && (
          <button
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-indigo-100 hover:text-gray-600 dark:hover:bg-indigo-900/40"
            aria-label="Dismiss insight"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
