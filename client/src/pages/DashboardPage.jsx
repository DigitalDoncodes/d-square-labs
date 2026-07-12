import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  ArrowRight,
  Megaphone,
  Pin,
  Newspaper,
  Sparkles,
  PenSquare,
  Wallet,
  CalendarPlus,
  X,
  CheckCircle2,
} from 'lucide-react';
import { listNotes } from '../api/notes';
import { listTasks } from '../api/tasks';
import { listAnnouncements } from '../api/admin';
import { listArticles, getMarket } from '../api/intelligence';
import { getReadiness } from '../api/readiness';
import { getTodayCase } from '../api/dailyCase';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { formatDate, daysUntil } from '../utils/dateUtils';
import { categoryMeta } from '../utils/intelligence';
import { Skeleton, TileSkeleton } from '../components/common/Skeleton';
import InviteCard from '../components/common/InviteCard';
import ReadinessCard from '../components/common/ReadinessCard';
import DailyCaseCard from '../components/dashboard/DailyCaseCard';
import PlacementCountdown from '../components/career/PlacementCountdown';
import ProgressTiles from '../components/dashboard/ProgressTiles';
import MarketStrip from '../components/intelligence/MarketStrip';
import TodayFocus from '../components/dashboard/TodayFocus';
import ProactiveNudges from '../components/dashboard/ProactiveNudges';
import PremiumPanel from '../components/dashboard/PremiumPanel';
import { Page, Stagger, StaggerItem } from '../components/common/motion';
import { useSubscription } from '../context/SubscriptionContext';
import AIInsight from '../components/common/AIInsight';
import { listDrives } from '../api/placements';

