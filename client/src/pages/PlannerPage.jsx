import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CalendarDays, Check, Pencil, Plus, Trash2, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { plannerSuggest } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS, TASK_TYPES, TASK_STATUSES } from '../utils/constants';
import { formatDate, daysUntil } from '../utils/dateUtils';
import { FeedSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import TierGate from '../components/common/TierGate';
import CrownBadge from '../components/common/CrownBadge';

function AIPlannerPanel() {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);

  const run = async () => {
    setState('loading');
    try {
      const res = await plannerSuggest();
      setResult(res.data);
      setState('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI suggestions failed');
      setState('error');
    }
  };

  if (state === 'idle' || state === 'error') {
    return (
      <button
        onClick={run}
        className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-900/30 dark:text-indigo-300"
      >
        <Sparkles className="h-4 w-4" />
        {state === 'error' ? 'Retry AI suggestions' : 'Get AI suggestions for today'}
      </button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-900/30">
        <Loader2 className="h-4 w-4 animate-spin" /> Thinking through your priorities…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/60 dark:bg-indigo-900/20">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" /> AI Priorities for Today
        </p>
        <button onClick={run} className="text-indigo-400 hover:text-indigo-600">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      {result?.focusArea && (
        <p className="mb-3 text-sm font-medium text-indigo-800 dark:text-indigo-200">{result.focusArea}</p>
      )}
      <ol className="mb-3 space-y-1.5">
        {(result?.priorities || []).map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">{i + 1}</span>
            {p}
          </li>
        ))}
      </ol>
      {result?.motivationalNote && (
        <p className="text-xs italic text-indigo-500 dark:text-indigo-400">{result.motivationalNote}</p>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const dueLabel = (dueDate) => {
  const days = daysUntil(dueDate);
  if (days < 0) return { text: `${-days}d overdue`, cls: 'text-red-500 font-medium' };
  if (days === 0) return { text: 'Due today', cls: 'text-amber-500 font-medium' };
  if (days === 1) return { text: 'Due tomorrow', cls: 'text-amber-500' };
  return { text: `Due in ${days}d`, cls: 'text-gray-400' };
};

export default function PlannerPage() {
  const [tasks, setTasks] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // task being edited, or null for new
  const [confirmDelete, setConfirmDelete] = useState(null); // task _id to delete
  const { register, handleSubmit, reset, formState } = useForm();
  const { user } = useAuth();

  const load = () =>
    listTasks(statusFilter ? { status: statusFilter } : {}).then((res) => setTasks(res.data));
  useEffect(() => {
    load();
  }, [statusFilter]);

  const openNew = () => {
    setEditing(null);
    reset({ title: '', type: TASK_TYPES[0]?.value, subject: '', dueDate: '', assignToSelf: false });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    reset({
      title: task.title,
      type: task.type,
      subject: task.subject || '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignToSelf: !!task.assignee,
    });
    setModalOpen(true);
  };

  const onSave = async (data) => {
    try {
      if (editing) {
        await updateTask(editing._id, {
          title: data.title,
          type: data.type,
          subject: data.subject,
          dueDate: data.dueDate,
        });
        toast.success('Task updated');
      } else {
        await createTask(data);
        toast.success('Task added');
      }
      reset();
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const cycleStatus = async (task) => {
    const order = ['pending', 'in-progress', 'done'];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    try {
      await updateTask(task._id, { status: next });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const canModify = (task) =>
    task.createdBy?._id === user?.id || task.assignee?._id === user?.id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Study Planner</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">AI Suggestions</span>
          <CrownBadge required="pro" />
        </div>
        <TierGate required="pro" inline description="AI prioritizes your tasks for today based on deadlines, readiness score, and your goals.">
          <AIPlannerPanel />
        </TierGate>
      </div>

      {!tasks ? (
        <FeedSkeleton count={5} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No tasks yet"
          subtitle="Add deadlines, case studies and exam prep so nothing slips through the cracks"
          cta={{ label: 'Add your first task', to: '#' }}
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add first task
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const due = dueLabel(task.dueDate);
            return (
              <div
                key={task._id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <button
                  onClick={() => canModify(task) && cycleStatus(task)}
                  aria-label="Cycle task status"
                  disabled={!canModify(task)}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[task.status]} ${canModify(task) ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {task.status === 'done' ? <Check className="h-3.5 w-3.5" /> : task.status}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : ''}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {TASK_TYPES.find((t) => t.value === task.type)?.label}
                    {task.subject && ` · ${task.subject}`}
                    {' · '}{formatDate(task.dueDate)}
                    {task.assignee ? ` · ${task.assignee.name}` : ' · Whole batch'}
                  </p>
                </div>
                <span className={`text-xs ${due.cls}`}>{task.status === 'done' ? '' : due.text}</span>
                {canModify(task) && (
                  <button
                    onClick={() => openEdit(task)}
                    aria-label="Edit task"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canModify(task) && (
                  <button
                    onClick={() => setConfirmDelete(task._id)}
                    aria-label="Delete task"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete task"
        message="This task will be permanently deleted."
        danger
        confirmLabel="Delete"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'Add task'}>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium">Title</label>
            <input
              id="task-title"
              {...register('title', { required: true })}
              placeholder="e.g. Submit Marketing Case 3"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-type" className="mb-1 block text-sm font-medium">Type</label>
              <select id="task-type" {...register('type')} className={inputClass}>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-subject" className="mb-1 block text-sm font-medium">Subject</label>
              <select id="task-subject" {...register('subject')} className={inputClass}>
                <option value="">None</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="task-due" className="mb-1 block text-sm font-medium">Due date</label>
            <input
              id="task-due"
              type="date"
              {...register('dueDate', { required: true })}
              className={inputClass}
            />
          </div>
          {!editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('assignToSelf')} className="rounded" />
              Assign to me (otherwise it's for the whole batch)
            </label>
          )}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {formState.isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
