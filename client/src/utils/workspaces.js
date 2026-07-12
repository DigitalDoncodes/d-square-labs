import { LayoutDashboard, BookOpen, Briefcase, Users, CircleUser } from 'lucide-react';

// The five primary workspaces — the only sidebar destinations.
export const WORKSPACES = [
  { key: 'dashboard', label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { key: 'study', label: 'Study', to: '/study', icon: BookOpen },
  { key: 'career', label: 'Career', to: '/career', icon: Briefcase },
  { key: 'community', label: 'Community', to: '/community', icon: Users },
  { key: 'me', label: 'Me', to: '/me', icon: CircleUser },
];

// Secondary tab rows inside each workspace.
export const WORKSPACE_TABS = {
  study: [
    { to: '/study', label: 'Overview', end: true },
    { to: '/study/notes', label: 'Notes' },
    { to: '/study/assignments', label: 'Assignments' },
    { to: '/study/resources', label: 'Resources' },
    { to: '/study/projects', label: 'Projects' },
    { to: '/study/ai-tools', label: 'AI Tools' },
    { to: '/study/study-tools', label: 'Study Tools' },
  ],
  career: [
    { to: '/career', label: 'Overview', end: true },
    { to: '/career/resume', label: 'Resume' },
    { to: '/career/companies', label: 'Companies' },
    { to: '/career/questions', label: 'Questions' },
    { to: '/career/readiness', label: 'Readiness' },
    { to: '/career/placements', label: 'Placements' },
    { to: '/career/internships', label: 'Internships' },
    { to: '/career/skills', label: 'Skills' },
  ],
  community: [
    { to: '/community', label: 'Overview', end: true },
    { to: '/community/discussions', label: 'Discussions' },
    { to: '/community/feed', label: 'Feed' },
    { to: '/community/announcements', label: 'Announcements' },
    { to: '/community/directory', label: 'Directory' },
    { to: '/community/events', label: 'Events' },
    { to: '/community/marketplace', label: 'Marketplace' },
    { to: '/community/gallery', label: 'Gallery' },
    { to: '/community/archive', label: 'Archive' },
  ],
  me: [
    { to: '/me', label: 'Overview', end: true },
    { to: '/me/journal', label: 'Journal' },
    { to: '/me/planner', label: 'Planner' },
    { to: '/me/finance', label: 'Finance' },
    { to: '/me/settings', label: 'Settings' },
  ],
};

// Where each upcoming (coming-soon) module lives once it ships.
// All 11 modules have shipped — this map is now empty but kept for future modules.
export const UPCOMING_WORKSPACE = {};

export const upcomingPath = (slug) => `/${UPCOMING_WORKSPACE[slug] || 'me'}/soon/${slug}`;

// Legacy route → new route, so old bookmarks and in-app links keep working.
export const LEGACY_REDIRECTS = {
  '/notes': '/study/notes',
  '/planner': '/me/planner',
  '/finance': '/me/finance',
  '/resume': '/career/resume',
  '/companies': '/career/companies',
  '/albums': '/community/gallery',
  '/entertainment': '/community/archive',
};
