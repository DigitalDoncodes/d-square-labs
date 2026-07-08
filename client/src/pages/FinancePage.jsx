import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Wallet, Pencil } from 'lucide-react';
import {
  listExpenses,
  createExpense,
  deleteExpense,
  getSummary,
  setBudget,
} from '../api/finance';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import CategoryChart from '../components/finance/CategoryChart';
import BudgetBar from '../components/finance/BudgetBar';
import Calculators from '../components/finance/Calculators';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Books & Courses', 'Entertainment', 'Shopping', 'Other'];
const formatINR = (n) => '₹' + n.toLocaleString('en-IN');
const currentMonth = () => new Date().toISOString().slice(0, 7);

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700';

export default function FinancePage() {
  const [tab, setTab] = useState('tracker');
  const [month, setMonth] = useState(currentMonth());
  const [expenses, setExpenses] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expenseModal, setExpenseModal] = useState(false);
  const [budgetModal, setBudgetModal] = useState(false);
  const expenseForm = useForm({ defaultValues: { category: 'Food' } });
  const budgetForm = useForm();

  const load = useCallback(() => {
    listExpenses(month).then((res) => setExpenses(res.data));
    getSummary(month).then((res) => setSummary(res.data));
  }, [month]);
  useEffect(load, [load]);

  const onAddExpense = async (data) => {
    try {
      await createExpense(data);
      toast.success('Expense added');
      expenseForm.reset({ category: data.category });
      setExpenseModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const onSetBudget = async ({ monthlyAmount }) => {
    try {
      await setBudget(Number(monthlyAmount));
      toast.success('Budget saved');
      setBudgetModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await deleteExpense(id);
    load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">My Finances</h1>
        <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-800">
          {[
            { id: 'tracker', label: 'Tracker' },
            { id: 'calculators', label: 'Calculators' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-gray-400">
        Only you can see your finances — this section is private to your account.
      </p>

      {tab === 'calculators' ? (
        <Calculators />
      ) : !expenses || !summary ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Select month"
              className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  budgetForm.reset({ monthlyAmount: summary.budget || '' });
                  setBudgetModal(true);
                }}
                className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Pencil className="h-4 w-4" /> {summary.budget ? 'Edit budget' : 'Set budget'}
              </button>
              <button
                onClick={() => setExpenseModal(true)}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" /> Add expense
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-semibold">This month</h2>
              <span className="text-2xl font-bold">{formatINR(summary.total)}</span>
            </div>
            <BudgetBar spent={summary.total} budget={summary.budget} />
            {!summary.budget && (
              <p className="text-sm text-gray-400">Set a monthly budget to track overspending.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 font-semibold">Spending by category</h2>
            <CategoryChart data={summary.byCategory} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 font-semibold">Expenses</h2>
            {expenses.length === 0 ? (
              <EmptyState icon={Wallet} title="No expenses this month" subtitle="Add your first expense to start tracking" />
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.map((exp) => (
                  <li key={exp._id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{exp.note || exp.category}</p>
                      <p className="text-xs text-gray-400">
                        {exp.category} · {formatDate(exp.date)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatINR(exp.amount)}</span>
                    <button
                      onClick={() => onDelete(exp._id)}
                      aria-label="Delete expense"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add expense">
        <form onSubmit={expenseForm.handleSubmit(onAddExpense)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-amount" className="mb-1 block text-sm font-medium">Amount (₹)</label>
              <input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0"
                {...expenseForm.register('amount', { required: true, min: 0.01 })}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="exp-category" className="mb-1 block text-sm font-medium">Category</label>
              <select id="exp-category" {...expenseForm.register('category')} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="exp-note" className="mb-1 block text-sm font-medium">
              Note <span className="text-gray-400">(optional)</span>
            </label>
            <input id="exp-note" {...expenseForm.register('note')} placeholder="e.g. Mess bill" className={inputClass} />
          </div>
          <div>
            <label htmlFor="exp-date" className="mb-1 block text-sm font-medium">Date</label>
            <input
              id="exp-date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              {...expenseForm.register('date')}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={expenseForm.formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add expense
          </button>
        </form>
      </Modal>

      <Modal open={budgetModal} onClose={() => setBudgetModal(false)} title="Monthly budget">
        <form onSubmit={budgetForm.handleSubmit(onSetBudget)} className="space-y-4">
          <div>
            <label htmlFor="budget-amount" className="mb-1 block text-sm font-medium">Budget amount (₹ per month)</label>
            <input
              id="budget-amount"
              type="number"
              min="0"
              {...budgetForm.register('monthlyAmount', { required: true, min: 0 })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={budgetForm.formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Save budget
          </button>
        </form>
      </Modal>
    </div>
  );
}
