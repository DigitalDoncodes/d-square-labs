import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Wallet, Settings, BookLock, ArrowRight } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { listTasks } from '../../api/tasks';
import { useAuth } from '../../context/AuthContext';
import { daysUntil, formatDate } from '../../utils/dateUtils';
import { TileSkeleton } from '../../components/common/Skeleton';
import { Page } from '../../components/common/motion';

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

  const cards = [
    { to: '/me/journal', icon: BookLock, title: 'Journal', sub: 'Private daily reflection and mood tracking' },
    { to: '/me/finance', icon: Wallet, title: 'Finance', sub: 'Expenses, budgets and calculators' },
    { to: '/me/settings', icon: Settings, title: 'Settings', sub: 'Profile, password and preferences' },
  ];

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Me</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your private space — planning, money and preferences</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-indigo-500" /> Up next</h2>
            <Link to="/me/planner" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Open planner <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing scheduled — plan tomorrow tonight.</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => {
                const days = daysUntil(t.dueDate);
                return (
                  <li key={t._id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className={`ml-2 shrink-0 text-xs ${days < 0 ? 'text-red-500' : days <= 1 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {formatDate(t.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="card-hover block rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
              <c.icon className="mb-2 h-5 w-5 text-indigo-500" />
              <p className="font-semibold">{c.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{c.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </Page>
  );
}
