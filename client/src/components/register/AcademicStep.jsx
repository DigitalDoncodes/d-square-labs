import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

const PROGRAMS = [
  { value: 'MBA',    label: 'MBA',    emoji: '🏛️' },
  { value: 'B.Tech', label: 'B.Tech', emoji: '⚙️' },
  { value: 'B.Sc',   label: 'B.Sc',   emoji: '🔬' },
  { value: 'B.Com',  label: 'B.Com',  emoji: '📊' },
  { value: 'BBA',    label: 'BBA',    emoji: '💼' },
  { value: 'BA',     label: 'BA',     emoji: '📖' },
  { value: 'M.Sc',   label: 'M.Sc',   emoji: '🧪' },
  { value: 'MBA',    label: 'MBA',    emoji: '🏛️' },
  { value: 'Law',    label: 'Law',    emoji: '⚖️' },
  { value: 'Medical', label: 'Medical', emoji: '🏥' },
  { value: 'Other',  label: 'Other',  emoji: '🎓' },
];

// Deduplicated
const UNIQUE_PROGRAMS = [
  { value: 'MBA',     label: 'MBA',     emoji: '🏛️' },
  { value: 'B.Tech',  label: 'B.Tech',  emoji: '⚙️' },
  { value: 'B.Sc',    label: 'B.Sc',    emoji: '🔬' },
  { value: 'B.Com',   label: 'B.Com',   emoji: '📊' },
  { value: 'BBA',     label: 'BBA',     emoji: '💼' },
  { value: 'BA',      label: 'BA',      emoji: '📖' },
  { value: 'M.Sc',    label: 'M.Sc',    emoji: '🧪' },
  { value: 'Law',     label: 'Law',     emoji: '⚖️' },
  { value: 'Medical', label: 'Medical', emoji: '🏥' },
  { value: 'Other',   label: 'Other',   emoji: '🎓' },
];

const SPEC_MAP = {
  MBA:     ['Finance', 'Marketing', 'HR', 'Operations', 'Analytics', 'Strategy', 'General'],
  'B.Tech':['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical'],
  'B.Sc':  ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  'B.Com': ['Accounting', 'Finance', 'Marketing', 'HR'],
  BBA:     ['Finance', 'Marketing', 'HR', 'Operations'],
  BA:      ['English', 'History', 'Political Science', 'Economics', 'Psychology'],
  'M.Sc':  ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'CS'],
  Law:     ['Corporate', 'Criminal', 'Intellectual Property', 'Family Law'],
  Medical: ['MBBS', 'BDS', 'Nursing', 'Pharmacy'],
  Other:   [],
};

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const inp = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

export default function AcademicStep() {
  const { register, watch, setValue } = useFormContext();
  const course = watch('course', '');
  const graduationYear = watch('graduationYear', '');
  const specialization = watch('specialization', '');

  const specs = SPEC_MAP[course] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Academic profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tell us what you're studying.</p>
      </div>

      {/* Program selection */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">Programme</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {UNIQUE_PROGRAMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => { setValue('course', p.value); setValue('specialization', ''); }}
              className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center transition-colors ${
                course === p.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
              <span className="text-base">{p.emoji}</span>
              <span className="text-[10px] font-semibold">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Specialization — only if course selected */}
      {specs.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
            Specialisation
          </label>
          <div className="flex flex-wrap gap-2">
            {specs.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue('specialization', s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  specialization === s
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* College */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Institution <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          {...register('college')}
          placeholder="e.g. IIM Bangalore, Delhi University…"
          className={inp}
        />
      </div>

      {/* Graduation Year */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Expected graduation year
        </label>
        <div className="flex flex-wrap gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setValue('graduationYear', String(y))}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                graduationYear === String(y)
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
