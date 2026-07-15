import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

const GOALS = [
  { label: 'Internship',       emoji: '🏢' },
  { label: 'Placement',        emoji: '💼' },
  { label: 'Skill Building',   emoji: '⚡' },
  { label: 'Resume Polish',    emoji: '📄' },
  { label: 'Mock Interviews',  emoji: '🎤' },
  { label: 'Networking',       emoji: '🤝' },
  { label: 'Higher Studies',   emoji: '🎓' },
  { label: 'Entrepreneurship', emoji: '🚀' },
  { label: 'Certifications',   emoji: '🏆' },
  { label: 'Research',         emoji: '🔬' },
  { label: 'Financial Literacy', emoji: '💰' },
  { label: 'Projects',         emoji: '🛠️' },
];

export default function ChallengesStep() {
  const { watch, setValue } = useFormContext();
  const selected = watch('goals', []);

  const toggle = (label) => {
    const current = selected || [];
    if (current.includes(label)) {
      setValue('goals', current.filter((g) => g !== label));
    } else if (current.length < 5) {
      setValue('goals', [...current, label]);
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">What do you want?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          What do you want DATAD to help you achieve? Pick up to 5.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {GOALS.map(({ label, emoji }) => {
          const on = (selected || []).includes(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                on
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span className="text-xs leading-tight">{label}</span>
              {on && (
                <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {(selected || []).length > 0 && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          {selected.length} selected — {selected.length < 5 ? `${5 - selected.length} more allowed` : 'limit reached'}
        </p>
      )}
    </motion.div>
  );
}
