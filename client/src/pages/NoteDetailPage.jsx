import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getNote, deleteNote } from '../api/notes';
import { summariseNote } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import { Skeleton } from '../components/common/Skeleton';
import ConfirmModal from '../components/common/ConfirmModal';
import TierGate from '../components/common/TierGate';
import CrownBadge from '../components/common/CrownBadge';

function AISummaryPanel({ noteId, hasContent }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(true);

  const run = async () => {
    setState('loading');
    try {
      const res = await summariseNote(noteId);
      setResult(res.data);
      setState('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dax could not summarise this note');
      setState('error');
    }
  };

  if (!hasContent) return null;

  if (state === 'idle') {
    return (
      <button
        onClick={run}
        className="mt-5 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
      >
        <Sparkles className="h-4 w-4" /> Summarise with Dax
      </button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-300">
        <Loader2 className="h-4 w-4 animate-spin" /> Generating summary…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <button
        onClick={run}
        className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-900/30"
      >
        <Sparkles className="h-4 w-4" /> Retry summary
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800/60 dark:bg-indigo-900/20">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" /> Dax Summary
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-indigo-500" /> : <ChevronDown className="h-4 w-4 text-indigo-500" />}
      </button>

      {open && (
        <div className="border-t border-indigo-200/70 px-4 pb-4 pt-3 dark:border-indigo-800/40">
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-200">{result.summary}</p>

          {result.keyPoints?.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Key takeaways
              </p>
              <ul className="mb-3 space-y-1">
                {result.keyPoints.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <span className="mt-0.5 shrink-0 text-indigo-400">•</span> {pt}
                  </li>
                ))}
              </ul>
            </>
          )}

          {result.frameworks && (
            <>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Frameworks & concepts
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{result.frameworks}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getNote(id).then((res) => setNote(res.data));
  }, [id]);

  if (!note) return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <Skeleton className="mb-2 h-4 w-20 rounded-full" />
        <Skeleton className="mb-3 h-7 w-2/3" />
        <Skeleton className="mb-1 h-3 w-40" />
        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );

  const isAuthor = note.author?._id === user?.id || note.author?._id === user?._id;

  const handleDelete = async () => {
    await deleteNote(id);
    toast.success('Note deleted');
    navigate('/study/notes');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/study/notes" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> All notes
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {note.subject}
              </span>
              {note.semester && <span className="text-xs text-gray-400">{note.semester}</span>}
            </div>
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {note.author?.name} · updated {formatDateTime(note.updatedAt)}
            </p>
          </div>
          {isAuthor && (
            <div className="flex gap-1">
              <Link
                to={`/study/notes/${id}/edit`}
                aria-label="Edit note"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete note"
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {note.content || <span className="text-gray-400">No content</span>}
        </div>

        <div className="flex items-center gap-2 mt-4 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dax Summary</span>
          <CrownBadge required="pro" />
        </div>
        <TierGate required="pro" inline description="Search your notes using natural language — find concepts, not just keywords.">
          <AISummaryPanel noteId={id} hasContent={Boolean(note.content?.trim())} />
        </TierGate>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete note"
        message="This note will be permanently deleted and cannot be recovered."
        danger
        confirmLabel="Delete"
      />
    </div>
  );
}
