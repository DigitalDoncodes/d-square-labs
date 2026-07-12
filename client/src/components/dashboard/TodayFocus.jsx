import { Link } from 'react-router-dom';
import { AlertCircle, Target, Flame, Gauge, Zap, ArrowRight } from 'lucide-react';

// Phase 1 — Daily Habit Engine
// Derives the single most important action from pre-loaded dashboard data.
// Rules run in priority order; first match wins.
const RULES = [
  (d) => d.overdue?.length > 0 && {
    icon: AlertCircle,
    message: `${d.overdue.length} overdue task${d.overdue.length === 1 ? '' : 's'} need attention.`,
    sub: d.overdue[0]?.title,
    to: '/me/planner',
    severity: 'red',
  },
  (d) => d.today?.length > 0 && {
    icon: Target,
    message: `${d.today.length} task${d.today.length === 1 ? '' : 's'} due today — stay focused.`,
    sub: d.today[0]?.title,
    to: '/me/planner',
    severity: 'amber',
  },
  (d) => d.streak > 0 && !d.caseSolved && {
    icon: Flame,
    message: `Your ${d.streak}-day streak breaks at midnight. Solve today's case now.`,
    sub: d.caseTitle,
    to: '/',
    severity: 'amber',
  },
  (d) => d.resumePct < 40 && {
    icon: Gauge,
    message: `Resume is only ${d.resumePct}% complete — recruiters see this first.`,
    sub: 'Complete your work experience and skills sections',
    to: '/career/resume',
    severity: 'red',
  },
  (d) => d.readinessScore < 45 && {
    icon: Gauge,
    message: `Placement readiness at ${d.readinessScore}/100 — you need to catch up.`,
    sub: d.nextAction,
    to: '/career/readiness',
    severity: 'amber',
  },
  (d) => !d.caseSolved && d.caseTitle && {
    icon: Target,
    message: "Today's case study is waiting for you.",
    sub: d.caseTitle,
    to: '/',
    severity: 'indigo',
  },
  () => ({
    icon: Zap,
    message: "You're on track. Keep the momentum going.",
    sub: 'Review your placement readiness score',
    to: '/career/readiness',
    severity: 'green',
  }),
];

const S = {
  red:    { wrap: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/60',        icon: 'text-red-500',     label: 'text-red-500',     body: 'text-red-800 dark:text-red-200' },
  amber:  { wrap: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/60', icon: 'text-amber-500',   label: 'text-amber-500',   body: 'text-amber-800 dark:text-amber-200' },
  indigo: { wrap: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/60', icon: 'text-indigo-500', label: 'text-indigo-500', body: 'text-indigo-800 dark:text-indigo-200' },
  green:  { wrap: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/60', icon: 'text-emerald-500', label: 'text-emerald-500', body: 'text-emerald-800 dark:text-emerald-200' },
};

export default function TodayFocus({ data }) {
  if (!data) return null;
  const focus = RULES.reduce((found, rule) => found || rule(data), null);
  if (!focus) return null;

  const Icon = focus.icon;
  const s = S[focus.severity];

  return (
    <Link
      to={focus.to}
      className={`mb-4 flex items-start gap-3 rounded-2xl border p-4 transition-opacity hover:opacity-90 ${s.wrap}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${s.label}`}>Today's focus</p>
        <p className={`mt-0.5 text-sm font-semibold ${s.body}`}>{focus.message}</p>
        {focus.sub && <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{focus.sub}</p>}
      </div>
      <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${s.icon}`} />
    </Link>
  );
}
