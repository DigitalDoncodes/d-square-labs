import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { getNote, deleteNote } from '../api/notes';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/dateUtils';
import Loader from '../components/common/Loader';

export default function NoteDetailPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getNote(id).then((res) => setNote(res.data));
  }, [id]);

  if (!note) return <Loader />;

  const isAuthor = note.author?._id === user?.id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(id);
    toast.success('Note deleted');
    navigate('/notes');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/notes" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
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
                to={`/notes/${id}/edit`}
                aria-label="Edit note"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              <button
                onClick={handleDelete}
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
      </div>
    </div>
  );
}
