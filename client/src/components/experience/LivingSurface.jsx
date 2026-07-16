import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getDailyMission,
  getRecommendationStream,
  getReadiness,
  getGoalProgress,
  getWeeklyReview,
  transitionLifecycle,
} from '../../api/experience';
import { listTasks } from '../../api/tasks';
import { listNotes } from '../../api/notes';
import { getTodayReflection } from '../../api/reflection';
import { getTodayCase } from '../../api/dailyCase';
import { daysUntil } from '../../utils/dateUtils';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../common/motion';
import { Skeleton } from '../common/Skeleton';
import Card from '../common/Card';
import Button from '../common/Button';

const PROMPTS = [
  'One page today is better than ten pages someday.',
  'You don\'t have to do everything today. Just the next right thing.',
  'Progress is quiet. Keep going.',
  'Showing up today is enough. The rest follows.',
  'Small steps, taken daily, become the person you\'re becoming.',
  'You\'ve handled every hard day so far. Today is no different.',
  'Comparison is noise. Your pace is the plan.',
];

function deriveContextLine({ readiness, tasks, streak, trendDelta }) {
  const score = typeof readiness === 'object' ? readiness?.score : readiness;
  const overdue = tasks?.filter((t) => daysUntil(t.dueDate) < 0).length || 0;

  const parts = [];

  if (score != null) {
    if (score >= 75) parts.push('Your readiness is strong.');
    else if (score >= 50) parts.push('Your readiness is on track.');
    else parts.push('Your readiness could use a boost.');
    if (trendDelta?.delta != null && trendDelta.delta >= 0) {
      parts.push(`Up ${trendDelta.delta} points this week.`);
    }
  }

  if (streak >= 5) {
    parts.push(`Day ${streak} of your streak — this is where growth happens.`);
  } else if (streak > 0) {
    parts.push(`${streak}-day streak. Keep showing up.`);
  } else if (overdue > 2) {
    parts.push(`You have ${overdue} tasks waiting. One step at a time.`);
  }

  return parts.length > 0 ? parts.join(' ') : 'A fresh day with new possibilities. What matters most today?';
}

function getImpactConfig(improvement) {
  const i = (improvement || '').toLowerCase();
  if (i.includes('significant')) return { label: 'Major leap', color: 'text-amber-600 dark:text-amber-400' };
  if (i.includes('moderate')) return { label: 'Solid gain', color: 'text-indigo-600 dark:text-indigo-400' };
  if (i.includes('slight')) return { label: 'Small step', color: 'text-emerald-600 dark:text-emerald-400' };
  return { label: 'Progress', color: 'text-blue-600 dark:text-blue-400' };
}

function getReadinessBand(score) {
  if (score == null) return { color: 'text-gray-400', ring: 'stroke-gray-300 dark:stroke-gray-600' };
  if (score >= 75) return { color: 'text-emerald-500', ring: 'stroke-emerald-400' };
  if (score >= 50) return { color: 'text-indigo-500', ring: 'stroke-indigo-400' };
  if (score >= 25) return { color: 'text-amber-500', ring: 'stroke-amber-400' };
  return { color: 'text-rose-500', ring: 'stroke-rose-400' };
}

function getTrendDelta(review) {
  if (!review?.readinessChange) return null;
  return review.readinessChange;
}

function deriveInsight({ readiness, tasks, caseData, notes, goalProgress }) {
  if (readiness?.components?.length) {
    const worst = [...readiness.components].sort(
      (a, b) => a.points / a.max - b.points / b.max
    )[0];
    if (worst && worst.points / worst.max < 0.5) {
      return {
        insight: `Your ${worst.label} is your lowest area. Focus there first — it could raise your overall score significantly.`,
        action: { label: 'View readiness breakdown', to: '/career/readiness' },
      };
    }
  }

  if (tasks?.length) {
    const overdue = tasks.filter((t) => daysUntil(t.dueDate) < 0).length;
    if (overdue >= 2) {
      return {
        insight: `You have ${overdue} overdue ${overdue === 1 ? 'task' : 'tasks'} waiting. Clearing just one restores a sense of control.`,
        action: { label: 'View your tasks', to: '/planner' },
      };
    }
  }

  if (caseData?.streak && caseData.streak >= 3) {
    return {
      insight: `You're on a ${caseData.streak}-day streak. Each consecutive day builds momentum — consistency compounds.`,
      action: { label: 'Keep it going', to: '/study' },
    };
  }

  if (goalProgress?.overall?.completionPct != null && goalProgress.overall.completionPct < 100) {
    return {
      insight: `You're ${goalProgress.overall.completionPct}% toward your goals. ${goalProgress.overall.totalCompleted || 0} milestones completed.`,
      action: { label: 'View your goals', to: '/me' },
    };
  }

  if (notes?.length) {
    return {
      insight: `Your latest note shows active learning. Paraphrasing material in your own words is one of the highest-ROI study techniques.`,
      action: { label: 'View your notes', to: '/study/notes' },
    };
  }

  return null;
}

