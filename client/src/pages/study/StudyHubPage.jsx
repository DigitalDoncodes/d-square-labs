import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, PenSquare, Sparkles } from 'lucide-react';
import DailyCaseCard from '../../components/dashboard/DailyCaseCard';
import { listNotes } from '../../api/notes';
import { listTasks } from '../../api/tasks';
import { daysUntil } from '../../utils/dateUtils';
import { Skeleton } from '../../components/common/Skeleton';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Page } from '../../components/common/motion';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const ACADEMIC_TYPES = ['case-study', 'exam', 'deadline'];

const PROMPTS = [
  'One page today is better than ten pages someday.',
  'You don\'t have to do everything today. Just the next right thing.',
  'Progress is quiet. Keep going.',
  'Showing up today is enough. The rest follows.',
  'Small steps, taken daily, become the person you\'re becoming.',
  'You\'ve handled every hard day so far. Today is no different.',
];

function deriveInsight({ subjects, notes, assignments, nextAssignment, notesCount, subjectCount }) {
  const sorted = [...subjects].sort((a, b) => b[1] - a[1]);

  if (sorted.length > 0) {
    const [topSubject, topCount] = sorted[0];
    if (topCount >= 2 && notesCount > 1) {
      const pct = Math.round((topCount / notesCount) * 100);
      if (nextAssignment) {
        const days = daysUntil(nextAssignment.dueDate);
        const timeStr = days === 0 ? 'due today' : days === 1 ? 'due tomorrow' : `${days} days away`;
        return {
          insight: `Your ${topSubject} notes make up ${pct}% of everything you've written. Next up: "${nextAssignment.title}" (${timeStr}).`,
          action: { label: 'View assignments', to: '/study/assignments' },
        };
      }
      return {
        insight: `Your ${topSubject} notes make up ${pct}% of everything you've written. You're building real depth there.`,
        action: { label: 'Browse notes', to: '/study/notes' },
      };
    }
  }

  if (nextAssignment) {
    const days = daysUntil(nextAssignment.dueDate);
    const timeStr = days === 0 ? "It's due today." : days === 1 ? "It's due tomorrow." : `${days} days to prepare.`;
    return {
      insight: `Your next milestone is "${nextAssignment.title}". ${timeStr}`,
      action: { label: 'View assignments', to: '/study/assignments' },
    };
  }

  if (notesCount > 0) {
    return {
      insight: `You have ${notesCount} note${notesCount > 1 ? 's' : ''} across ${subjectCount} subject${subjectCount > 1 ? 's' : ''}. Consistent work adds up.`,
      action: { label: 'Browse notes', to: '/study/notes' },
    };
  }

  return null;
}

function timeAgo(date) {
  if (!date) return '';
  const d = daysUntil(date);
  if (d === 0) return 'Today';
  if (d === -1) return 'Yesterday';
  return `${Math.abs(d)} days ago`;
}

