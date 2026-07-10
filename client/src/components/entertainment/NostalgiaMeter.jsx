import { Heart } from 'lucide-react';

export default function NostalgiaMeter({ score = 85 }) {
  return (
    <div className="w-full max-w-xs rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
          <Heart className="h-4 w-4 text-rose-500" /> Nostalgia
        </span>
        <span className="text-xl font-bold tabular-nums">
          {score} <span className="text-xs font-normal text-gray-400">/ 100</span>
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-1.5 text-right text-[10px] text-gray-400">
        From views, likes &amp; memories
      </p>
    </div>
  );
}
