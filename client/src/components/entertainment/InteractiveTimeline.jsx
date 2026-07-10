import { Calendar } from 'lucide-react';

export default function InteractiveTimeline({ activeYear, onSelectYear }) {
  const eras = [
    { label: 'All eras', year: 'all' },
    { label: '1940s – 60s', year: '1940' },
    { label: '1980s', year: '1980' },
    { label: '1990s', year: '1990' },
    { label: '2000s', year: '2000' },
    { label: '2010s', year: '2010' },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Calendar className="h-4 w-4 text-indigo-500" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Timeline explorer
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {eras.map((era) => {
          const isActive = activeYear === era.year;
          return (
            <button
              key={era.year}
              onClick={() => onSelectYear(era.year)}
              className={`rounded-xl px-3 py-2 text-center text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {era.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
