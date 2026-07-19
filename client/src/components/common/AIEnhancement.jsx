import { Loader2, Sparkles, RefreshCw, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DAX_CAPABILITY, daxAttribution } from '../../utils/dax';
import useEnhancement from '../../hooks/useEnhancement';

const CONFIDENCE_LABEL = { high: 'High confidence', medium: 'Based on your data', low: 'Suggested' };
const CONFIDENCE_COLOR = {
  high: 'text-success-600 dark:text-success-400',
  medium: 'text-primary-600 dark:text-primary-400',
  low: 'text-gray-500 dark:text-gray-400',
};

const VARIANTS = {
  card: 'rounded-2xl border border-primary-200/80 bg-primary-50 p-4 dark:border-primary-800/50 dark:bg-primary-950/30',
  inline: 'text-sm text-primary-700 dark:text-primary-300',
  banner: 'rounded-xl border border-warn-200 bg-warn-50 p-3 dark:border-warn-800/30 dark:bg-warn-950/20',
  minimal: 'text-xs text-gray-500 dark:text-gray-400',
};

export default function AIEnhancement({
  page,
  action,
  data = {},
  options = {},
  variant = 'card',
  children,
  className = '',
  dismissKey,
}) {
  const { insight, loading, error, meta, dismiss, retry } = useEnhancement(page, action, data, options);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${VARIANTS[variant] || VARIANTS.card} ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
        <span className="text-sm text-primary-600 dark:text-primary-400">Dax is thinking…</span>
      </div>
    );
  }

  if (error) {
    if (variant === 'minimal') return null;
    return (
      <div className={`flex items-start gap-2 ${VARIANTS.banner} ${className}`}>
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-warn-800 dark:text-warn-300">{error}</p>
          <button
            onClick={retry}
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-warn-700 hover:text-warn-800 dark:text-warn-400"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  if (typeof children === 'function') {
    return children({ insight, meta, dismiss });
  }

  if (variant === 'minimal') {
    const text = insight.insight || insight.title || (typeof insight === 'string' ? insight : '');
    if (!text) return null;
    return <p className={`${VARIANTS.minimal} ${className}`}>{text}</p>;
  }

  if (variant === 'inline') {
    const text = insight.insight || insight.title || (typeof insight === 'string' ? insight : '');
    if (!text) return null;
    return <p className={`${VARIANTS.inline} ${className}`}>{text}</p>;
  }

  const title = insight.title || insight.insight || (typeof insight === 'string' ? insight : '');
  const why = insight.why || insight.explanation || insight.reasoning || '';
  const actionLink = insight.action || insight.cta || null;
  const confidence = meta?.confidence != null
    ? meta.confidence <= 0.33 ? 'low' : meta.confidence <= 0.66 ? 'medium' : 'high'
    : 'medium';

  return (
    <DaxInsightCard
      title={title}
      why={why}
      action={actionLink}
      confidence={confidence}
      source={meta?.provider ? daxAttribution(meta.provider) : null}
      dismissKey={dismissKey}
      onDismiss={dismiss}
      className={className}
    />
  );
}

function DaxInsightCard({ title, why, action, confidence, source, dismissKey, onDismiss, className }) {
  if (!title) return null;

  return (
    <div className={`rounded-2xl border border-primary-200/80 bg-primary-50 p-4 dark:border-primary-800/50 dark:bg-primary-950/30 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/60">
          <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">{DAX_CAPABILITY.insights}</span>
            {confidence && (
              <span className={`text-[10px] font-medium ${CONFIDENCE_COLOR[confidence]}`}>
                · {CONFIDENCE_LABEL[confidence]}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</p>
          {why && (
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{why}</p>
          )}
          {source && (
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{source}</p>
          )}
          {action && action.to && (
            <a
              href={action.to}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 active:scale-95 transition-transform"
            >
              {action.label || 'Go'}
            </a>
          )}
        </div>
        {dismissKey && (
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-primary-100 hover:text-gray-600 dark:hover:bg-primary-900/40"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
