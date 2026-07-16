import { Target, Clock, TrendingUp, Sparkles, CheckCircle2, BrainCircuit } from 'lucide-react';

function getRewardLabel(improvement) {
  const i = (improvement || '').toLowerCase();
  if (i.includes('significant')) return { emoji: '🏆', label: 'Major leap', color: 'text-amber-500' };
  if (i.includes('moderate')) return { emoji: '⭐', label: 'Solid gain', color: 'text-indigo-500' };
  if (i.includes('slight')) return { emoji: '🌱', label: 'Small step', color: 'text-emerald-500' };
  return { emoji: '💪', label: 'Progress', color: 'text-blue-500' };
}

function progressToTasks(mission) {
  if (!mission?.tasks?.length) return [];
  return mission.tasks.map((t, i) => ({
    index: i + 1,
    text: t,
    done: false,
  }));
}

export default function DailyMissionCard({ mission }) {
  if (!mission) return null;

  const tasks = progressToTasks(mission);
  const reward = getRewardLabel(mission.expectedReadinessImprovement);

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-white shadow-sm dark:border-indigo-800/40 dark:from-indigo-950/30 dark:via-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 px-5 py-3 dark:border-indigo-900/40">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Daily Mission
            </p>
            <p className="text-[10px] text-gray-400">Today's primary objective</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          <BrainCircuit className="h-3 w-3" />
          AI generated
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Goal */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Mission</p>
          <p className="text-base font-semibold leading-snug text-gray-800 dark:text-gray-100">
            {mission.goal}
          </p>
        </div>

        {/* Tasks */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Tasks ({tasks.length})
          </p>
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div
                key={task.index}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 transition-colors hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-gray-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[9px] font-semibold text-gray-400 dark:border-gray-600 dark:text-gray-500">
                  {task.index}
                </span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                  {task.text}
                </span>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-indigo-50/50 px-3 py-2.5 dark:bg-indigo-950/20">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <Clock className="h-3 w-3" />
              Time
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
              {mission.estimatedCompletionTime || '~30 min'}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/50 px-3 py-2.5 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <TrendingUp className="h-3 w-3" />
              Impact
            </div>
            <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
              {reward.label}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50/50 px-3 py-2.5 dark:bg-amber-950/20">
            <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
              <Sparkles className="h-3 w-3" />
              Reward
            </div>
            <p className={`mt-0.5 text-sm font-semibold ${reward.color}`}>
              {reward.emoji} {reward.label}
            </p>
          </div>
        </div>

        {/* Reasoning */}
        {mission.reasoning && (
          <div className="rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/50">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Why this mission?</p>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {mission.reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
