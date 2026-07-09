import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookLock, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  listJournal,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../api/admin';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const MOODS = [
  { value: 'great', label: '😄 Great' },
  { value: 'good', label: '🙂 Good' },
  { value: 'okay', label: '😐 Okay' },
  { value: 'low', label: '😔 Low' },
  { value: 'rough', label: '😣 Rough' },
];

const moodEmoji = (mood) => MOODS.find((m) => m.value === mood)?.label.split(' ')[0] || '🙂';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700';

export default function JournalPage() {
  const [entries, setEntries] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, formState } = useForm();

  const load = () => listJournal().then((res) => setEntries(res.data));
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    reset({
      title: '',
      content: '',
      mood: 'good',
      entryDate: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    reset({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood,
      entryDate: entry.entryDate.slice(0, 10),
    });
    setModalOpen(true);
  };

  const onSave = async (data) => {
    try {
      if (editing) {
        await updateJournalEntry(editing._id, data);
        toast.success('Entry updated');
      } else {
        await createJournalEntry(data);
        toast.success('Entry saved');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this entry forever?')) return;
    await deleteJournalEntry(id);
    toast.success('Entry deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <BookLock className="h-5 w-5 text-indigo-500" /> My Journal
        </h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New entry
        </button>
      </div>
      <p className="mb-5 flex items-center gap-1 text-xs text-gray-400">
        <Lock className="h-3 w-3" /> Completely private — only the admin account can ever see this.
      </p>

      {!entries ? (
        <Loader />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookLock}
          title="Your journal is empty"
          subtitle="Capture a memory, a thought, or how today went"
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <article
              key={entry._id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-400">
                    {moodEmoji(entry.mood)} {formatDate(entry.entryDate)}
                  </p>
                  {entry.title && <h2 className="mt-0.5 font-semibold">{entry.title}</h2>}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(entry)}
                    aria-label="Edit entry"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(entry._id)}
                    aria-label="Delete entry"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {entry.content}
              </p>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit entry' : 'New journal entry'}
      >
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="j-date" className="mb-1 block text-sm font-medium">Date</label>
              <input id="j-date" type="date" {...register('entryDate', { required: true })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="j-mood" className="mb-1 block text-sm font-medium">Mood</label>
              <select id="j-mood" {...register('mood')} className={inputClass}>
                {MOODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="j-title" className="mb-1 block text-sm font-medium">
              Title <span className="text-gray-400">(optional)</span>
            </label>
            <input id="j-title" {...register('title')} placeholder="e.g. First day of Sem 2" className={inputClass} />
          </div>
          <div>
            <label htmlFor="j-content" className="mb-1 block text-sm font-medium">What happened?</label>
            <textarea
              id="j-content"
              rows={6}
              {...register('content', { required: true })}
              placeholder="Write freely — this stays between you and the page…"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {formState.isSubmitting ? 'Saving…' : 'Save entry'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
