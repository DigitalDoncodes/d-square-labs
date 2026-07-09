import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  BookLock,
  BookOpen,
  Camera,
  CalendarDays,
  Crown,
  Mail,
  Megaphone,
  Pin,
  Trash2,
  Users,
} from 'lucide-react';
import {
  getStats,
  listStudents,
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700';

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Icon className="h-4 w-4 text-indigo-500" /> {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const { register, handleSubmit, reset, formState } = useForm();

  const load = () => {
    getStats().then((res) => setStats(res.data));
    listStudents().then((res) => setStudents(res.data));
    listAnnouncements().then((res) => setAnnouncements(res.data));
  };
  useEffect(load, []);

  const onCreate = async (data) => {
    try {
      await createAnnouncement(data);
      toast.success(data.sendEmail ? 'Announcement sent & emailed to the batch' : 'Announcement posted');
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  const onDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    load();
  };

  if (!stats || !students || !announcements) return <Loader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold">
        <Crown className="h-5 w-5 text-amber-500" /> Admin Console
      </h1>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Welcome back, {user?.name?.split(' ')[0]} — here's your platform at a glance.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile icon={Users} label="Students" value={stats.students} />
        <StatTile icon={BookOpen} label="Notes" value={stats.notes} />
        <StatTile icon={Camera} label="Photos" value={stats.photos} />
        <StatTile icon={CalendarDays} label="Tasks" value={stats.tasks} />
        <Link to="/journal" className="block">
          <StatTile icon={BookLock} label="Journal entries" value={stats.journalEntries} />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Megaphone className="h-4 w-4 text-indigo-500" /> New announcement
          </h2>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
            <input
              {...register('title', { required: true })}
              placeholder="Title"
              aria-label="Announcement title"
              className={inputClass}
            />
            <textarea
              rows={4}
              {...register('body', { required: true })}
              placeholder="Write the announcement…"
              aria-label="Announcement body"
              className={inputClass}
            />
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" {...register('pinned')} className="rounded" />
                <Pin className="h-3.5 w-3.5 text-gray-400" /> Pin
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked {...register('sendEmail')} className="rounded" />
                <Mail className="h-3.5 w-3.5 text-gray-400" /> Email everyone
              </label>
              <select {...register('priority')} aria-label="Priority" className="rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {formState.isSubmitting ? 'Posting…' : 'Post announcement'}
            </button>
          </form>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            {announcements.length === 0 && (
              <p className="text-sm text-gray-400">No announcements yet.</p>
            )}
            {announcements.map((a) => (
              <div key={a._id} className="flex items-start gap-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {a.pinned && <Pin className="mr-1 inline h-3 w-3 text-amber-500" />}
                    {a.title}
                    {a.emailed && <Mail className="ml-1 inline h-3 w-3 text-gray-400" />}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                </div>
                <button
                  onClick={() => onDeleteAnnouncement(a._id)}
                  aria-label="Delete announcement"
                  className="rounded p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4 text-indigo-500" /> Registered students ({students.length})
          </h2>
          <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
            {students.map((s) => (
              <li key={s._id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {s.name}
                    {s.role === 'admin' && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        admin
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-400">{s.email}</p>
                </div>
                <span className="ml-2 shrink-0 text-xs text-gray-400">
                  {formatDate(s.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
