import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { getReadiness } from '../../api/readiness';
import ReadinessCard from '../../components/common/ReadinessCard';
import TierGate from '../../components/common/TierGate';
import { Page } from '../../components/common/motion';
import { RowSkeleton } from '../../components/common/Skeleton';

const COMPONENT_LINKS = {
  resume: '/career/resume',
  companies: '/career/companies',
  market: '/briefing',
  planner: '/me/planner',
};

const HOW_TO_IMPROVE = {
  resume: 'Fill in every section of your resume — experience, education, skills, projects, and certifications each add points.',
  companies: 'Save companies to your watchlist and read their prep cards. Each card you study counts toward your score.',
  market: 'Read daily briefings and bookmark stories. Market awareness points increase with each briefing you open.',
  planner: 'Add and complete interview-prep tasks in your planner. Completed tasks are weighted toward your score.',
};

export default function ReadinessPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getReadiness().then((res) => setData(res.data)).catch(() => {});
  }, []);

  const strengths = data?.components.filter((c) => c.max && c.points / c.max >= 0.75) ?? [];
  const weak = data?.components.filter((c) => c.max && c.points / c.max < 0.4) ?? [];
  const onTrack = data?.components.filter((c) => c.max && c.points / c.max >= 0.4 && c.points / c.max < 0.75) ?? [];

  return (
    <Page className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Placement readiness</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          One score, computed from what you have actually done — resume depth, company research, market awareness, and prep tasks.
        </p>
      </div>

      <ReadinessCard />

      {/* Score breakdown — Pro only */}
      <TierGate
        required="pro"
        description="See where your score comes from — your strengths, your next steps, and one clear action for each area."
      >
      {!data ? (
        <div className="mt-6 space-y-3">
          <RowSkeleton count={3} />
        </div>
      ) : (
        <div className="mt-6 space-y-5">

          {/* Strengths */}
          {strengths.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Strengths
              </h2>
              <ul className="space-y-2">
                {strengths.map((c) => (
                  <li key={c.key} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.points}/{c.max} pts · Keep it up</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {Math.round((c.points / c.max) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* On track */}
          {onTrack.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-4 w-4" /> On track
              </h2>
              <ul className="space-y-2">
                {onTrack.map((c) => (
                  <li key={c.key} className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.label}</p>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {c.points}/{c.max} pts
                      </span>
                    </div>
                    {c.hint && <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{c.hint}</p>}
                    <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">{HOW_TO_IMPROVE[c.key]}</p>
                    <Link
                      to={COMPONENT_LINKS[c.key] || '/'}
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
                    >
                      Improve this <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Needs attention */}
          {weak.length > 0 && (
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <Zap className="h-4 w-4" /> Growth opportunities
              </h2>
              <ul className="space-y-2">
                {weak.map((c) => (
                  <li key={c.key} className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{c.label}</p>
                      {c.points > 0 && (
                        <span className="text-xs font-semibold text-indigo-500">
                          {c.points}/{c.max} pts
                        </span>
                      )}
                    </div>
                    {c.hint && <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{c.hint}</p>}
                    <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">{HOW_TO_IMPROVE[c.key]}</p>
                    <Link
                      to={COMPONENT_LINKS[c.key] || '/'}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Start here <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* How scoring works */}
          <section className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Zap className="h-4 w-4 text-indigo-500" /> How to improve each area
            </h2>
            <ul className="space-y-3">
              {data.components.map((c) => (
                <li key={c.key} className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.label} <span className="font-normal text-gray-400">({c.points}/{c.max} pts)</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{HOW_TO_IMPROVE[c.key]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      </TierGate>
    </Page>
  );
}
