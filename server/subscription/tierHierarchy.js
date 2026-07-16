const TIERS = ['free', 'trial', 'pro', 'max'];

const TIER_RANK = Object.fromEntries(TIERS.map((t, i) => [t, i]));

function getRank(tier) {
  return TIER_RANK[tier] ?? 0;
}

function isAtLeast(userTier, minimumTier) {
  return getRank(userTier) >= getRank(minimumTier);
}

function getMinimumTierForRank(rank) {
  return TIERS[rank] || 'free';
}

module.exports = { TIERS, TIER_RANK, getRank, isAtLeast, getMinimumTierForRank };
