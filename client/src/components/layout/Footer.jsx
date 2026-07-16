import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const CONTACT = 'digitaldoncodes@gmail.com';
const mailto = (subject) => `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}`;

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 py-6 print:hidden dark:border-gray-800">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 text-xs text-gray-400">
        <Link
          to="/support"
          className="inline-flex items-center gap-1.5 font-medium text-gray-500 hover:text-indigo-500 dark:text-gray-400"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Independent, community-backed software — Back DATAD
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href={mailto('DATAD — Feedback')} className="hover:text-gray-600 dark:hover:text-gray-300">Feedback</a>
          <a href={mailto('DATAD — Bug report')} className="hover:text-gray-600 dark:hover:text-gray-300">Report a bug</a>
          <a href={mailto('DATAD — Feature request')} className="hover:text-gray-600 dark:hover:text-gray-300">Feature request</a>
          <Link to="/about" className="hover:text-gray-600 dark:hover:text-gray-300">About</Link>
          <Link to="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-600 dark:hover:text-gray-300">Terms</Link>
        </nav>
        <p>
          A{' '}
          <Link to="/creator" className="font-medium text-indigo-500 hover:underline dark:text-indigo-400">
            D² Labs
          </Link>{' '}
          product · No tracking · No ads · Your data belongs to you
        </p>
      </div>
    </footer>
  );
}
