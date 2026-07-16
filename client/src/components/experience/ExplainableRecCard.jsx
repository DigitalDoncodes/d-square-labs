import { useState } from 'react';
import {
  Info, Target, TrendingUp, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Clock, BrainCircuit,
} from 'lucide-react';
import { recordFeedback, transitionLifecycle } from '../../api/experience';

const TYPE_COLORS = {
  'focus': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'priority': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'study-session': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'ai-action': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'weak-topic-alert': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'placement-readiness': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'resume-suggestion': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'interview-suggestion': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'deadline-alert': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'planner-suggestion': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'wellness-suggestion': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

function TypeBadge({ type }) {
  const colorClass = TYPE_COLORS[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  const label = type?.replace(/-/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) || type;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-[10px] text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-6 text-right text-[10px] font-medium text-gray-500">{value}</span>
    </div>
  );
}

export default function ExplainableRecCard({ rec, compact }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [lifecycle, setLifecycle] = useState(rec.lifecycleState || rec.lifecycle?.state || 'generated');

  const handleFeedback = async (type) => {
    try {
      await recordFeedback(rec._id, type);
      setFeedbackGiven(type);
    } catch {
      // silent
    }
  };

  const handleAction = async (action) => {
    if (action === 'accept') {
      try {
        await transitionLifecycle(rec._id, 'accepted');
        setLifecycle('accepted');
      } catch {}
    } else if (action === 'dismiss') {
      try {
        await transitionLifecycle(rec._id, 'dismissed');
        setLifecycle('dismissed');
      } catch {}
    }
  };

  const v2 = rec.v2Scores;
  const goalAlign = rec.goalAlignment;
  const isDismissed = lifecycle === 'dismissed' || lifecycle === 'completed';

  if (isDismissed && !expanded) return null;

  return (
    <div className={`rounded-xl border transition-all ${
      expanded
        ? 'border-indigo-200 dark:border-indigo-800/60 shadow-sm'
        : 'border-gray-100 dark:border-gray-800'
    } bg-white dark:bg-gray-900 overflow-hidden`}>
      {/* Main row */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TypeBadge type={rec.type} />
              {goalAlign?.goal && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Target className="h-2.5 w-2.5" />
                  {goalAlign.goal}
                </span>
              )}
              {lifecycle !== 'generated' && (
                <span className="text-[10px] uppercase text-gray-400">{lifecycle}</span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {rec.title}
            </p>
            {!compact && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {rec.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Quick stats when collapsed */}
        {!compact && !expanded && (
          <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {rec.estimatedCompletionTime || '~15 min'}
            </span>
            {rec.confidence && (
              <span className="flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" />
                {rec.confidence}% confidence
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded explainability section */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 dark:border-gray-800">
          {/* Why this */}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Info className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Why am I seeing this?
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
              {rec.reason || 'Based on your recent activity and profile.'}
            </p>
          </div>

          {/* Impact */}
          {rec.expectedImpact && (
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  What happens if I complete it?
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {rec.expectedImpact}
              </p>
            </div>
          )}

          {/* Goal alignment */}
          {goalAlign && (
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                  Which goal does this support?
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {goalAlign.goal
                  ? `This supports your "${goalAlign.goal}" goal (${goalAlign.relevance}% relevance).`
                  : 'General recommendation based on your platform activity.'}
              </p>
            </div>
          )}

          {/* V2 Scores */}
          {v2 && (
            <details className="group">
              <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                Score breakdown
              </summary>
              <div className="mt-2 space-y-1.5">
                <ScoreBar label="Relevance" value={v2.personalRelevance} color="bg-indigo-400" />
                <ScoreBar label="Goal align" value={v2.goalAlignment} color="bg-purple-400" />
                <ScoreBar label="Urgency" value={v2.urgency} color="bg-amber-400" />
                <ScoreBar label="Impact" value={v2.impact} color="bg-emerald-400" />
                <ScoreBar label="Confidence" value={v2.confidence} color="bg-blue-400" />
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-20 text-[10px] font-semibold text-gray-500 shrink-0">Composite</span>
                  <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-500 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${v2.composite}%` }} />
                  </div>
                  <span className="w-6 text-right text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{v2.composite}</span>
                </div>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {lifecycle === 'generated' && (
              <>
                <button
                  onClick={() => handleAction('accept')}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Accept & start
                </button>
                <button
                  onClick={() => handleAction('dismiss')}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Dismiss
                </button>
              </>
            )}

            {/* Feedback */}
            <div className="ml-auto flex items-center gap-1">
              {feedbackGiven ? (
                <span className="text-[10px] text-gray-400">{feedbackGiven}</span>
              ) : (
                <>
                  <button
                    onClick={() => handleFeedback('helpful')}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-500 dark:hover:bg-gray-800"
                    title="Helpful"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback('not-helpful')}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                    title="Not helpful"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