function formatDateShort(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function StudyHubPage() {
  useDocumentTitle('Study');
  const { hash } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hash === '#daily-case' && data) {
      requestAnimationFrame(() => {
        document.getElementById('daily-case')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [hash, data]);

  useEffect(() => {
    Promise.allSettled([listNotes(), listTasks()]).then(([notesRes, tasksRes]) => {
      const notes = notesRes.status === 'fulfilled' ? notesRes.value.data : [];
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];

      const subjects = {};
      notes.forEach((n) => {
        const key = n.subject || 'General';
        subjects[key] = (subjects[key] || 0) + 1;
      });
      const sortedSubjects = Object.entries(subjects).sort((a, b) => b[1] - a[1]);

      const sortedNotes = [...notes].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );

      const academicTasks = tasks.filter((t) => ACADEMIC_TYPES.includes(t.type));
      const upcomingTasks = academicTasks
        .filter((t) => t.status !== 'done' && daysUntil(t.dueDate) >= -7)
        .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

      setData({
        recentNote: sortedNotes[0] || null,
        notes: sortedNotes.slice(0, 4),
        assignments: upcomingTasks.slice(0, 4),
        subjects: sortedSubjects,
        subjectCount: sortedSubjects.length,
        notesCount: notes.length,
        nextAssignment: upcomingTasks[0] || null,
      });
      setLoading(false);
    });
  }, []);

  const insight = useMemo(() => data ? deriveInsight(data) : null, [data]);

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const encouragement = useMemo(
    () => PROMPTS[new Date().getDate() % PROMPTS.length],
    []
  );

  if (loading) {
    return (
      <Page>
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
        <div className="w-full">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
              <div className="space-y-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-8 h-9 w-28 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* TOP BAR — date + secondary action */}
      <div className="flex items-center justify-between py-4">
        <span className="text-xs font-medium tracking-wide text-gray-400">
          {dateLabel}
        </span>
        <Link to="/study/notes/new">
          <Button variant="ghost" size="sm" icon={PenSquare}>
            New note
          </Button>
        </Link>
      </div>

      {/* YOUR SPACE — small label, not a hero */}
      <p className="text-xs font-medium tracking-wide text-gray-400">
        Your space
      </p>

      {/* CONTINUE WHERE YOU LEFT OFF — the card IS the hero */}
      <div className="mt-4">
        {data.recentNote ? (
          <Card padding="lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Continue where you left off
            </p>
            <p className="mt-2 text-2xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
              {data.recentNote.title}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              {data.recentNote.subject}
              <span className="mx-2">·</span>
              {timeAgo(data.recentNote.updatedAt || data.recentNote.createdAt)}
            </p>
            <div className="mt-8">
              <Link to={`/study/notes/${data.recentNote._id}`}>
                <Button variant="primary" iconRight={ArrowRight}>
                  Continue
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Begin your notes
            </p>
            <p className="mt-2 text-2xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
              Create your first note
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Your study starts here.
            </p>
            <div className="mt-8">
              <Link to="/study/notes/new">
                <Button variant="primary" iconRight={ArrowRight}>
                  Start writing
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* QUICK ACCESS — notes + assignments in a compact row */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Recent notes</span>
            {data.notesCount > 4 && (
              <Link to="/study/notes" className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                View all
              </Link>
            )}
          </div>
          {data.notes.length === 0 ? (
            <p className="text-sm text-gray-400">No notes yet.</p>
          ) : (
            <ul className="space-y-1">
              {data.notes.map((n) => (
                <li key={n._id}>
                  <Link
                    to={`/study/notes/${n._id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{n.title}</span>
                      <span className="ml-2 text-xs text-gray-400">{n.subject}</span>
                    </div>
                    <span className="ml-3 shrink-0 text-[10px] text-gray-400">
                      {formatDateShort(n.updatedAt || n.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Upcoming</span>
            {data.assignments.length > 4 && (
              <Link to="/study/assignments" className="text-[10px] font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                View all
              </Link>
            )}
          </div>
          {data.assignments.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing due.</p>
          ) : (
            <ul className="space-y-1">
              {data.assignments.map((t) => {
                const days = daysUntil(t.dueDate);
                return (
                  <li key={t._id}>
                    <span className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                      <span className="truncate text-gray-700 dark:text-gray-200">{t.title}</span>
                      <span className={`ml-3 shrink-0 text-xs ${
                        days < 0 ? 'text-rose-500 font-medium' :
                        days === 0 ? 'text-amber-600 font-medium' :
                        days <= 2 ? 'text-amber-600' :
                        'text-gray-400'
                      }`}>
                        {days < 0 ? 'Overdue' : days === 0 ? 'Today' : formatDateShort(t.dueDate)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* DAX INSIGHT */}
      {insight && (
        <>
          <div className="mt-10 border-t border-gray-200/60 dark:border-gray-800/60" />
          <div className="py-10">
            <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/80 p-5 dark:border-indigo-800/40 dark:bg-indigo-900/15">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{insight.insight}</p>
                  <Link
                    to={insight.action.to}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    {insight.action.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DAILY CASE */}
      <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
      <div className="py-10" id="daily-case">
        <DailyCaseCard />
      </div>

      {/* FOOTNOTE */}
      <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
      <div className="py-8">
        <p className="text-xs italic leading-relaxed text-gray-400">
          &ldquo;{encouragement}&rdquo;
        </p>
      </div>
    </Page>
  );
}
