import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, CalendarDays, ArrowRight, PenSquare } from 'lucide-react';
import { listNotes } from '../../api/notes';
import { listTasks } from '../../api/tasks';
import { daysUntil, formatDate } from '../../utils/dateUtils';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import UpcomingGrid from '../../components/common/UpcomingGrid';
import { Page } from '../../components/common/motion';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ACADEMIC_TYPES = ['case-study', 'exam', 'deadline'];

export default function StudyHubPage() {
  useDocumentTitle('Study');
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.allSettled([listNotes(), listTasks()]).then(([notesRes, tasksRes]) => {
      const notes = notesRes.status === 'fulfilled' ? notesRes.value.data : [];
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];
      const subjects = {};
      notes.forEach((n) => {
        const key = n.subject || 'General';
        subjects[key] = (subjects[key] || 0) + 1;
      });
      setData({
        subjects: Object.entries(subjects).sort((a, b) => b[1] - a[1]),
        notes: notes.slice(0, 5),
        assignments: tasks
          .filter((t) => ACADEMIC_TYPES.includes(t.type) && t.status !== 'done' && daysUntil(t.dueDate) >= -7)
          .slice(0, 5),
      });
    });
  }, []);

  if (!data) return <div className="mx-auto max-w-5xl px-4 py-6"><CardGridSkeleton count={4} /></div>;

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Study</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Notes, subjects and assignments in one place</p>
        </div>
        <Link
          to="/study/notes/new"
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PenSquare className="h-4 w-4" /> New note
        </Link>
      </div>

      {data.subjects.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Subjects</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.subjects.map(([subject, count]) => (
              <Link
                key={subject}
                to={`/study/notes?subject=${encodeURIComponent(subject)}`}
                className="card-hover rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900"
              >
                <GraduationCap className="mb-2 h-5 w-5 text-indigo-500" />
                <p className="truncate text-sm font-semibold">{subject}</p>
                <p className="text-xs text-gray-400">{count} note{count === 1 ? '' : 's'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-indigo-500" /> Recent notes</h2>
            <Link to="/study/notes" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.notes.length === 0 ? (
            <p className="text-sm text-gray-400">No notes yet — share the first one!</p>
          ) : (
            <ul className="space-y-2">
              {data.notes.map((n) => (
                <li key={n._id}>
                  <Link to={`/study/notes/${n._id}`} className="flex items-center justify-between text-sm hover:text-indigo-600">
                    <span className="truncate">{n.title}</span>
                    <span className="ml-2 shrink-0 text-xs text-gray-400">{n.subject}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-indigo-500" /> Assignments due</h2>
            <Link to="/study/assignments" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.assignments.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing due — enjoy the break!</p>
          ) : (
            <ul className="space-y-2">
              {data.assignments.map((t) => {
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
      </div>

      <UpcomingGrid workspace="study" />
    </Page>
  );
}
