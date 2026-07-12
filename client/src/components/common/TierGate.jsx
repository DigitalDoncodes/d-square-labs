/**
 * RBAC tier gate — wraps premium features.
 * Shows children when the user meets the tier requirement; otherwise shows a
 * lock panel explaining WHY the feature is premium.
 *
 * Props:
 *   required     'pro' | 'max'
 *   description  string — one sentence explaining the value (shown in locked state)
 *   inline       boolean — compact inline badge instead of full block panel
 */
import { Link } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

const TIER_LABEL = {
  pro: { label: 'Pro', color: 'amber' },
  max: { label: 'Max', color: 'purple' },
};

const COLORS = {
  amber: {
    bg:     'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/60',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    icon:   'text-amber-500',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    btn:    'bg-amber-500 hover:bg-amber-600 text-white',
    inline: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  },
  purple: {
    bg:     'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800/60',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    icon:   'text-purple-500',
    badge:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    btn:    'bg-purple-600 hover:bg-purple-700 text-white',
    inline: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
  },
};

const DEFAULT_DESCRIPTIONS = {
  pro: 'Unlock AI-powered tools for placement preparation.',
  max: 'Access the full AI career advisor suite.',
};

export default function TierGate({ required = 'pro', description, inline = false, children }) {
  const sub = useSubscription();
  // Fail open while context loads (brief flash avoided by subscription fetch on mount)
  if (!sub || sub.hasAccess(required)) return children;

  const meta = TIER_LABEL[required] || TIER_LABEL.pro;
  const c = COLORS[meta.color];
  const desc = description || DEFAULT_DESCRIPTIONS[required];

  if (inline) {
    return (
      <Link
        to="/subscribe"
        className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 ${c.inline}`}
      >
        <Crown className="h-3 w-3" /> Upgrade to {meta.label}
      </Link>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center ${c.bg} ${c.border}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${c.iconBg}`}>
        <Lock className={`h-5 w-5 ${c.icon}`} />
      </div>
      <div className="max-w-xs">
        <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${c.badge}`}>
          <Crown className="h-3 w-3" /> DATAD {meta.label}
        </div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          ✨ Unlock with DATAD {meta.label}
        </p>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <Link
        to="/subscribe"
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${c.btn}`}
      >
        View Plans
      </Link>
    </div>
  );
}
