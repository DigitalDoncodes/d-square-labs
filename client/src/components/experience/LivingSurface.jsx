import { useState, useEffect, useMemo } from 'react';
import {
  Target, Sparkles, BookOpen, Briefcase, TrendingUp, Star, ArrowRight,
  Calendar, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDailyMission, getRecommendationStream, getReadiness } from '../../api/experience';
import { listTasks } from '../../api/tasks';
import { listNotes } from '../../api/notes';
import { getTodayReflection } from '../../api/reflection';
import { getTodayCase } from '../../api/dailyCase';
import { daysUntil } from '../../utils/dateUtils';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../common/motion';
import { Skeleton } from '../common/Skeleton';

import AICoach from './AICoach';
import DailyMissionCard from './DailyMissionCard';
import WeeklyReview from './WeeklyReview';
import ExplainableRecCard from './ExplainableRecCard';
import ReadinessTrend from './ReadinessTrend';
import GoalProgress from './GoalProgress';
import SmartCard from './SmartCard';
import { useAdaptiveLayout } from './AdaptiveWorkspace';

const PROMPTS = [
  'One page today is better than ten pages someday.',
  'You don\'t have to do everything today. Just the next right thing.',
  'Progress is quiet. Keep going.',
  'Showing up today is enough. The rest follows.',
  'Small steps, taken daily, become the person you\'re becoming.',
  'You\'ve handled every hard day so far. Today is no different.',
  'Comparison is noise. Your pace is the plan.',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function SmallWin({ streak, note }) {
  if (streak > 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Target className="h-4 w-4 text-amber-500" />
        </span>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          <span className="font-medium">{streak}-day streak.</span>{' '}
          <span className="text-gray-500 dark:text-gray-400">You keep showing up — that&rsquo;s the whole secret.</span>
        </p>
      </div>
    );
  }
  if (note) {
    return (
      <Link
        to={`/study/notes/${note._id}`}
        className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-gray-800/80 dark:bg-gray-900 dark:hover:border-indigo-700"
      >
        <BookOpen className="h-4 w-4 shrink-0 text-indigo-500" />
        <p className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
          <span className="text-gray-500 dark:text-gray-400">A recent win:&nbsp;</span>
          <span className="font-medium">{note.title}</span>
        </p>
      </Link>
    );
  }
  return null;
}

function ExperienceToolkit() {
  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        Experience toolkit
      </p>
      <div className="space-y-2">
        <Link to="/career/stories" className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 text-sm transition-colors hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <Star className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="font-medium text-gray-800 dark:text-gray-200">STAR Story Bank</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
        </Link>
        <Link to="/career/pivot" className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 text-sm transition-colors hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="font-medium text-gray-800 dark:text-gray-200">Career Pivot Tracker</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
        </Link>
        <Link to="/me/finance/roi" className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5 text-sm transition-colors hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-medium text-gray-800 dark:text-gray-200">ROI Calculator</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}

const WIDGETS = {
  'ai-coach': { component: 'ai-coach', cols: 'col-span-1' },
  'daily-mission': { component: 'daily-mission', cols: 'col-span-1 lg:col-span-2' },
  'readiness': { component: 'readiness', cols: 'col-span-1' },
  'goal-progress': { component: 'goal-progress', cols: 'col-span-1' },
  'weekly-review': { component: 'weekly-review', cols: 'col-span-1 lg:col-span-2' },
};

export default function LivingSurface() {
  useDocumentTitle('Home');
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState(null);
  const [stream, setStream] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [reflection, setReflection] = useState(null);
  const [caseData, setCaseData] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getDailyMission(),
      getRecommendationStream(),
      getReadiness(),
      listTasks(),
      listNotes({ limit: 1 }),
      getTodayReflection(),
      getTodayCase(),
    ]);

    const [missionRes, streamRes, readinessRes, tasksRes, notesRes, reflectionRes, caseRes] = results;

    if (missionRes.status === 'fulfilled') setMission(missionRes.data.data || missionRes.data.mission || missionRes.data);
    if (streamRes.status === 'fulfilled') setStream(streamRes.data);
    if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.data);
    if (tasksRes.status === 'fulfilled') setTasks(tasksRes.data?.data || tasksRes.data || []);
    if (notesRes.status === 'fulfilled') setNotes(notesRes.data?.data || notesRes.data || []);
    if (reflectionRes.status === 'fulfilled') setReflection(reflectionRes.data);
    if (caseRes.status === 'fulfilled') setCaseData(caseRes.data);

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const studentContext = useMemo(() => ({
    readinessScore: readiness?.score ?? null,
    goals: user?.goals || [],
    dailyMission: mission,
    overdueTasks: tasks.filter((t) => daysUntil(t.dueDate) < 0).length,
  }), [readiness, user, mission, tasks]);

  const { order } = useAdaptiveLayout(studentContext);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const encouragement = reflection?.quote?.text || PROMPTS[new Date().getDay() % PROMPTS.length];

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const entries = stream?.entries?.filter((e) => !e.dismissed) || [];
  const todayEntries = entries.slice(0, 3);

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{dateLabel}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, <span className="accent-text">{firstName}</span>
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {encouragement}
          {reflection?.quote?.author && <span className="text-gray-400"> — {reflection.quote.author}</span>}
        </p>
      </div>

      {/* Adaptive widget grid */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
        {order.map((widgetKey) => {
          if (widgetKey === 'daily-mission' && mission) {
            return (
              <div key="daily-mission" className="lg:col-span-2 xl:col-span-3">
                <DailyMissionCard mission={mission} />
              </div>
            );
          }
          if (widgetKey === 'ai-coach') {
            return (
              <div key="ai-coach" className="xl:col-span-2">
                <AICoach
                  mission={mission}
                  readiness={readiness}
                  name={firstName}
                />
              </div>
            );
          }
          if (widgetKey === 'readiness') {
            return (
              <div key="readiness">
                <ReadinessTrend readiness={readiness} />
              </div>
            );
          }
          if (widgetKey === 'goal-progress') {
            return (
              <div key="goal-progress">
                <GoalProgress />
              </div>
            );
          }
          if (widgetKey === 'weekly-review') {
            return (
              <div key="weekly-review" className="lg:col-span-2 xl:col-span-3">
                <WeeklyReview onRefresh={fetchAll} />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Recommendations */}
      {todayEntries.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Recommended for you
              </p>
            </div>
            <Link
              to="/briefing"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          {todayEntries.map((entry) => (
            <ExplainableRecCard key={entry.recommendation || entry._id} rec={entry} />
          ))}
        </div>
      )}

      {/* Second row */}
      <div className="mt-4 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {/* Small win */}
        <SmallWin streak={caseData?.streak} note={notes[0]} />

        {/* Experience toolkit */}
        {user?.studentType === 'experienced' && <ExperienceToolkit />}
      </div>
    </Page>
  );
}
