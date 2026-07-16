import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  CalendarDays,
  Building2,
  FileText,
  Compass,
  PlusCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { listNotes } from '../../api/notes';
import { listTasks } from '../../api/tasks';
import { listCompanies } from '../../api/companies';
import { semanticSearch } from '../../api/aiTools';
import { WORKSPACE_TABS } from '../../utils/workspaces';

// Static destinations + quick actions, always searchable.
const NAV_ITEMS = [
  { type: 'nav', icon: Compass, label: 'Dashboard', to: '/' },
  ...Object.values(WORKSPACE_TABS)
    .flat()
    .map((t) => ({ type: 'nav', icon: Compass, label: t.label === 'Overview' ? null : t.label, to: t.to }))
    .filter((t) => t.label),
  { type: 'nav', icon: Compass, label: 'Morning Briefing', to: '/briefing' },
  { type: 'action', icon: PlusCircle, label: 'New note', to: '/study/notes/new' },
  { type: 'action', icon: PlusCircle, label: 'New task', to: '/me/planner' },
  { type: 'action', icon: PlusCircle, label: 'Add expense', to: '/me/finance' },
];

const TYPE_ICON = { note: BookOpen, task: CalendarDays, company: Building2, resume: FileText };

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef(null);
  const loadedRef = useRef(false);
  const aiTimerRef = useRef(null);

  // Lazy-load searchable content the first time the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.allSettled([listNotes(), listTasks(), listCompanies()]).then(([notes, tasks, companies]) => {
      const data = [];
      if (notes.status === 'fulfilled') {
        data.push(
          ...notes.value.data.map((n) => ({
            type: 'note',
            label: n.title,
            sub: n.subject,
            to: `/study/notes/${n._id}`,
          }))
        );
      }
      if (tasks.status === 'fulfilled') {
        data.push(
          ...tasks.value.data.map((t) => ({ type: 'task', label: t.title, sub: t.type, to: '/me/planner' }))
        );
      }
      if (companies.status === 'fulfilled') {
        data.push(
          ...companies.value.data.map((c) => ({
            type: 'company',
            label: c.name,
            sub: c.sector,
            to: `/career/companies/${c.slug}`,
          }))
        );
      }
      setItems(data);
    });
  }, [open]);

  // Debounced semantic search after 400ms of typing
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 3) { setAiResults([]); return; }
    clearTimeout(aiTimerRef.current);
    aiTimerRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const res = await semanticSearch(q);
        const hits = res.data?.results || res.data || [];
        setAiResults(hits.slice(0, 4).map((r) => ({
          type: r.type || 'note',
          label: r.title || r.name || 'Result',
          sub: r.excerpt ? r.excerpt.slice(0, 40) : r.type,
          to: r.url || (r.type === 'note' ? `/study/notes/${r._id}` : r.type === 'company' ? `/career/companies/${r.slug}` : '/briefing'),
          aiResult: true,
        })));
      } catch { setAiResults([]); }
      finally { setAiLoading(false); }
    }, 400);
    return () => clearTimeout(aiTimerRef.current);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = [...NAV_ITEMS, ...items];
    if (!q) return NAV_ITEMS.slice(0, 9);
    const textMatches = pool
      .filter((i) => i.label.toLowerCase().includes(q) || (i.sub || '').toLowerCase().includes(q))
      .slice(0, 5);
    return [...textMatches, ...aiResults].slice(0, 9);
  }, [query, items, aiResults]);

  useEffect(() => setActive(0), [results.length, query]);

  if (!open) return null;

  const go = (item) => {
    onClose();
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search notes, tasks, companies, pages…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && !aiLoading && <li className="px-3 py-6 text-center text-sm text-gray-400">No matches</li>}
          {aiLoading && results.length === 0 && (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching with Dax…
            </li>
          )}
          {results.map((item, i) => {
            const Icon = item.aiResult ? Sparkles : (TYPE_ICON[item.type] || item.icon || Compass);
            return (
              <li key={`${item.to}-${item.label}-${i}`}>
                <button
                  onClick={() => go(item)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                    i === active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${item.aiResult ? 'text-purple-500' : 'text-indigo-500'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.aiResult && <span className="ml-1 shrink-0 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">Dax</span>}
                  {item.sub && <span className="ml-auto shrink-0 max-w-[120px] truncate text-xs capitalize text-gray-400">{item.sub}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
