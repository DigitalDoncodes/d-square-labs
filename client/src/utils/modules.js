const MODULES = {
  mba: {
    slug: 'mba',
    name: 'MBA',
    fullName: 'Master of Business Administration',
    icon: 'graduation-cap',
    color: 'emerald',
    description: 'Business school platform',
  },
  engineering: {
    slug: 'engineering',
    name: 'Engineering',
    fullName: 'Bachelor of Engineering / B.Tech',
    icon: 'cpu',
    color: 'blue',
    description: 'Engineering & technology',
    comingSoon: true,
  },
  law: {
    slug: 'law',
    name: 'Law',
    fullName: 'Bachelor of Laws / LL.B',
    icon: 'scale',
    color: 'purple',
    description: 'Legal education',
    comingSoon: true,
  },
  medical: {
    slug: 'medical',
    name: 'Medical',
    fullName: 'Bachelor of Medicine / MBBS',
    icon: 'heart-pulse',
    color: 'rose',
    description: 'Medical education',
    comingSoon: true,
  },
  psychology: {
    slug: 'psychology',
    name: 'Psychology',
    fullName: 'Bachelor of Psychology',
    icon: 'brain',
    color: 'amber',
    description: 'Psychology & behavioural sciences',
    comingSoon: true,
  },
  commerce: {
    slug: 'commerce',
    name: 'Commerce',
    fullName: 'Bachelor of Commerce / B.Com',
    icon: 'banknote',
    color: 'cyan',
    description: 'Commerce & accounting',
    comingSoon: true,
  },
};

export function getModule(slug) {
  return MODULES[slug] || null;
}

export function getAllModules() {
  return Object.values(MODULES);
}

export function getAvailableModules(userPrograms) {
  return Object.values(MODULES).map((m) => ({
    ...m,
    enrolled: userPrograms?.includes(m.slug) || false,
  }));
}

export default MODULES;
