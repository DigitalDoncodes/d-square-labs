import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CARD_PALETTE = {
  indigo: {
    wrap: 'border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-gray-900',
    icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
    label: 'text-indigo-600 dark:text-indigo-400',
    body: 'text-gray-800 dark:text-gray-100',
    sub: 'text-gray-500 dark:text-gray-400',
  },
  emerald: {
    wrap: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-gray-900',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
    label: 'text-emerald-600 dark:text-emerald-400',
    body: 'text-gray-800 dark:text-gray-100',
    sub: 'text-gray-500 dark:text-gray-400',
  },
  amber: {
    wrap: 'border-amber-200/60 bg-gradient-to-br from-amber-50 to-white dark:border-amber-800/40 dark:from-amber-950/30 dark:to-gray-900',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
    label: 'text-amber-600 dark:text-amber-400',
    body: 'text-gray-800 dark:text-gray-100',
    sub: 'text-gray-500 dark:text-gray-400',
  },
  purple: {
    wrap: 'border-purple-200/60 bg-gradient-to-br from-purple-50 to-white dark:border-purple-800/40 dark:from-purple-950/30 dark:to-gray-900',
    icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    label: 'text-purple-600 dark:text-purple-400',
    body: 'text-gray-800 dark:text-gray-100',
    sub: 'text-gray-500 dark:text-gray-400',
  },
};

export default function SmartCard({
  icon: Icon,
  label,
  title,
  description,
  to,
  palette = 'indigo',
  badge,
}) {
  const p = CARD_PALETTE[palette] || CARD_PALETTE.indigo;
  const content = (
    <div className={`group relative rounded-2xl border p-4 transition-all hover:shadow-sm ${p.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.icon}`}>
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            {label && (
              <p className={`text-[10px] font-bold uppercase tracking-widest ${p.label}`}>{label}</p>
            )}
            <p className={`text-sm font-semibold ${p.body}`}>{title}</p>
            {description && (
              <p className={`mt-0.5 text-xs leading-relaxed ${p.sub}`}>{description}</p>
            )}
          </div>
        </div>
        <ArrowRight className={`mt-2 h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 ${p.sub}`} />
      </div>
      {badge && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800/70 dark:text-gray-400">
          <Sparkles className="h-2.5 w-2.5" />
          {badge}
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
}
