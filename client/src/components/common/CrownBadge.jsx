import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TIER_RANK = { free: 0, trial: 1, pro: 2, max: 3 };

const CONFIG = {
  pro:  { label: 'Pro',  bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-600 dark:text-amber-400', icon: 'text-amber-500' },
  max:  { label: 'Max',  bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500' },
};

/**
 * Small crown badge next to premium feature labels.
 * Visible to ALL users — clicking always goes to /subscribe.
 * Free/trial users see it as an upgrade prompt.
 * Pro/Max users see their plan status on /subscribe when they click.
 */
export default function CrownBadge({ required = 'pro', className = '' }) {
  const { user } = useAuth();
  const c = CONFIG[required] || CONFIG.pro;
  const currentRank = TIER_RANK[user?.tier || 'free'] ?? 0;
  const requiredRank = TIER_RANK[required] ?? 2;
  const hasAccess = currentRank >= requiredRank;

  return (
    <Link
      to="/subscribe"
      title={hasAccess ? `You're on the ${c.label} plan` : `Upgrade to ${c.label}`}
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80 ${c.bg} ${c.border} ${c.text} ${className}`}
    >
      <Crown className={`h-2.5 w-2.5 ${c.icon}`} />
      {c.label}
    </Link>
  );
}
