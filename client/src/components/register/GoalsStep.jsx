import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

const INTERESTS = [
  { label: 'Finance',        emoji: '📈' },
  { label: 'Marketing',      emoji: '📣' },
  { label: 'Consulting',     emoji: '🔍' },
  { label: 'Software / IT',  emoji: '💻' },
  { label: 'AI & Data',      emoji: '🤖' },
  { label: 'Operations',     emoji: '⚙️' },
  { label: 'HR & People',    emoji: '🤝' },
  { label: 'Entrepreneurship', emoji: '🚀' },
  { label: 'Research',       emoji: '🔬' },
  { label: 'Healthcare',     emoji: '🏥' },
  { label: 'Government',     emoji: '🏛️' },
  { label: 'Media & Content', emoji: '🎬' },
  { label: 'FMCG / Retail',  emoji: '🛒' },
  { label: 'Banking',        emoji: '🏦' },
  { label: 'Law',            emoji: '⚖️' },
];

export default function GoalsStep() {
  const { watch, setValue } = useFormContext();
  const selected = watch('careerInterests', []);

  const toggle = (label) => {
    const current = selected || [];
    if (current.includes(label)) {
      setValue('careerInterests', current.filter((i) => i !== label));
    } else if (current.length < 5) {
      setValue('careerInterests', [...current, label]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Career interests</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Which fields excite you? Pick up to 5.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(({ label, emoji }) => {
          const on = (selected || []).includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                on
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {selected?.length > 0 && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          {selected.length} selected — {selected.length < 5 ? `you can pick ${5 - selected.length} more` : 'limit reached'}
        </p>
      )}
    </motion.div>
  );
}
