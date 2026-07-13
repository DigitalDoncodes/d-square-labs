import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Wallet, BookLock, ArrowRight, HeartHandshake,
  Target, Smile, TrendingUp, Award,
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { listTasks } from '../../api/tasks';
import { useAuth } from '../../context/AuthContext';
import { daysUntil, formatDate } from '../../utils/dateUtils';
import { TileSkeleton } from '../../components/common/Skeleton';
import { Page } from '../../components/common/motion';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Personal feature cards (equal size grid)
const FEATURE_CARDS = [
  { to: '/me/journal', icon: BookLock, title: 'Journal', sub: 'Private reflection & mood tracking', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  { to: '/me/planner', icon: CalendarDays, title: 'Planner', sub: 'Tasks, goals and deadlines', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { to: '/me/finance', icon: Wallet, title: 'Finance', sub: 'Budget, calculators & tracker', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { to: '/me/wellbeing', icon: HeartHandshake, title: 'Wellbeing', sub: 'Breathe, meditate, recharge', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40' },
];

// Daily personal metrics — motivational at-a-glance tiles
function PersonalStats({ tasks }) {
  const due = tasks.filter((t) => daysUntil(t.dueDate) <= 1 && daysUntil(t.dueDate) >= 0).length;
  const overdue = tasks.filter((t) => daysUntil(t.dueDate) < 0).length;
  const upcoming = tasks.filter((t) => daysUntil(t.dueDate) > 1 && daysUntil(t.dueDate) <= 7).length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 text-center dark:border-amber-800/40 dark:bg-amber-950/30">
        <p className="text-2xl font-bold text-amber-600">{due}</p>
        <p className="text-[11px] text-amber-600/70 mt-0.5">Due today</p>
      </div>
      <div className={`rounded-2xl border p-4 text-center ${overdue > 0 ? 'border-red-200/60 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30' : 'border-gray-200/60 bg-white dark:border-gray-800 dark:bg-gray-900'}`}>
        <p className={`text-2xl font-bold ${overdue > 0 ? 'text-red-500' : 'text-gray-400'}`}>{overdue}</p>
        <p className={`text-[11px] mt-0.5 ${overdue > 0 ? 'text-red-400' : 'text-gray-400'}`}>Overdue</p>
      </div>
      <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50 p-4 text-center dark:border-indigo-800/40 dark:bg-indigo-950/30">
        <p className="text-2xl font-bold text-indigo-600">{upcoming}</p>
        <p className="text-[11px] text-indigo-500/70 mt-0.5">This week</p>
      </div>
    </div>
  );
}

export default function MeHubPage() {
  useDocumentTitle('Personal');
  const { user } = useAuth();
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    listTasks().then((res) =>
      setTasks(res.data.filter((t) => t.status !== 'done' && daysUntil(t.dueDate) >= -7).slice(0, 6))
    );
  }, []);

  if (!tasks) return <div className="mx-auto max-w-5xl px-4 py-6"><TileSkeleton count={4} /></div>;

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      {/* Personalised greeting */}
      <div className="mb-5">
        <h1 className="text-xl font-bold">{greet()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your private space — planning, money and wellbeing</p>
      </div>

      {/* Stats at a glance */}
      <PersonalStats tasks={tasks} />

      {/* Feature cards — uniform 2×2 grid */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((c) => (
          <Link key={c.to} to={c.to}
            className="card-hover rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800/60 transition-all">
            <div className={`mb-3 w-fit rounded-xl p-2 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="font-semibold text-sm">{c.title}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{c.sub}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming tasks */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-sm">
            <CalendarDays className="h-4 w-4 text-indigo-500" /> Up next
          </h2>
          <Link to="/me/planner" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Open planner <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center py-4">
            <Smile className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Nothing due — plan tomorrow tonight.</p>
            <Link to="/me/planner" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Add a task <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const days = daysUntil(t.dueDate);
              return (
                <li key={t._id} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700 dark:text-gray-300">{t.title}</span>
                  <span className={`ml-2 shrink-0 text-xs ${days < 0 ? 'text-red-500' : days <= 1 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {days < 0 ? 'Overdue · ' : days === 0 ? 'Today · ' : ''}{formatDate(t.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Page>
  );
}
