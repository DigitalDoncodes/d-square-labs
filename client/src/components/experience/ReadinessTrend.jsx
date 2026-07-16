import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendIcon({ value, prev }) {
  if (prev == null) return <Minus className="h-4 w-4 text-gray-400" />;
  if (value > prev) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (value < prev) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

function ColorBand({ value }) {
  if (value >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Strong' };
  if (value >= 60) return { bg: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', label: 'On track' };
  if (value >= 40) return { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Building' };
  return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Needs focus' };
}

export default function ReadinessTrend({ readiness, previousReadiness }) {
  if (!readiness && readiness !== 0) return null;

  const score = typeof readiness === 'object' ? readiness.score : readiness;
  const prev = typeof previousReadiness === 'object' ? previousReadiness.score : previousReadiness;
  const colors = ColorBand(score);

  const components = readiness?.components || [];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Readiness</p>
          <p className="text-[10px] text-gray-400">Placement preparedness</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className={`text-[10px] font-medium ${colors.text}`}>/100</span>
          <TrendIcon value={score} prev={prev} />
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${colors.bg}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Label */}
      <p className={`text-xs font-medium ${colors.text}`}>
        {colors.label}
        {readiness?.nextAction && (
          <span className="ml-2 font-normal text-gray-400">· {readiness.nextAction}</span>
        )}
      </p>

      {/* Component breakdown */}
      {components.length > 0 && (
        <div className="mt-4 space-y-2">
          {components.map((comp) => (
            <div key={comp.key} className="flex items-center gap-2">
              <span className="w-20 text-[10px] text-gray-400 shrink-0">{comp.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    comp.points / comp.max >= 0.7 ? 'bg-emerald-400' :
                    comp.points / comp.max >= 0.4 ? 'bg-amber-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${(comp.points / comp.max) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-[10px] text-gray-500">
                {comp.points}/{comp.max}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
