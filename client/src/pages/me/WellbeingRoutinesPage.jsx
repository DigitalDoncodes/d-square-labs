import { Link } from 'react-router-dom';
import { Sunrise, ArrowRight } from 'lucide-react';
import { Page } from '../../components/common/motion';

const ROUTINES = [
  { title: 'Sleep is study time', body: 'Memory consolidates during sleep. Six hours before an exam beats two more hours of blurry revision.' },
  { title: 'Daylight before screens', body: 'Five minutes of morning daylight anchors your body clock and steadies energy all day.' },
  { title: 'Move between classes', body: 'A ten-minute walk resets attention better than scrolling. Use it before the subject you dread.' },
  { title: 'One win before bed', body: 'Write down one thing you did today — however small. Your journal is built for this.', link: { to: '/me/journal', label: 'Open Journal' } },
];

export default function WellbeingRoutinesPage() {
  return (
    <Page>
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Sunrise className="h-5 w-5 text-orange-500" /> Small routines, big difference
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tiny daily habits that compound into a calmer, sharper you over two years.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
        <ul className="space-y-5">
          {ROUTINES.map((t) => (
            <li key={t.title}>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>
              {t.link && (
                <Link to={t.link.to} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {t.link.label} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
