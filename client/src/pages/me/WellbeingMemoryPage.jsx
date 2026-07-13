import { Brain } from 'lucide-react';
import { Page } from '../../components/common/motion';

const MEMORY_TECHNIQUES = [
  { title: 'Chunking', body: 'Group long material into 3–5 item chunks. Frameworks like 4P or SWOT persist because they are pre-chunked.' },
  { title: 'Memory palace', body: 'Place items along a route you know well — your walk to class — and retrieve them by walking it mentally.' },
  { title: 'Make it weird', body: 'The brain keeps what is vivid and strange. An absurd mental image beats a neat, forgettable summary.' },
];

export default function WellbeingMemoryPage() {
  return (
    <Page className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Brain className="h-5 w-5 text-violet-500" /> Memory techniques
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Practical ways to make information stick for exams, cases, and presentations.
        </p>
      </div>
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
        <ul className="space-y-5">
          {MEMORY_TECHNIQUES.map((t) => (
            <li key={t.title}>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
