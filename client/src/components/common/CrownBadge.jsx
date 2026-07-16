import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { tierTheme } from '../../utils/tiers';

export default function CrownBadge({ required = 'pro', className = '' }) {
  const sub = useSubscription();
  const { label, colors: c } = tierTheme(required);
  const hasAccess = sub?.hasAccess(required) ?? false;

  return (
    <Link
      to="/subscribe"
      title={hasAccess ? `You're on the ${label} plan` : `Upgrade to ${label}`}
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80 ${c.bg} ${c.border} ${c.text} ${className}`}
    >
      <Crown className={`h-2.5 w-2.5 ${c.icon}`} />
      {label}
    </Link>
  );
}
