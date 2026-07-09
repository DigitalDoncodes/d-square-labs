import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { listNotes } from '../api/notes';
import { SUBJECTS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function NotesListPage() {
  const [notes, setNotes] = useState(null);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    listNotes(subject ? { subject } : {}).then((res) => setNotes(res.data));
  }, [subject]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Notes</h1>
        <div className="flex items-center gap-2">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            aria-label="Filter by subject"
            className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Link
            to="/notes/new"
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New note
          </Link>
        </div>
      </div>

      {!notes ? (
        <Loader />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No notes yet"
          subtitle="Be the first to share study notes with your batch"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note._id}
              to={`/notes/${note._id}`}
              className="card-hover rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {note.subject}
                </span>
                {note.semester && (
                  <span className="text-xs text-gray-400">{note.semester}</span>
                )}
              </div>
              <h2 className="mb-1 font-semibold">{note.title}</h2>
              <p className="line-clamp-2 text-sm text-gray-500">{note.content}</p>
              <p className="mt-3 text-xs text-gray-400">
                {note.author?.name} · {formatDate(note.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
