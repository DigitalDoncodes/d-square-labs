import { motion } from 'framer-motion';

const STEP_META = [
  { label: 'Welcome',  emoji: '👋' },
  { label: 'Account',  emoji: '🔐' },
  { label: 'Academic', emoji: '🎓' },
  { label: 'Interests',emoji: '🎯' },
  { label: 'Skills',   emoji: '⚡' },
  { label: 'Goals',    emoji: '🏆' },
  { label: 'Exp',      emoji: '💼' },
  { label: 'Review',   emoji: '✅' },
];

export default function ProgressBar({ currentStep, totalSteps }) {
  const pct = Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{STEP_META[currentStep]?.label}</span>
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="h-full rounded-full bg-indigo-500"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between">
        {STEP_META.slice(0, totalSteps).map((meta, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all duration-300 ${
                  done
                    ? 'bg-indigo-600 text-white'
                    : active
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                }`}
              >
                {done ? '✓' : meta.emoji}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
