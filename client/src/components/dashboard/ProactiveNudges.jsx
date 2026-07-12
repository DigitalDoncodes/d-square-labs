import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, TrendingUp, BookOpen, Flame, Calendar, AlertTriangle } from 'lucide-react';

// Phase 3 — AI Proactivity
// Contextual nudges derived from dashboard data. Dismissed per-day via localStorage.

const DISMISS_KEY = 'datad_nudge_';
const todayKey = () => new Date().toISOString().slice(0, 10);

function buildNudges(data) {
  const list = [];

  // Upcoming deadline within 48 h
  if (data.upcoming?.length > 0) {
    const t = data.upcoming[0];
    const days = Math.round((new Date(t.dueDate) - Date.now()) / 86400000);
    if (days <= 2) {
      list.push({
        id: 'deadline-soon',
        icon: Calendar,
        color: 'amber',
        text: `"${t.title}" is due ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'in 2 days'}`,
        to: '/me/planner',
      });
    }
  }

  // Resume halfway there
  if (data.resumePct !== null && data.resumePct >= 30 && data.resumePct < 75) {
    list.push({
      id: 'resume-incomplete',
      icon: TrendingUp,
      color: 'indigo',
      text: `Resume ${data.resumePct}% done — completing it adds up to 35 readiness points`,
      to: '/career/resume',
    });
  }

  // Streak milestone
  if (data.streak >= 5 && data.streak % 5 === 0) {
    list.push({
      id: `streak-${data.streak}`,
      icon: Flame,
      color: 'orange',
      text: `${data.streak}-day case streak! You're in the top habit-builders.`,
      to: '/',
    });
  }

  // No notes at all
  if (data.notes !== undefined && data.notes.length === 0) {
    list.push({
      id: 'no-notes',
      icon: BookOpen,
      color: 'indigo',
      text: 'Start your note library — organized notes double your exam prep efficiency',
      to: '/study/notes/new',
    });
  }

  // Low readiness with companies available (implies they haven't prepped)
  if (data.readinessScore < 35 && data.readinessScore > 0) {
    list.push({
      id: 'low-readiness',
      icon: AlertTriangle,
      color: 'amber',
      text: `Readiness score ${data.readinessScore}/100 — placement season rewards early starters`,
      to: '/career/readiness',
    });
  }

  return list.slice(0, 2);
}

const CHIP = {
  amber:  'border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20',
  indigo: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-900/20',
  orange: 'border-orange-200 bg-orange-50 dark:border-orange-800/50 dark:bg-orange-900/20',
};
const ICON_C = {
  amber: 'text-amber-500', indigo: 'text-indigo-500', orange: 'text-orange-500',
};

export default function ProactiveNudges({ data }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DISMISS_KEY + todayKey()) || '[]'); }
    catch { return []; }
  });

  if (!data) return null;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY + todayKey(), JSON.stringify(next));
  };

  const nudges = buildNudges(data).filter((n) => !dismissed.includes(n.id));
  if (!nudges.length) return null;

  return (
    <div className="mb-4 space-y-2">
      {nudges.map((n) => {
        const Icon = n.icon;
        return (
          <div key={n.id} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${CHIP[n.color]}`}>
            <Icon className={`h-4 w-4 shrink-0 ${ICON_C[n.color]}`} />
            <Link to={n.to} className="min-w-0 flex-1 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {n.text}
            </Link>
            <button
              onClick={() => dismiss(n.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