function LargeScoreRing({ score }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  const pct = Math.min(score ?? 0, 100) / 100;
  const offset = C - pct * C;
  const band = getReadinessBand(score);

  return (
    <div className="relative h-[160px] w-[160px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50" cy="50" r={R} fill="none" strokeWidth="8"
          className="stroke-gray-100 dark:stroke-gray-800"
        />
        <circle
          cx="50" cy="50" r={R} fill="none" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          className={`${band.ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold tabular-nums ${band.color}`}>
          {score ?? 0}
        </span>
      </div>
    </div>
  );
}

function ScoreRingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="h-[160px] w-[160px] rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function InsightCard({ insight }) {
  if (!insight) return null;
  return (
    <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/80 p-5 dark:border-indigo-800/40 dark:bg-indigo-900/15">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            {insight.insight}
          </p>
          {insight.action && (
            <Link
              to={insight.action.to}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              {insight.action.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/80 p-5 dark:border-indigo-800/40 dark:bg-indigo-900/15">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-4 rounded" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function MissionCardSkeleton() {
  return (
    <Card padding="lg">
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-56" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="mt-6 h-9 w-28 rounded-xl" />
      </div>
    </Card>
  );
}

export default function LivingSurface() {
  useDocumentTitle('Home');
  const { user } = useAuth();

  const [mission, setMission] = useState(null);
  const [missionLoading, setMissionLoading] = useState(true);
  const [missionError, setMissionError] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [readinessError, setReadinessError] = useState(null);
  const [stream, setStream] = useState(null);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);
  const [weeklyReview, setWeeklyReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reflection, setReflection] = useState(null);
  const [caseData, setCaseData] = useState(null);

  const [acceptedRecs, setAcceptedRecs] = useState(new Set());

  const fetchMission = async () => {
    setMissionLoading(true);
    setMissionError(null);
    try {
      const res = await getDailyMission();
      setMission(res.data.data || res.data.mission || res.data);
    } catch {
      setMissionError(true);
    }
    setMissionLoading(false);
  };

  const fetchReadiness = async () => {
    setReadinessLoading(true);
    setReadinessError(null);
    try {
      const res = await getReadiness();
      setReadiness(res.data);
    } catch {
      setReadinessError(true);
    }
    setReadinessLoading(false);
  };

  const fetchStream = async () => {
    setStreamLoading(true);
    setStreamError(null);
    try {
      const res = await getRecommendationStream();
      setStream(res.data);
    } catch {
      setStreamError(true);
    }
    setStreamLoading(false);
  };

  const fetchGoalProgress = async () => {
    setGoalsLoading(true);
    setGoalsError(null);
    try {
      const res = await getGoalProgress();
      setGoalProgress(res.data);
    } catch {
      setGoalsError(true);
    }
    setGoalsLoading(false);
  };

  const fetchWeeklyReview = async () => {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await getWeeklyReview();
      setWeeklyReview(res.data);
    } catch {
      setReviewError(true);
    }
    setReviewLoading(false);
  };

  useEffect(() => {
    fetchMission();
    fetchReadiness();
    fetchStream();
    fetchGoalProgress();
    fetchWeeklyReview();

    listTasks()
      .then((res) => setTasks(res.data?.data || res.data || []))
      .catch(() => {});
    listNotes({ limit: 1 })
      .then((res) => setNotes(res.data?.data || res.data || []))
      .catch(() => {});
    getTodayReflection()
      .then((res) => setReflection(res.data))
      .catch(() => {});
    getTodayCase()
      .then((res) => setCaseData(res.data))
      .catch(() => {});
  }, []);

  const entries = useMemo(() => {
    if (!stream?.entries) return [];
    return stream.entries.filter(
      (e) => !e.dismissed && !acceptedRecs.has(e.recommendation || e._id)
    );
  }, [stream, acceptedRecs]);

  const insight = useMemo(
    () => deriveInsight({ readiness, tasks, caseData, notes, goalProgress }),
    [readiness, tasks, caseData, notes, goalProgress]
  );

  const trendDelta = useMemo(() => getTrendDelta(weeklyReview), [weeklyReview]);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const encouragement = reflection?.quote?.text || PROMPTS[new Date().getDay() % PROMPTS.length];
  const streak = caseData?.streak || 0;
  const contextLine = useMemo(
    () => deriveContextLine({ readiness, tasks, streak, trendDelta }),
    [readiness, tasks, streak, trendDelta]
  );
  const score = typeof readiness === 'object' ? readiness?.score : readiness;

  const handleAcceptRec = async (rec) => {
    const id = rec.recommendation || rec._id;
    setAcceptedRecs((prev) => new Set(prev).add(id));
    try {
      await transitionLifecycle(id, 'accepted');
    } catch {}
  };

  return (
    <Page>
      {/* TOP BAR — date only */}
      <div className="flex items-center justify-between py-4">
        <span className="text-xs font-medium tracking-wide text-gray-400">
          {dateLabel}
        </span>
        <span className="text-xs font-medium text-gray-400">
          <span className="accent-text">{firstName}</span>
        </span>
      </div>

      {/* READINESS RING — the monument. No greeting, no hero text. */}
      <div className="flex flex-col items-center py-12 text-center">
        {readinessLoading ? (
          <ScoreRingSkeleton />
        ) : readinessError || score == null ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
              <span className="text-5xl font-bold tabular-nums text-gray-300 dark:text-gray-600">—</span>
            </div>
            <p className="text-sm text-gray-400">Set up readiness to begin.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <LargeScoreRing score={score} />
            <p className="mt-4 max-w-sm text-base leading-relaxed text-gray-500 dark:text-gray-400">
              {contextLine}
            </p>
          </div>
        )}

        {/* MISSION — compact, directly below the ring */}
        <div className="mt-10 w-full text-left">
          {missionLoading ? (
            <MissionCardSkeleton />
          ) : missionError || !mission ? (
            <Card padding="md">
              <div className="flex flex-col items-center gap-3 py-3 text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nothing urgent today.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Clear schedule. Ready to explore or plan ahead.
                </p>
                <Link to="/planner">
                  <Button variant="primary" size="sm" iconRight={ArrowRight}>
                    Plan ahead
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card padding="md">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Today's mission
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug text-gray-900 dark:text-gray-100">
                {mission.goal}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {mission.estimatedCompletionTime || '~30 min'}
                <span className="mx-2">·</span>
                {getImpactConfig(mission.expectedReadinessImprovement).label}
                {mission.reasoning && mission.reasoning.length < 80 && (
                  <>
                    <span className="mx-2">·</span>
                    {mission.reasoning}
                  </>
                )}
              </p>

              {mission.tasks?.length > 0 && (
                <ol className="mt-4 space-y-2">
                  {mission.tasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-400 dark:border-gray-600 dark:text-gray-500">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{task}</span>
                    </li>
                  ))}
                </ol>
              )}

              <div className="mt-6">
                <Link to="/planner">
                  <Button variant="primary" size="sm" iconRight={ArrowRight}>
                    Begin
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* DAX INSIGHT — one Dax moment */}
      <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
      <div className="py-10">
        {insight ? <InsightCard insight={insight} /> : null}
      </div>

      {/* RECOMMENDATIONS — compact, tertiary */}
      {!streamError && (streamLoading || entries.length > 0) && (
        <>
          <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
          <div className="space-y-4 py-8">
            {streamLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              entries.slice(0, 3).map((rec) => {
                const id = rec.recommendation || rec._id;
                const accepted = acceptedRecs.has(id);
                return (
                  <div
                    key={id}
                    className="group flex items-center gap-3 py-1"
                  >
                    {rec.type && (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {rec.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    )}
                    <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
                      {rec.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-gray-400">
                      {rec.estimatedCompletionTime && rec.estimatedCompletionTime}
                      {rec.estimatedCompletionTime && rec.confidence != null && ' '}
                      {rec.confidence != null && `${Math.round(rec.confidence * 100)}%`}
                    </span>
                    {!accepted ? (
                      <button
                        onClick={() => handleAcceptRec(rec)}
                        className="shrink-0 text-gray-300 transition-colors hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400"
                        aria-label={`Accept ${rec.title}`}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ENCOURAGEMENT — footnote */}
      <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
      <div className="py-8">
        <p className="text-xs italic leading-relaxed text-gray-400">
          &ldquo;{encouragement}&rdquo;
        </p>
        {reflection?.quote?.author && (
          <p className="mt-1 text-[11px] text-gray-400">
            &mdash; {reflection.quote.author}
          </p>
        )}
      </div>
    </Page>
  );
}
