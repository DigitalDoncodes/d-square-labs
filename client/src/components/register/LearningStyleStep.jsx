import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const ALL_SKILLS = [
  'Excel', 'Power BI', 'Python', 'SQL', 'Java', 'JavaScript', 'R',
  'Financial Modelling', 'Valuation', 'Accounting', 'Statistics',
  'Data Analysis', 'Machine Learning', 'Prompt Engineering',
  'Communication', 'Leadership', 'Presentation', 'Negotiation',
  'Marketing', 'SEO', 'Content Writing', 'Social Media',
  'Project Management', 'Agile / Scrum', 'Operations',
  'Research', 'Case Solving', 'Strategy',
  'Public Speaking', 'Critical Thinking',
];

export default function LearningStyleStep() {
  const { watch, setValue } = useFormContext();
  const selected = watch('skills', []);
  const [query, setQuery] = useState('');

  const filtered = ALL_SKILLS.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (skill) => {
    const current = selected || [];
    if (current.includes(skill)) {
      setValue('skills', current.filter((s) => s !== skill));
    } else if (current.length < 10) {
      setValue('skills', [...current, skill]);
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your skills</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          What are you already good at? Pick up to 10.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pb-1">
        {filtered.map((skill) => {
          const on = (selected || []).includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                on
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>

      {(selected || []).length > 0 && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400">
          {selected.length} selected
          {selected.length >= 10 && ' — limit reached'}
        </p>
      )}
    </motion.div>
  );
}