const TIER_BADGE = {
  free:  { label: 'Free',  icon: '○', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  trial: { label: 'Trial', icon: '⚡', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  pro:   { label: 'Pro',   icon: '⚡', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  max:   { label: 'Max',   icon: '★', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const QUICK_ACTIONS = [
  { to: '/study/notes/new', icon: PenSquare, label: 'New note' },
  { to: '/me/planner', icon: CalendarPlus, label: 'Add task' },
  { to: '/me/finance', icon: Wallet, label: 'Log expense' },
];

function SectionCard({ title, icon: Icon, to, linkLabel = 'View all', children }) {
  return (
    <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-indigo-500" /> {title}
        </h2>
        <Link to={to} className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:gap-1.5 hover:underline dark:text-indigo-400">
          {linkLabel} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

const REFLECTION_KEY = 'datad_reflect_';
const today = () => new Date().toISOString().slice(0, 10);

const PROMPTS = [
  "What's one thing you want to accomplish today?",
  'What are you grateful for this morning?',
  "What's the hardest thing on your plate right now?",
  'Who could you help in your batch today?',
  'What would make today feel successful?',
];

function DailyReflectionPrompt() {
  const shown = localStorage.getItem(REFLECTION_KEY + today());
  const [dismissed, setDismissed] = useState(!!shown);
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  if (dismissed) return null;

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{prompt}</p>
        <Link
          to="/me/journal"
          onClick={() => {
            localStorage.setItem(REFLECTION_KEY + today(), '1');
            setDismissed(true);
          }}
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Write in your journal <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <button
        onClick={() => {
          localStorage.setItem(REFLECTION_KEY + today(), '1');
          setDismissed(true);
        }}
        className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

const ONBOARD_KEY = 'datad_onboarded';

const ONBOARD_STEPS = [
  { to: '/career/resume', label: 'Build your resume', desc: 'Powers your readiness score' },
  { to: '/#daily-case', label: 'Solve today\'s case', desc: 'Builds your problem-solving habit' },
  { to: '/study/notes/new', label: 'Add your first note', desc: 'Start your knowledge base' },
];

function OnboardingCard({ onDismiss, data }) {
  const steps = [
    {
      to: '/career/resume',
      label: 'Build your resume',
      desc: 'Powers your readiness score',
      done: (data?.resumePoints ?? 0) > 0,
    },
    {
      to: '/study/notes/new',
      label: 'Add your first note',
      desc: 'Start your knowledge base',
      done: data?.notes?.length > 0,
    },
    {
      to: '/me/planner',
      label: 'Plan a deadline',
      desc: 'Keep your schedule in one place',
      done: (data?.today?.length + data?.upcoming?.length + data?.overdue?.length) > 0,
    },
  ];
  const allDone = steps.every((s) => s.done);

  if (allDone) return null;

  return (
    <div className="mb-4 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-blue-50/60 p-5 dark:border-indigo-800/50 dark:from-indigo-900/20 dark:to-blue-900/10">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Getting started</p>
          <h2 className="font-semibold">Complete your setup</h2>
        </div>
        <button onClick={onDismiss} className="rounded-lg p-1 text-gray-400 hover:bg-gray-200/60 hover:text-gray-600 dark:hover:bg-gray-700/60">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.to}>
            <Link to={step.to} className={`flex items-center gap-3 rounded-xl p-2 ${step.done ? 'opacity-50' : 'hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30'}`}>
              <CheckCircle2 className={`h-5 w-5 shrink-0 ${step.done ? 'text-emerald-500' : 'text-indigo-400'}`} />
              <div>
                <p className={`text-sm font-medium ${step.done ? 'text-gray-400 line-through' : 'text-indigo-700 dark:text-indigo-300'}`}>{step.label}</p>
                {!step.done && <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>}
              </div>
              {!step.done && <ArrowRight className="ml-auto h-4 w-4 text-indigo-400 shrink-0" />}
            </Link>
          </li>
        ))}
      </ul>
      <button onClick={onDismiss} className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        Dismiss
      </button>
    </div>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [data, setData] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARD_KEY));

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARD_KEY, '1');
    setShowOnboarding(false);
  };

  useEffect(() => {
    Promise.allSettled([
      listNotes(), listTasks(), listAnnouncements(), listArticles(), getMarket(), getReadiness(), getTodayCase(), listDrives(),
    ]).then(([notesRes, tasksRes, announcementsRes, articlesRes, marketRes, readinessRes, caseRes, drivesRes]) => {
      const notes = notesRes.status === 'fulfilled' ? notesRes.value.data : [];
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];
      const announcements = announcementsRes.status === 'fulfilled' ? announcementsRes.value.data : [];
      const articles = articlesRes.status === 'fulfilled' ? articlesRes.value.data : [];
      const market = marketRes.status === 'fulfilled' ? (marketRes.value.data.indicators || []) : [];
      const readiness = readinessRes.status === 'fulfilled' ? readinessRes.value.data : null;
      const caseData = caseRes.status === 'fulfilled' ? caseRes.value.data : null;
      const drives = drivesRes.status === 'fulfilled' ? drivesRes.value.data : [];

      const resumeComp = readiness?.components?.find((c) => c.key === 'resume');
      const resumePoints = resumeComp?.points ?? 0;
      const resumePct = resumeComp ? Math.round((resumeComp.points / resumeComp.max) * 100) : 0;

      const open = tasks.filter((t) => t.status !== 'done');
      const upcomingFiltered = open.filter((t) => daysUntil(t.dueDate) > 0 && daysUntil(t.dueDate) <= 14).slice(0, 5);

      setData({
        notes: notes.slice(0, 4),
        today: open.filter((t) => daysUntil(t.dueDate) === 0),
        upcoming: upcomingFiltered,
        overdue: open.filter((t) => daysUntil(t.dueDate) < 0 && daysUntil(t.dueDate) >= -7),
        announcements: announcements.slice(0, 2),
        headlines: articles.slice(0, 4),
        newsOfDay: articles[0] || null,
        market,
        resumePoints,
        resumePct,
        readinessScore: readiness?.score ?? 0,
        nextAction: readiness?.nextAction,
        readinessComponents: readiness?.components,
        streak: caseData?.streak ?? 0,
        caseSolved: caseData?.solved ?? false,
        caseTitle: caseData?.case?.title,
        urgentDrives: drives.filter((d) => {
          const days = d.applicationDeadline ? Math.ceil((new Date(d.applicationDeadline) - Date.now()) / 86400000) : null;
          return days !== null && days > 0 && days <= 30;
        }),
      });
    });
  }, []);

  if (!data) return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <TileSkeleton count={4} />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{dateLabel}</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold">
              {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            {(() => {
              const badge = TIER_BADGE[tier] || TIER_BADGE.free;
              return (
                <Link
                  to="/subscribe"
                  title={`DATAD ${badge.label}`}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-80 ${badge.cls}`}
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </Link>
              );
            })()}
          </div>
        </div>
        <div className="flex gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-800 dark:text-gray-300 dark:hover:border-indigo-700"
            >
              <a.icon className="h-3.5 w-3.5 text-indigo-500" /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {showOnboarding && <OnboardingCard onDismiss={dismissOnboarding} data={data} />}

      <TodayFocus data={data} />
      <ProactiveNudges data={data} />

      {/* Cross-module intelligence: connect placement urgency with study gap */}
      {(() => {
        const topDrive = data.urgentDrives?.[0];
        const noStudy = data.notes?.length === 0;
        const lowReadiness = data.readinessScore < 50;
        if (topDrive && (noStudy || lowReadiness || !data.caseSolved)) {
          const days = Math.ceil((new Date(topDrive.applicationDeadline) - Date.now()) / 86400000);
          const gaps = [
            !data.caseSolved && 'solve today\'s case',
            noStudy && 'build your note library',
            lowReadiness && 'boost your readiness score',
          ].filter(Boolean);
          return (
            <AIInsight
              insight={`${topDrive.company} deadline in ${days} days — ${gaps.length > 0 ? `start by: ${gaps[0]}` : 'keep your prep momentum'}`}
              why={`Recruiters at ${topDrive.company} screen for consistent prep habits. DATAD connects your daily case streak, study notes, and readiness score to predict how competitive your profile is before applications open.`}
              action={{ label: `View ${topDrive.company} drive`, to: '/career/placements' }}
              confidence={days <= 14 ? 'high' : 'medium'}
              source={`${topDrive.company} · ${topDrive.role} · Deadline: ${new Date(topDrive.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              dismissKey={`dashboard-drive-${topDrive._id}-${new Date().toISOString().slice(0,10)}`}
            />
          );
        }
        return null;
      })()}

      <PremiumPanel />

      {/* ── The daily habit loop: briefing → case → readiness ── */}
      {(data.market.length > 0 || data.headlines.length > 0) && (
        <div className="card-hover mb-4 rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Newspaper className="h-4 w-4 text-indigo-500" /> Morning Briefing
            </h2>
            <Link to="/briefing" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:gap-1.5 hover:underline dark:text-indigo-400">
              Full briefing <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.market.length > 0 && <MarketStrip indicators={data.market} />}
          {data.newsOfDay && (
            <Link to="/briefing" className="mt-3 block rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-3">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                <Sparkles className="h-3 w-3" /> Top story
              </p>
              <p className="mt-0.5 text-sm font-semibold">{data.newsOfDay.title}</p>
            </Link>
          )}
          {data.headlines.length > 1 && (
            <ul className="mt-3 space-y-2">
              {data.headlines.slice(1).map((a) => (
                <li key={a._id}>
                  <Link to="/briefing" className="flex items-start gap-2 text-sm hover:text-indigo-600">
                    <span className="shrink-0">{categoryMeta(a.category).emoji}</span>
                    <span className="line-clamp-1">{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <DailyCaseCard />
      <ReadinessCard />
      <PlacementCountdown compact />
      <ProgressTiles resumePct={data.resumePct} streak={data.streak} />

      {data.announcements.length > 0 && (
        <div className="mb-4 space-y-2">
          {data.announcements.map((a) => (
            <Link
              to="/community/announcements"
              key={a._id}
              className={`flex items-start gap-2 rounded-2xl border p-3 text-sm ${
                a.priority === 'important'
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20'
                  : 'border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-900'
              }`}
            >
              <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <div>
                <p className="font-medium">
                  {a.pinned && <Pin className="mr-1 inline h-3 w-3 text-amber-500" />}
                  {a.title}
                </p>
                <p className="line-clamp-2 whitespace-pre-wrap text-gray-600 dark:text-gray-300">{a.body}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Stagger className="grid gap-4 lg:grid-cols-2">
        <StaggerItem>
          <SectionCard title="Today" icon={CalendarDays} to="/me/planner" linkLabel="Planner">
            {data.overdue.length === 0 && data.today.length === 0 && data.upcoming.length === 0 ? (
              <div>
                <p className="text-sm text-gray-400">No deadlines. A clear day.</p>
                <Link to="/me/planner" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  <CalendarPlus className="h-3 w-3" /> Add a task for tomorrow
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {[...data.overdue, ...data.today, ...data.upcoming].slice(0, 6).map((task) => {
                  const days = daysUntil(task.dueDate);
                  return (
                    <li key={task._id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{task.title}</span>
                      <span className={`ml-2 shrink-0 text-xs ${days < 0 ? 'text-red-500' : days <= 1 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {days < 0 ? 'Overdue' : days === 0 ? 'Today' : formatDate(task.dueDate)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard title="Recent notes" icon={BookOpen} to="/study/notes">
            {data.notes.length === 0 ? (
              <div>
                <p className="text-sm text-gray-400">Your notes will appear here.</p>
                <Link to="/study/notes/new" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  <PenSquare className="h-3 w-3" /> Create your first note
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.notes.map((note) => (
                  <li key={note._id}>
                    <Link to={`/study/notes/${note._id}`} className="flex items-center justify-between text-sm hover:text-indigo-600">
                      <span className="truncate">{note.title}</span>
                      <span className="ml-2 shrink-0 text-xs text-gray-400">{note.subject}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </StaggerItem>
      </Stagger>

      <InviteCard />
      <DailyReflectionPrompt />
    </Page>
  );
}
