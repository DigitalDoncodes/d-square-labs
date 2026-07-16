import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { TIER_COLORS, TIER_COLOR_MAP } from '../../utils/tiers';

const TIER_LABEL = {
  pro: { label: 'Pro', colorKey: 'amber' },
  max: { label: 'Max', colorKey: 'purple' },
};

export default function CrownBadge({ required = 'pro', className = '' }) {
  const sub = useSubscription();
  const meta = TIER_LABEL[required] || TIER_LABEL.pro;
  const c = TIER_COLORS[meta.colorKey];
  const hasAccess = sub?.hasAccess(required) ?? false;

  return (
    <Link
      to="/subscribe"
      title={hasAccess ? `You're on the ${meta.label} plan` : `Upgrade to ${meta.label}`}
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80 ${c.bg} ${c.border} ${c.text} ${className}`}
    >
      <Crown className={`h-2.5 w-2.5 ${c.icon}`} />
      {meta.label}
    </Link>
  );
}
