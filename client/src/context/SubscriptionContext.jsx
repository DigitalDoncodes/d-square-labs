import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSubscriptionStatus } from '../api/subscription';

const SubscriptionContext = createContext(null);

const TIER_RANK = { free: 0, trial: 1, pro: 2, max: 3 };

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState({ tier: 'free', tierExpiresAt: null, trialUsed: false });
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!user) return;
    setLoading(true);
    getSubscriptionStatus()
      .then((res) => setStatus(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Derive tier from live DB data, falling back to JWT for initial render
  const tier = status?.tier ?? user?.tier ?? 'free';
  const tierExpiresAt = status?.tierExpiresAt ? new Date(status.tierExpiresAt) : null;
  const trialUsed = !!status?.trialUsed;

  const daysLeft = tierExpiresAt
    ? Math.max(0, Math.ceil((tierExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  const hasAccess = (required) =>
    (TIER_RANK[tier] ?? 0) >= (TIER_RANK[required] ?? 1);

  return (
    <SubscriptionContext.Provider value={{ tier, tierExpiresAt, trialUsed, daysLeft, loading, hasAccess, refresh: fetch }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
