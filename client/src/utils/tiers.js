// Shared tier configuration — single source of truth for all tier visuals.
// Used by AppShell, TierGate, CrownBadge, SubscribePage, and any tier badge.

export const TIER_RANK = { free: 0, trial: 1, pro: 2, max: 3 };

// Avatar ring styles — applied to the user avatar circle.
export const TIER_RING = {
  free:  null,
  trial: 'ring-2 ring-indigo-400 dark:ring-indigo-500',
  pro:   'ring-2 ring-amber-400 dark:ring-amber-500',
  max:   'ring-2 ring-purple-500 dark:ring-purple-400',
};

// Status dot styles — small dot indicator.
export const TIER_DOT = {
  free:  null,
  trial: 'bg-indigo-500',
  pro:   'bg-amber-400',
  max:   'bg-purple-500',
};

// Badge/pill styles — used for the tier label in avatar menu and inline badges.
export const TIER_BADGE_STYLE = {
  free:  'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  trial: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  pro:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  max:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// Tier gate / plan card color themes (indigo = trial, amber = pro, purple = max).
// Each theme includes all visual tokens needed for plan cards, gates, and badges.
export const TIER_COLORS = {
  indigo: {
    bg:     'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    icon:   'text-indigo-500',
    badge:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    text:   'text-indigo-600 dark:text-indigo-400',
    btn:    'bg-indigo-600 hover:bg-indigo-700 text-white',
    inline: 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300',
  },
  amber: {
    bg:     'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/60',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    icon:   'text-amber-500',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    text:   'text-amber-600 dark:text-amber-400',
    btn:    'bg-amber-500 hover:bg-amber-600 text-white',
    inline: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
  },
  purple: {
    bg:     'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800/60',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    icon:   'text-purple-500',
    badge:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    text:   'text-purple-600 dark:text-purple-400',
    btn:    'bg-purple-600 hover:bg-purple-700 text-white',
    inline: 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-300',
  },
};

// Map tier IDs to their color theme key.
export const TIER_COLOR_MAP = {
  trial: 'indigo',
  pro: 'amber',
  max: 'purple',
};

// Human-readable tier names.
export const TIER_LABEL = {
  free:  'Free',
  trial: 'Trial',
  pro:   'Pro',
  max:   'Max',
};

// Resolve a tier ID to its label + colour theme in one call.
// Falls back to Pro so an unknown tier degrades to a sensible gate.
export const tierTheme = (tier) => {
  const key = TIER_COLOR_MAP[tier] ? tier : 'pro';
  return { label: TIER_LABEL[key], colors: TIER_COLORS[TIER_COLOR_MAP[key]] };
};
