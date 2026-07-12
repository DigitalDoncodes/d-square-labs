import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap } from 'lucide-react';

export default function ComingSoonPage({ feature }) {
  const Icon = feature.icon;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-lg">
        <Icon className="h-8 w-8 text-white" />
      </div>

      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
        Coming soon · {feature.phase}
      </span>

      <h1 className="mt-3 text-3xl font-bold">{feature.name}</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">{feature.tagline}</p>

      <div className="mx-auto mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-5 text-left dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-3 text-sm font-semibold">What's planned</p>
        <ul className="space-y-2">
          {feature.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-sm text-gray-400">
        This module is on the roadmap and under active development.
      </p>

      <div className="mt-4 flex justify-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <Link
          to="/support"
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Zap className="h-4 w-4" /> Back the roadmap
        </Link>
      </div>
    </div>
  );
}
