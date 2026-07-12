import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Timer, CheckSquare, Flame, BarChart2, Play, Pause, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { getTodayLog, updateLog, getStreak, getWeekStats } from '../../api/studyTools';
import { RowSkeleton } from '../../components/common/Skeleton';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../../components/common/motion';

const POMODORO_MINS = 25;

function PomodoroTimer({ onComplete }) {
  const [seconds, setSeconds] = useState(POMODORO_MINS * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onComplete();
          return POMODORO_MINS * 60;
        }
        return s - 1;
      });
    }, 1000);
  }, [onComplete]);

  const pause = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(POMODORO_MINS * 60);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = ((POMODORO_MINS * 60 - seconds) / (POMODORO_MINS * 60)) * 100;

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            strokeDasharray={`${pct * 2.827} 282.7`}
            className="text-indigo-500 transition-all duration-1000"
          />
        </svg>
        <span className="text-3xl font-bold tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div className="flex gap-3">
        {running ? (
          <button onClick={pause} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
            <Pause className="h-4 w-4" /> Pause
          </button>
        ) : (
          <button onClick={start} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
            <Play className="h-4 w-4" /> {seconds === POMODORO_MINS * 60 ? 'Start' : 'Resume'}
          </button>
        )}
        <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function HeatDot({ minutes }) {
  const level = minutes === 0 ? 0 : minutes < 60 ? 1 : minutes < 120 ? 2 : 3;
  const colors = ['bg-gray-200 dark:bg-gray-700', 'bg-indigo-200 dark:bg-indigo-800', 'bg-indigo-400', 'bg-indigo-600'];
  return <div className={`h-8 w-8 rounded-lg ${colors[level]}`} title={`${minutes}m`} />;
}

export default function StudyToolsPage() {
  useDocumentTitle('Study Tools');
  const [log, setLog] = useState(null);
  const [streak, setStreak] = useState(null);
  const [weekStats, setWeekStats] = useState(null);

  useEffect(() => {
    Promise.allSettled([getTodayLog(), getStreak(), getWeekStats()]).then(([l, s, w]) => {
      if (l.status === 'fulfilled') setLog(l.value.data);
      if (s.status === 'fulfilled') setStreak(s.value.data.streak);
      if (w.status === 'fulfilled') setWeekStats(w.value.data.days);
    });
  }, []);

  const onPomodoroComplete = async () => {
    toast.success('Pomodoro complete! Take a break 🎉');
    try {
      const newCount = (log?.pomodoroCount || 0) + 1;
      const newMins = (log?.studyMinutes || 0) + POMODORO_MINS;
      const res = await updateLog({ pomodoroCount: newCount, studyMinutes: newMins });
      setLog(res.data);
    } catch { /* non-critical */ }
  };

  const toggleHabit = async (idx) => {
    if (!log) return;
    const habits = log.habits.map((h, i) => i === idx ? { ...h, done: !h.done } : h);
    setLog((prev) => ({ ...prev, habits }));
    try {
      await updateLog({ habits });
    } catch { toast.error('Failed to save'); }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (!log) return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
      <RowSkeleton /><RowSkeleton /><RowSkeleton />
    </div>
  );

  return (
    <Page className="mx-auto max-w-3xl px-4 py-6">
      <PageHeader
        icon={Timer}
        title="Study Tools"
        subtitle="Focus tools that build streaks, not stress"
      />

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        {/* Streak Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <p className="font-semibold">Study Streak</p>
          </div>
          <p className="text-3xl font-bold text-orange-500">{streak ?? 0}<span className="ml-1 text-base font-normal text-gray-500">days</span></p>
          <p className="mt-1 text-xs text-gray-400">{streak >= 5 ? "You're on fire! Keep it up 🔥" : "Study daily to build your streak"}</p>
        </div>

        {/* Pomodoro count */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-5 w-5 text-indigo-500" />
            <p className="font-semibold">Today's Focus</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{log.pomodoroCount}<span className="ml-1 text-base font-normal text-gray-500">pomodoros</span></p>
          <p className="mt-1 text-xs text-gray-400">{log.studyMinutes}m studied today</p>
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800">
          <p className="font-semibold flex items-center gap-2"><Timer className="h-4 w-4 text-indigo-500" /> 25-min Pomodoro</p>
        </div>
        <PomodoroTimer onComplete={onPomodoroComplete} />
      </div>

      {/* Today's Habits */}
      <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
        <p className="mb-3 font-semibold flex items-center gap-2"><CheckSquare className="h-4 w-4 text-indigo-500" /> Today's Habits</p>
        <div className="space-y-2">
          {log.habits.map((h, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={h.done}
                onChange={() => toggleHabit(i)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className={`text-sm ${h.done ? 'line-through text-gray-400' : ''}`}>{h.name}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          {log.habits.filter((h) => h.done).length}/{log.habits.length} completed
        </p>
      </div>

      {/* Week Heatmap */}
      {weekStats && (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <p className="mb-3 font-semibold flex items-center gap-2"><BarChart2 className="h-4 w-4 text-indigo-500" /> This Week</p>
          <div className="flex gap-2 items-end">
            {weekStats.map((d, i) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <HeatDot minutes={d.studyMinutes} />
                <span className="text-[10px] text-gray-400">{weekDays[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> 0min</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-200 inline-block" /> &lt;1h</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-400 inline-block" /> 1-2h</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-600 inline-block" /> 2h+</span>
          </div>
        </div>
      )}
    </Page>
  );
}
