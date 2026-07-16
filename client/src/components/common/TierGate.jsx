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
import { tierTheme } from '../../utils/tiers';

const DEFAULT_DESCRIPTIONS = {
  pro: 'Unlock Dax for placement preparation.',
  max: 'Unlock everything Dax can do, including Dax Career Coach.',
};

export default function TierGate({ required = 'pro', description, inline = false, children }) {
  const sub = useSubscription();
  // Fail open while context loads (brief flash avoided by subscription fetch on mount)
  if (!sub || sub.hasAccess(required)) return children;

  const { label, colors: c } = tierTheme(required);
  const desc = description || DEFAULT_DESCRIPTIONS[required];

  if (inline) {
    return (
      <Link
        to="/subscribe"
        className={`inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 ${c.inline}`}
      >
        <Crown className="h-3 w-3" /> Upgrade to {label}
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
          <Crown className="h-3 w-3" /> DATAD {label}
        </div>
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          ✨ Unlock with DATAD {label}
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
