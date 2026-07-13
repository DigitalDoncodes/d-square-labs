import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Crown,
  BookLock,
  Info,
  ChevronDown,
  Zap,
  HeartHandshake,
  Settings,
  Gem,
} from 'lucide-react';
import { DatadMark } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';

const TIER_RING = {
  free:  null,
  trial: 'ring-2 ring-indigo-400 dark:ring-indigo-500',
  pro:   'ring-2 ring-amber-400 dark:ring-amber-500',
  max:   'ring-2 ring-purple-500 dark:ring-purple-400',
};

const TIER_DOT = {
  free:  null,
  trial: 'bg-indigo-500',
  pro:   'bg-amber-400',
  max:   'bg-purple-500',
};

const TIER_BADGE_STYLE = {
  free:  'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  trial: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  pro:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  max:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};
import { useLocation } from 'react-router-dom';
import { WORKSPACES, WORKSPACE_TABS } from '../../utils/workspaces';
import CommandPalette from '../common/CommandPalette';
import NotificationBell from '../common/NotificationBell';
import ChatBot from '../chat/ChatBot';
import Footer from './Footer';

const AdminIcon = Crown;

// Linear/Notion-style rail: the selected page is obvious through weight and
// surface, not a loud colored pill; hover is a whisper.
const railLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
    isActive
      ? 'bg-gray-200/60 font-semibold text-gray-900 dark:bg-gray-800/80 dark:text-gray-100'
      : 'font-medium text-gray-500 hover:bg-gray-200/40 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
  }`;

function AvatarMenu() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const onMouse = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const initials = (user?.name || '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const item =
    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TIER_BADGE_STYLE[tier] || TIER_BADGE_STYLE.free}`}>
        {tier}
      </span>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full p-0.5 hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-800"
        aria-label="Account menu"
      >
        <span className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ${TIER_RING[tier] || ''}`}>
          {initials}
        </span>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-gray-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <p className="truncate px-2.5 pt-1 text-xs text-gray-400">{user?.name}</p>
          <div className="mb-1 px-2.5 pb-1">
            <NavLink
              to="/subscribe"
              onClick={() => setOpen(false)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${TIER_BADGE_STYLE[tier] || TIER_BADGE_STYLE.free}`}
            >
              {tier === 'max' ? <Crown className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              DATAD {tier}
            </NavLink>
          </div>
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className={item}>
              <Crown className="h-4 w-4 text-indigo-500" /> Admin hub
            </NavLink>
          )}
          <NavLink to="/me/journal" onClick={() => setOpen(false)} className={item}>
            <BookLock className="h-4 w-4 text-indigo-500" /> Journal
          </NavLink>
          <NavLink to="/me/wellbeing" onClick={() => setOpen(false)} className={item}>
            <HeartHandshake className="h-4 w-4 text-indigo-500" /> Feeling stressed? Reach out
          </NavLink>
          <NavLink to="/support" onClick={() => setOpen(false)} className={item}>
            <Sparkles className="h-4 w-4 text-indigo-500" /> Back DATAD
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className={item}>
            <Info className="h-4 w-4 text-indigo-500" /> About
          </NavLink>
          <button onClick={toggle} className={item}>
            {dark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={item}
          >
            <LogOut className="h-4 w-4 text-gray-400" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsedKey, setCollapsedKey] = useState(null);

  // Global ⌘K / Ctrl+K.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen">
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200/70 bg-white/60 px-3 py-4 backdrop-blur dark:border-gray-800/70 dark:bg-gray-950/60 lg:flex print:hidden">
        <div className="mb-6 px-2 font-semibold">
          <DatadMark />
        </div>
        <button
          onClick={() => setPaletteOpen(true)}
          className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-400 hover:border-indigo-300 hover:text-gray-500 dark:border-gray-800 dark:hover:border-indigo-700"
        >
          <Search className="h-4 w-4" /> Search…
          <kbd className="ml-auto rounded border border-gray-200 px-1.5 py-0.5 text-[10px] dark:border-gray-700">⌘K</kbd>
        </button>
        <nav className="flex flex-col gap-1">
          {WORKSPACES.map((w) => {
            const isActive = w.key === 'me'
              ? location.pathname.startsWith('/me') &&
                !location.pathname.startsWith('/me/finance') &&
                !location.pathname.startsWith('/me/wellbeing')
              : w.end
              ? location.pathname === w.to
              : location.pathname.startsWith(w.to);
            const subTabs = WORKSPACE_TABS[w.key];

            const subLinkClass = ({ isActive: a }) =>
              `rounded-md px-2 py-1.5 text-xs transition-colors ${
                a
                  ? 'bg-gray-200/60 font-semibold text-gray-900 dark:bg-gray-800/80 dark:text-gray-100'
                  : 'text-gray-500 hover:bg-gray-200/40 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100'
              }`;

            const showSub = isActive && subTabs && collapsedKey !== w.key;

            return (
              <div key={w.key}>
                <NavLink
                  to={w.to}
                  end={w.end}
                  onClick={() => {
                    if (isActive && subTabs) {
                      setCollapsedKey(collapsedKey === w.key ? null : w.key);
                    } else {
                      setCollapsedKey(null);
                    }
                  }}
                  className={railLink}
                >
                  <w.icon className="h-[18px] w-[18px]" /> {w.label}
                </NavLink>
                {showSub && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-gray-200/80 pl-3 dark:border-gray-800/80">
                    {subTabs.map((t) => (
                      <NavLink key={t.to} to={t.to} end={t.end} className={subLinkClass}>
                        {t.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {isAdmin && (
            <>
              <div className="mx-2 my-2 border-t border-gray-200/70 dark:border-gray-800/70" />
              <NavLink to="/admin" className={railLink}>
                <AdminIcon className="h-[18px] w-[18px] text-amber-500" />
                <span>Admin</span>
              </NavLink>
            </>
          )}
        </nav>
        <div className="mt-auto space-y-1">
          <NavLink
            to="/subscribe"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-200/40 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
              }`
            }
          >
            <Gem className="h-3.5 w-3.5 shrink-0 text-indigo-500" /> Upgrade plan
          </NavLink>
          <NavLink
            to="/me/wellbeing"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:bg-gray-200/40 hover:text-gray-600 dark:hover:bg-gray-800/50 dark:hover:text-gray-300"
          >
            <HeartHandshake className="h-3.5 w-3.5 shrink-0" /> Feeling stressed? Reach out
          </NavLink>
          <p className="px-2 pt-1 text-[11px] text-gray-400">Your student OS — every day, one place.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="glass sticky top-0 z-40 border-x-0 border-t-0 border-b border-gray-200/70 print:hidden dark:border-gray-800/70">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="font-semibold lg:hidden">
              <DatadMark />
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:ml-auto"
            >
              <Search className="h-5 w-5" />
            </button>
            <NotificationBell />
            <NavLink to="/me/settings" aria-label="Settings" className={({ isActive }) => `rounded-lg p-2 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>
              <Settings className="h-5 w-5" />
            </NavLink>
            <AvatarMenu />
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <Footer />
      </div>

      <ChatBot />

      {/* Mobile bottom tab bar — sits above the iOS home indicator */}
      <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-gray-200/70 pb-[max(env(safe-area-inset-bottom),8px)] dark:border-gray-800/70 lg:hidden print:hidden">
        {WORKSPACES.map((w) => (
          <NavLink
            key={w.key}
            to={w.to}
            end={w.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`rounded-xl p-1.5 transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}>
                  <w.icon className="h-5 w-5" />
                </span>
                {w.label}
              </>
            )}
          </NavLink>
        ))}
        {/* Admin is accessible via sidebar on desktop; excluded from mobile tab bar to keep max 5 items */}
      </nav>
    </div>
  );
}
