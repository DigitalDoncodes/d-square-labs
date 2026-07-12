import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CalendarDays, ArrowLeft, PenSquare, ArrowRight } from 'lucide-react';
import { listNotes } from '../../api/notes';
import { listTasks } from '../../api/tasks';
import { formatDate, daysUntil } from '../../utils/dateUtils';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Page } from '../../components/common/motion';

const ACADEMIC_TYPES = ['case-study', 'exam', 'deadline'];

export default function SubjectPage() {
  const [params] = useSearchParams();
  const subject = params.get('subject') || '';
  const [notes, setNotes] = useState(null);
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    if (!subject) return;
    Promise.all([
      listNotes(subject ? { subject } : {}),
      listTasks(),
    ]).then(([n, t]) => {
      setNotes(n.data);
      setTasks(
        t.data.filter(
          (task) =>
            ACADEMIC_TYPES.includes(task.type) &&
            task.subject?.toLowerCase() === subject.toLowerCase() &&
            task.status !== 'done'
        )
      );
    });
  }, [subject]);

  if (!subject) {
    return (
      <Page className="mx-auto max-w-3xl px-4 py-6">
        <EmptyState icon={BookOpen} title="No subject selected" subtitle="Pick a subject from the Study overview." />
      </Page>
    );
  }

  if (!notes) return <div className="mx-auto max-w-5xl px-4 py-6"><CardGridSkeleton count={6} /></div>;

  return (
    <Page className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Link to="/study" className="mb-1 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600">
            <ArrowLeft className="h-3 w-3" /> Study
          </Link>
          <h1 className="text-xl font-bold">{subject}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
            {tasks && tasks.length > 0 ? ` · ${tasks.length} due` : ''}
          </p>
        </div>
        <Link
          to={`/study/notes/new`}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PenSquare className="h-4 w-4" /> New note
        </Link>
      </div>

      {/* Upcoming assignments for this subject */}
      {tasks && tasks.length > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-900/20">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <CalendarDays className="h-4 w-4" /> Due for {subject}
          </p>
          <ul className="space-y-1.5">
            {tasks.map((t) => {
              const days = daysUntil(t.dueDate);
              return (
                <li key={t._id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className={`ml-2 shrink-0 text-xs font-medium ${days < 0 ? 'text-red-500' : days <= 1 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {days < 0 ? 'Overdue · ' : days === 0 ? 'Today · ' : ''}
                    {formatDate(t.dueDate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={`No notes for ${subject} yet`}
          subtitle="Add the first note for this subject."
          action={
            <Link to="/study/notes/new" className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <PenSquare className="h-4 w-4" /> Add note
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note._id}>
              <Link
                to={`/study/notes/${note._id}`}
                className="card-hover flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white px-5 py-4 dark:border-gray-800/80 dark:bg-gray-900"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{note.title}</p>
                  {note.semester && (
                    <p className="text-xs text-gray-400">{note.semester}</p>
                  )}
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2 text-xs text-gray-400">
                  <span>{formatDate(note.createdAt)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
