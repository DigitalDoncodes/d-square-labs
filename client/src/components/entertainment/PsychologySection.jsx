import { Brain, Heart, Sparkles, Smile, Anchor } from 'lucide-react';

const cards = [
  { key: 'whyWeLovedThis', label: 'Emotional connection', icon: Heart, color: 'text-rose-500' },
  { key: 'emotionalDevelopment', label: 'Childhood development', icon: Sparkles, color: 'text-indigo-500' },
  { key: 'humorStyle', label: 'Humor & imagination', icon: Smile, color: 'text-emerald-500' },
  { key: 'memoryAnchors', label: 'Memory anchors', icon: Anchor, color: 'text-amber-500' },
];

export default function PsychologySection({ psychology }) {
  if (!psychology) return null;

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Why we loved this</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The psychology and emotional impact behind the nostalgia
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(({ key, label, icon: Icon, color }) => {
          const value = psychology[key];
          if (!value) return null;
          return (
            <div
              key={key}
              className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950/40"
            >
              <div className={`mb-1.5 flex items-center gap-2 text-sm font-semibold ${color}`}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
