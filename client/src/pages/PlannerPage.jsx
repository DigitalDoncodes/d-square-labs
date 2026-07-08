import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CalendarDays, Check, Plus, Trash2 } from 'lucide-react';
import { listTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS, TASK_TYPES, TASK_STATUSES } from '../utils/constants';
import { formatDate, daysUntil } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700';

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
  const { register, handleSubmit, reset, formState } = useForm();
  const { user } = useAuth();

  const load = () =>
    listTasks(statusFilter ? { status: statusFilter } : {}).then((res) => setTasks(res.data));
  useEffect(() => {
    load();
  }, [statusFilter]);

  const onCreate = async (data) => {
    try {
      await createTask(data);
      toast.success('Task added');
      reset();
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task');
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
    if (!window.confirm('Delete this task?')) return;
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
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>
      </div>

      {!tasks ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No tasks yet"
          subtitle="Add deadlines, case studies and exam prep for your batch"
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
                    onClick={() => handleDelete(task._id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add task">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('assignToSelf')} className="rounded" />
            Assign to me (otherwise it's for the whole batch)
          </label>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add task
          </button>
        </form>
      </Modal>
    </div>
  );
}
