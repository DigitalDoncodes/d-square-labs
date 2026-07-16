import { useState, useEffect } from 'react';
import {
  Calendar, TrendingUp, Lightbulb, Target, ArrowRight,
  CheckCircle2, AlertTriangle, RotateCcw, Loader2,
} from 'lucide-react';
import { getWeeklyReview, generateWeeklyReview } from '../../api/experience';

function DeltaBadge({ delta }) {
  if (delta == null) return null;
  if (delta > 0) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      <TrendingUp className="h-3 w-3" /> +{delta}
    </span>
  );
  if (delta < 0) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
      <TrendingUp className="h-3 w-3 rotate-180" /> {delta}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      —
    </span>
  );
}

export default function WeeklyReview({ onRefresh }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getWeeklyReview();
      setReview(res.data);
    } catch {
      setReview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateWeeklyReview();
      setReview(res.data);
      onRefresh?.();
    } catch {
      // silent
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading your weekly review…</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 text-center dark:border-gray-800/80 dark:bg-gray-900">
        <Calendar className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">No weekly review yet</p>
        <p className="mt-1 text-xs text-gray-500">Reviews generate after a week of activity.</p>
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
          Generate now
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800/80 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Weekly Review
            </p>
            <p className="text-[10px] text-gray-400">
              {review.weekStart} — {review.weekEnd}
            </p>
          </div>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
          Refresh
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Reflection */}
        {review.reflection && (
          <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/30 dark:to-purple-950/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Reflection
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {review.reflection}
            </p>
          </div>
        )}

        {/* Wins & Challenges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Wins
              </span>
            </div>
            {review.wins?.length > 0 ? (
              <ul className="space-y-1">
                {review.wins.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    {w.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No wins recorded</p>
            )}
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Challenges
              </span>
            </div>
            {review.challenges?.length > 0 ? (
              <ul className="space-y-1">
                {review.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                    {c.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No challenges recorded</p>
            )}
          </div>
        </div>

        {/* Readiness + Insights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Readiness
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {review.readinessChange?.start ?? '—'}
              </span>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {review.readinessChange?.end ?? '—'}
              </span>
              <DeltaBadge delta={review.readinessChange?.delta} />
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                Insights
              </span>
            </div>
            {review.insights?.length > 0 ? (
              <ul className="space-y-1">
                {review.insights.slice(0, 2).map((ins, i) => (
                  <li key={i} className="text-xs text-gray-500 dark:text-gray-400">
                    • {ins.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">Generating insights…</p>
            )}
          </div>
        </div>

        {/* Next Week */}
        {review.nextWeekPriorities?.length > 0 && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Next Week
              </span>
            </div>
            <ul className="space-y-1">
              {review.nextWeekPriorities.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
