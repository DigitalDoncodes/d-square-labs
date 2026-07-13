import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Timer, CheckSquare, Flame, BarChart2, Play, Pause, RotateCcw,
  Coffee, Zap, Brain, BookOpen, ChevronDown, ChevronUp, Music2, Target,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { getTodayLog, updateLog, getStreak, getWeekStats } from '../../api/studyTools';
import { RowSkeleton } from '../../components/common/Skeleton';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../../components/common/motion';

const MODES = [
  { key: 'focus', label: 'Focus', mins: 25, color: 'bg-indigo-600 text-white', ring: 'text-indigo-500' },
  { key: 'short', label: 'Short break', mins: 5, color: 'bg-emerald-600 text-white', ring: 'text-emerald-500' },
  { key: 'long', label: 'Long break', mins: 15, color: 'bg-purple-600 text-white', ring: 'text-purple-500' },
];

function PomodoroTimer({ onComplete }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].mins * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  const changeMode = (i) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setModeIdx(i);
    setSeconds(MODES[i].mins * 60);
  };

  const start = useCallback(() => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onComplete(modeIdx === 0);
          return MODES[modeIdx].mins * 60;
        }
        return s - 1;
      });
    }, 1000);
  }, [onComplete, modeIdx]);

  const pause = () => { clearInterval(intervalRef.current); setRunning(false); };
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setSeconds(mode.mins * 60); };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const totalSecs = mode.mins * 60;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = ((totalSecs - seconds) / totalSecs) * 100;
  const circum = 2 * Math.PI * 45;

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      {/* Mode switcher */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {MODES.map((m, i) => (
          <button key={m.key} onClick={() => changeMode(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${modeIdx === i ? m.color : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            strokeDasharray={`${(pct / 100) * circum} ${circum}`}
            className={mode.ring + ' transition-all duration-1000'} />
        </svg>
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{mode.label}</div>
        </div>
      </div>

      <div className="flex gap-3">
        {running ? (
          <button onClick={pause} className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
            <Pause className="h-4 w-4" /> Pause
          </button>
        ) : (
          <button onClick={start} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium ${mode.color} opacity-90 hover:opacity-100`}>
            <Play className="h-4 w-4" /> {seconds === totalSecs ? 'Start' : 'Resume'}
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

const POMODORO_STEPS = [
  { icon: BookOpen, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40', n: '1', label: 'Pick a task', desc: 'Choose ONE thing to work on — write it down if it helps.' },
  { icon: Timer, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40', n: '2', label: 'Set 25 minutes', desc: 'Work with full focus for exactly 25 minutes. No multitasking.' },
  { icon: Coffee, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40', n: '3', label: '5-min break', desc: 'Step away, breathe, stretch. Your brain consolidates learning here.' },
  { icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40', n: '4', label: 'Repeat × 4', desc: 'After 4 rounds, take a longer 15–30 min break before the next set.' },
];

const FOCUS_TIPS = [
  { icon: Brain, title: 'One tab rule', tip: 'Close everything except what you need for this session. Notifications off.' },
  { icon: Music2, title: 'Background audio', tip: 'Lo-fi, brown noise, or rain sounds help many people enter flow. Try it.' },
  { icon: Target, title: 'Define "done"', tip: 'Before starting, write one sentence: "This session is successful if I ___."' },
  { icon: Coffee, title: 'Breaks are mandatory', tip: 'Skipping breaks doesn\'t help — it depletes working memory faster.' },
];

export default function StudyToolsPage() {
  useDocumentTitle('Focus');
  const [log, setLog] = useState(null);
  const [streak, setStreak] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [showPomoInfo, setShowPomoInfo] = useState(false);

  useEffect(() => {
    Promise.allSettled([getTodayLog(), getStreak(), getWeekStats()]).then(([l, s, w]) => {
      if (l.status === 'fulfilled') setLog(l.value.data);
      if (s.status === 'fulfilled') setStreak(s.value.data.streak);
      if (w.status === 'fulfilled') setWeekStats(w.value.data.days);
    });
  }, []);

  const onPomodoroComplete = async (isFocus) => {
    if (isFocus) {
      toast.success('Focus session complete! Take your break 🎉');
      try {
        const newCount = (log?.pomodoroCount || 0) + 1;
        const newMins = (log?.studyMinutes || 0) + 25;
        const res = await updateLog({ pomodoroCount: newCount, studyMinutes: newMins });
        setLog(res.data);
      } catch { /* non-critical */ }
    } else {
      toast('Break over — back to focus!', { icon: '⚡' });
    }
  };

  const toggleHabit = async (idx) => {
    if (!log) return;
    const habits = log.habits.map((h, i) => i === idx ? { ...h, done: !h.done } : h);
    setLog((prev) => ({ ...prev, habits }));
    try { await updateLog({ habits }); }
    catch { toast.error('Failed to save'); }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (!log) return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-3"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
  );

  return (
    <Page className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      <PageHeader icon={Timer} title="Focus" subtitle="Deep work tools that build streaks, not stress" />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-1"><Flame className="h-4 w-4 text-orange-500" /><p className="text-xs font-semibold text-gray-500">Study Streak</p></div>
          <p className="text-3xl font-bold text-orange-500">{streak ?? 0}<span className="ml-1 text-sm font-normal text-gray-400">days</span></p>
          <p className="mt-1 text-[11px] text-gray-400">{(streak ?? 0) >= 5 ? '🔥 You\'re on fire!' : 'Study daily to grow'}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-1"><Timer className="h-4 w-4 text-indigo-500" /><p className="text-xs font-semibold text-gray-500">Today's Pomodoros</p></div>
          <p className="text-3xl font-bold text-indigo-600">{log.pomodoroCount}</p>
          <p className="mt-1 text-[11px] text-gray-400">{log.studyMinutes}m studied today</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-1"><CheckSquare className="h-4 w-4 text-emerald-500" /><p className="text-xs font-semibold text-gray-500">Today's Habits</p></div>
          <p className="text-3xl font-bold text-emerald-600">{log.habits.filter((h) => h.done).length}<span className="text-sm font-normal text-gray-400">/{log.habits.length}</span></p>
          <p className="mt-1 text-[11px] text-gray-400">habits completed</p>
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-3 dark:border-gray-800 flex items-center justify-between">
          <p className="font-semibold flex items-center gap-2"><Timer className="h-4 w-4 text-indigo-500" /> Pomodoro Timer</p>
          <button onClick={() => setShowPomoInfo((v) => !v)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400">
            What is Pomodoro? {showPomoInfo ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        <PomodoroTimer onComplete={onPomodoroComplete} />
      </div>

      {/* Pomodoro explainer */}
      {showPomoInfo && (
        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50 p-5 dark:border-indigo-800/40 dark:bg-indigo-950/30 space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-indigo-800 dark:text-indigo-200">The Pomodoro Technique</h3>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
              Developed by Francesco Cirillo in the late 1980s, the Pomodoro Technique is a time management method that uses focused 25-minute work blocks with short breaks in between. It's one of the most researched productivity techniques for students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {POMODORO_STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-900/40 p-3">
                <div className={`rounded-lg p-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-xs font-semibold">Step {s.n}: {s.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-indigo-500/70 dark:text-indigo-400/70 italic">
            "The next pomodoro will go better." — Francesco Cirillo
          </p>
        </div>
      )}

      {/* Today's Habits */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
        <p className="mb-3 font-semibold flex items-center gap-2"><CheckSquare className="h-4 w-4 text-indigo-500" /> Today's Habits</p>
        <div className="space-y-2">
          {log.habits.map((h, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={h.done} onChange={() => toggleHabit(i)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className={`text-sm ${h.done ? 'line-through text-gray-400' : ''}`}>{h.name}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">{log.habits.filter((h) => h.done).length}/{log.habits.length} completed today</p>
      </div>

      {/* Focus Tips */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
        <p className="mb-4 font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-indigo-500" /> Focus Tips</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FOCUS_TIPS.map((tip) => (
            <div key={tip.title} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
              <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/40"><tip.icon className="h-4 w-4 text-indigo-500" /></div>
              <div>
                <p className="text-xs font-semibold">{tip.title}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
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
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> 0m</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-200 inline-block" /> &lt;1h</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-400 inline-block" /> 1-2h</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-indigo-600 inline-block" /> 2h+</span>
          </div>
        </div>
      )}
    </Page>
  );
}
