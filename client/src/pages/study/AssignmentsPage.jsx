import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { listTasks } from '../../api/tasks';
import { daysUntil, formatDate } from '../../utils/dateUtils';
import { FeedSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Page } from '../../components/common/motion';

const ACADEMIC_TYPES = ['case-study', 'exam', 'deadline'];
const TYPE_LABEL = { 'case-study': 'Case study', exam: 'Exam', deadline: 'Deadline' };

// Academic view over the shared Task model — editing stays in Me → Planner.
export default function AssignmentsPage() {
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    listTasks().then((res) =>
      setTasks(
        res.data
          .filter((t) => ACADEMIC_TYPES.includes(t.type))
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      )
    );
  }, []);

  if (!tasks) return <div className="mx-auto max-w-3xl px-4 py-6"><FeedSkeleton count={5} /></div>;

  const open = tasks.filter((t) => t.status !== 'done');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Case studies, exams and deadlines for the batch</p>
        </div>
        <Link to="/me/planner" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Manage in Planner <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {open.length === 0 && done.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No assignments yet" subtitle="Add case studies and exams from the Planner." />
      ) : (
        <>
          <ul className="space-y-2">
            {open.map((t) => {
              const days = daysUntil(t.dueDate);
              return (
                <li
                  key={t._id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 text-sm dark:border-gray-800/80 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className="text-xs text-gray-400">
                      {TYPE_LABEL[t.type]}
                      {t.subject ? ` · ${t.subject}` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${days < 0 ? 'text-red-500' : days <= 1 ? 'text-amber-500' : 'text-gray-400'}`}>
                    {days < 0 ? 'Overdue · ' : days === 0 ? 'Today · ' : days === 1 ? 'Tomorrow · ' : ''}
                    {formatDate(t.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
          {done.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[11px] font-medium uppercase tracking-wide text-gray-400">Completed</p>
              <ul className="space-y-2 opacity-60">
                {done.map((t) => (
                  <li key={t._id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 text-sm line-through dark:border-gray-800/80 dark:bg-gray-900">
                    <span className="truncate">{t.title}</span>
                    <span className="shrink-0 text-xs text-gray-400">{formatDate(t.dueDate)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Page>
  );
}
