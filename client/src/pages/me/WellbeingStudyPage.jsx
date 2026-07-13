import { Link } from 'react-router-dom';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { Page } from '../../components/common/motion';

const STUDY_TECHNIQUES = [
  { title: 'Active recall', body: 'Close the book and write everything you remember, then check. Retrieval — not re-reading — is what builds memory.' },
  { title: 'Spaced repetition', body: 'Review a topic after 1 day, 3 days, then a week. Each spaced review roughly doubles how long it sticks.' },
  { title: 'The Feynman method', body: 'Explain the concept out loud as if teaching a junior. Wherever you stumble is exactly what you don\'t yet understand.' },
  { title: 'One-topic focus blocks', body: 'One subject, 25–45 minutes, phone in another room. Try the timer on the Focus page.', link: { to: '/study/focus', label: 'Open Focus' } },
];

export default function WellbeingStudyPage() {
  return (
    <Page className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Lightbulb className="h-5 w-5 text-amber-500" /> Study techniques that actually work
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Evidence-based methods used by top learners — not cramming.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
        <ul className="space-y-5">
          {STUDY_TECHNIQUES.map((t) => (
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
