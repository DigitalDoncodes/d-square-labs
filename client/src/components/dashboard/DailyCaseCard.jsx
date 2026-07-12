import { useEffect, useState } from 'react';
import { BrainCircuit, CheckCircle2, Flame, ChevronDown, Loader2 } from 'lucide-react';
import { getTodayCase, solveCase } from '../../api/dailyCase';
import AIBadge from '../common/AIBadge';

const CATEGORY_LABEL = {
  strategy: 'Strategy',
  marketing: 'Marketing',
  operations: 'Operations',
  finance: 'Finance',
  hr: 'HR',
  guesstimate: 'Guesstimate',
  other: 'Case',
};

// The daily habit anchor: read a mini case, think, reveal the framework.
export default function DailyCaseCard() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [framework, setFramework] = useState('');
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    getTodayCase()
      .then((res) => {
        setData(res.data);
        setFramework(res.data.case?.framework || '');
      })
      .catch(() => {});
  }, []);

  if (!data?.case) return null;
  const { case: c, solved, streak } = data;

  const handleSolve = async () => {
    if (solving) return;
    setSolving(true);
    try {
      const res = await solveCase(c._id);
      setFramework(res.data.framework);
      setData((d) => ({ ...d, solved: true, streak: res.data.streak }));
    } catch {
      /* keep the card usable even if the call fails */
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="card-hover mb-4 rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="h-4 w-4 text-indigo-500" /> Daily MBA case
        </h2>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
              <Flame className="h-3 w-3" /> {streak}-day streak
            </span>
          )}
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {CATEGORY_LABEL[c.category] || 'Case'}
          </span>
        </div>
      </div>

      <p className="font-semibold">{c.title}</p>
      <p className={`mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 ${expanded ? '' : 'line-clamp-3'}`}>
        {c.scenario}
      </p>
      {!expanded && c.scenario.length > 220 && (
        <button onClick={() => setExpanded(true)} className="mt-1 flex items-center gap-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          Read full case <ChevronDown className="h-3 w-3" />
        </button>
      )}

      <p className="mt-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-3 text-sm font-medium">
        🎯 {c.question}
      </p>

      {solved ? (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Solved — nice thinking!
          </p>
          {framework && (
            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-800/60 dark:bg-emerald-900/20">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Suggested framework
                </p>
                <AIBadge provider="AI" />
              </div>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{framework}</p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleSolve}
          disabled={solving}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
        >
          {solving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Revealing framework…</>
          ) : (
            "I've thought it through — reveal the framework"
          )}
        </button>
      )}
    </div>
  );
}
