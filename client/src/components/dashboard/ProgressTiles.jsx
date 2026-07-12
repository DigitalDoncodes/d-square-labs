import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Flame } from 'lucide-react';
import { getReadiness } from '../../api/readiness';
import { getTodayCase } from '../../api/dailyCase';

// Phase 7 — Performance: accepts pre-loaded data from DashboardPage to avoid
// duplicate API calls; falls back to own fetch if used standalone (e.g. in tests).
export default function ProgressTiles({ resumePct: resumePctProp, streak: streakProp }) {
  const [resumePct, setResumePct] = useState(resumePctProp ?? null);
  const [streak, setStreak]       = useState(streakProp ?? null);

  useEffect(() => {
    if (resumePctProp === undefined) {
      getReadiness()
        .then((res) => {
          const r = res.data.components?.find((c) => c.key === 'resume');
          if (r) setResumePct(Math.round((r.points / r.max) * 100));
        })
        .catch(() => {});
    }
    if (streakProp === undefined) {
      getTodayCase()
        .then((res) => setStreak(res.data.streak ?? 0))
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync if parent data arrives after mount
  useEffect(() => { if (resumePctProp !== undefined) setResumePct(resumePctProp); }, [resumePctProp]);
  useEffect(() => { if (streakProp    !== undefined) setStreak(streakProp); },    [streakProp]);

  if (resumePct === null && streak === null) return null;

  const pctColor =
    resumePct >= 75 ? 'bg-emerald-500' : resumePct >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  // Phase 10 — Retention: 7-dot week grid shows which days the student was active
  const today = new Date();
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { label: d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 1), active: i >= 7 - (streak ?? 0) };
  });

  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      {/* Resume completion */}
      {resumePct !== null && (
        <Link
          to="/career/resume"
          className="card-hover rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <FileText className="h-4 w-4 text-indigo-500" /> Resume
          </div>
          <p className="text-2xl font-bold tabular-nums">{resumePct}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pctColor}`}
              style={{ width: `${Math.max(resumePct, 2)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            {resumePct < 40 ? 'Needs attention — add experience & skills' : resumePct < 75 ? 'Looking good, keep going' : resumePct < 100 ? 'Almost there!' : 'Complete ✓'}
          </p>
        </Link>
      )}

      {/* Study streak with 7-day week view */}
      {streak !== null && (
        <Link
          to="/career"
          className="card-hover rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <Flame className="h-4 w-4 text-orange-500" /> Case streak
          </div>
          <p className="text-2xl font-bold tabular-nums">{streak}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {streak === 0
              ? "Solve today's case to start"
              : streak === 1
              ? 'day — come back tomorrow!'
              : `day${streak === 1 ? '' : 's'} in a row 🔥`}
          </p>
          {/* Week dots — Phase 10 */}
          <div className="mt-3 flex items-center gap-1">
            {weekDots.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                <div className={`h-2 w-full rounded-sm ${d.active ? 'bg-orange-400' : 'bg-gray-100 dark:bg-gray-800'}`} />
                <span className="text-[9px] text-gray-300 dark:text-gray-600">{d.label}</span>
              </div>
            ))}
          </div>
        </Link>
      )}
    </div>
  );
}
