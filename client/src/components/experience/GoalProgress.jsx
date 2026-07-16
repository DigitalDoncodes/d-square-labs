import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, TrendingUp, Circle, ArrowRight } from 'lucide-react';
import { getGoalProgress } from '../../api/experience';

function MilestoneDot({ label, reached }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
        reached
          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600'
      }`}>
        {reached ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
      </div>
      <span className={`text-[9px] text-center leading-tight max-w-16 ${
        reached ? 'font-medium text-gray-600 dark:text-gray-300' : 'text-gray-400'
      }`}>
        {label}
      </span>
    </div>
  );
}

function GoalCard({ goal }) {
  const pct = goal.completionPct || 0;
  const isComplete = pct >= 100;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className={`h-4 w-4 ${isComplete ? 'text-emerald-500' : 'text-indigo-500'}`} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
            {goal.goal}
          </span>
        </div>
        <span className={`text-xs font-bold ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isComplete ? 'bg-emerald-400' : 'bg-indigo-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
        <span>{goal.completed || 0} completed</span>
        <span>{goal.total || 0} total</span>
      </div>

      {/* Milestones */}
      {goal.milestones && (
        <div className="mt-3 flex items-center justify-between px-1">
          {goal.milestones.reached?.slice(-3).map((m, i) => (
            <MilestoneDot key={i} label={m} reached />
          ))}
          {goal.milestones.next && !isComplete && (
            <>
              <ArrowRight className="h-3 w-3 text-gray-300" />
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-dashed border-indigo-300 bg-white dark:border-indigo-600 dark:bg-gray-900">
                  <Circle className="h-2 w-2 text-indigo-400" />
                </div>
                <span className="text-[9px] text-center text-indigo-400 max-w-16">
                  {goal.milestones.next}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Estimated time */}
      {goal.estimatedDaysRemaining != null && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="h-3 w-3" />
          ~{goal.estimatedDaysRemaining} day{goal.estimatedDaysRemaining !== 1 ? 's' : ''} remaining
        </div>
      )}
    </div>
  );
}

export default function GoalProgress() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getGoalProgress()
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading goal progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Goal Progress</p>
          <p className="text-[10px] text-gray-400">Journey from current state to target</p>
        </div>
        {data.overall && (
          <div className="text-right">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {data.overall.completionPct}%
              <span className="text-xs font-normal text-gray-400"> overall</span>
            </span>
            <p className="text-[10px] text-gray-400">
              {data.overall.totalCompleted} done · {data.overall.totalActive} active
            </p>
          </div>
        )}
      </div>

      {/* Goal cards */}
      {data.goals?.length > 0 ? (
        <div className="space-y-3">
          {data.goals.map((goal, i) => (
            <GoalCard key={i} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Target className="mx-auto h-6 w-6 text-gray-300 dark:text-gray-600" />
          <p className="mt-1 text-xs text-gray-400">Set goals to start tracking progress</p>
        </div>
      )}
    </div>
  );
}
