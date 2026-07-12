import { Link } from 'react-router-dom';
import { UPCOMING_FEATURES } from '../../utils/upcomingFeatures';
import { UPCOMING_WORKSPACE, upcomingPath } from '../../utils/workspaces';

// The "coming soon" modules that belong to one workspace, as muted cards.
export default function UpcomingGrid({ workspace }) {
  const features = UPCOMING_FEATURES.filter((f) => UPCOMING_WORKSPACE[f.slug] === workspace);
  if (features.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Coming soon</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.slug}
            to={upcomingPath(f.slug)}
            className="rounded-2xl border border-dashed border-gray-300 p-4 opacity-75 transition-opacity hover:opacity-100 dark:border-gray-700"
          >
            <f.icon className="mb-2 h-5 w-5 text-indigo-400" />
            <p className="text-sm font-semibold">{f.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{f.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
