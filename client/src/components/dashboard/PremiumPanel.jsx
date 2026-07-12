import { Link } from 'react-router-dom';
import { Crown, Zap, Star, AlertTriangle, CheckCircle2, CalendarDays } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function FreeBanner() {
  return (
    <Link
      to="/subscribe"
      className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3 hover:bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20"
    >
      <Star className="h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          You're using DATAD Free
        </p>
        <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
          Upgrade to Pro for AI Resume Review, Company Intelligence and Unlimited AI
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white">
        Upgrade
      </span>
    </Link>
  );
}

function TrialBanner({ tierExpiresAt, daysLeft }) {
  const urgent = daysLeft !== null && daysLeft <= 3;

  if (urgent) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              ⚠ Your trial expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
              Upgrade now to keep AI Resume Review, Company Intelligence and all Pro features.
            </p>
          </div>
          <Link
            to="/subscribe"
            className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/60 dark:bg-indigo-950/30">
      <div className="flex items-start gap-3">
        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">🎉 DATAD Pro Trial</p>
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
              ACTIVE
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-indigo-700 dark:text-indigo-300">
            <span>All Pro features unlocked</span>
            {tierExpiresAt && <span>Expires: <strong>{fmtDate(tierExpiresAt)}</strong></span>}
            {daysLeft !== null && <span>Days remaining: <strong>{daysLeft}</strong></span>}
          </div>
          <p className="mt-1 text-xs text-indigo-600/80 dark:text-indigo-400/70">
            Upgrade before your trial ends to continue using AI features.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Link to="/subscribe" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-center text-xs font-bold text-white hover:bg-indigo-700">
            Upgrade
          </Link>
          <Link to="/subscribe" className="rounded-lg border border-indigo-300 px-3 py-1.5 text-center text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-400">
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

const AI_TOOLS_PRO = [
  { label: 'Summarise a note',    to: '/study/notes',      desc: 'AI extracts key points' },
  { label: 'AI Resume Review',    to: '/career/resume',    desc: 'Get specific feedback' },
  { label: 'Planner Suggestions', to: '/me/planner',       desc: "AI picks today's priorities" },
  { label: 'Semantic Search',     to: '/study/notes',      desc: 'Find anything in your notes' },
  { label: 'Company Prep',        to: '/career/companies', desc: 'AI-enhanced prep cards' },
  { label: 'Full AI Briefing',    to: '/briefing',         desc: 'Personalized to your goals' },
];

function ProPanel({ tierExpiresAt, daysLeft }) {
  const soonExpiry = daysLeft !== null && daysLeft <= 7;
  return (
    <div className="mb-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-yellow-50/60 p-5 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-yellow-900/10">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h2 className="font-semibold text-amber-800 dark:text-amber-300">Your AI tools</h2>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pro</span>
      </div>
      {tierExpiresAt && (
        <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${soonExpiry ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-white/60 text-gray-500 dark:bg-gray-900/40 dark:text-gray-400'}`}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            {soonExpiry ? `⚠ Renewal in ${daysLeft} day${daysLeft === 1 ? '' : 's'} · ` : '✓ Benefits active · Renewal: '}
            <strong>{fmtDate(tierExpiresAt)}</strong>
          </span>
          <Link to="/subscribe" className="ml-auto font-semibold underline underline-offset-2">Manage</Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {AI_TOOLS_PRO.map((item) => (
          <Link key={item.label} to={item.to}
            className="rounded-xl border border-amber-200/80 bg-white/70 px-3 py-2.5 hover:bg-white dark:border-amber-800/40 dark:bg-gray-900/50 dark:hover:bg-gray-900">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>
      <Link
        to="/subscribe"
        className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 px-3 py-2.5 hover:bg-purple-50 dark:border-purple-800/50 dark:bg-purple-900/10 dark:hover:bg-purple-900/20"
      >
        <Crown className="h-4 w-4 shrink-0 text-purple-500" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Go Max</p>
          <p className="text-[10px] text-purple-600/80 dark:text-purple-400/70">
            AI Career Advisor · Interview Simulator · Company Comparator · Priority AI
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white">
          Upgrade
        </span>
      </Link>
    </div>
  );
}

function MaxPanel({ tierExpiresAt, daysLeft }) {
  const soonExpiry = daysLeft !== null && daysLeft <= 7;
  return (
    <div className="mb-4 rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50 to-indigo-50/60 p-5 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-indigo-900/10">
      <div className="mb-3 flex items-center gap-2">
        <Crown className="h-4 w-4 text-purple-500" />
        <h2 className="font-semibold text-purple-800 dark:text-purple-300">⭐ DATAD Max</h2>
        <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">Max</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {['All AI Features Enabled', 'Priority AI', 'AI Career Advisor'].map((b) => (
          <span key={b} className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <CheckCircle2 className="h-3 w-3" /> {b}
          </span>
        ))}
      </div>
      {tierExpiresAt && (
        <div className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${soonExpiry ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-white/60 text-gray-500 dark:bg-gray-900/40 dark:text-gray-400'}`}>
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            {soonExpiry ? `⚠ Renewal in ${daysLeft} day${daysLeft === 1 ? '' : 's'} · ` : 'Renewal Date: '}
            <strong>{fmtDate(tierExpiresAt)}</strong>
          </span>
          <Link to="/subscribe" className="ml-auto font-semibold underline underline-offset-2">Manage</Link>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: 'AI Career Advisor',   to: '/study/ai-tools',   desc: 'Deep strategy sessions' },
          { label: 'Interview Simulator', to: '/study/ai-tools',   desc: 'Mock rounds, tailored to you' },
          { label: 'Company Comparator',  to: '/study/ai-tools',   desc: 'Two recruiters, one verdict' },
          { label: 'AI Resume Review',    to: '/career/resume',    desc: 'In-depth analysis' },
          { label: 'Semantic Search',     to: '/study/notes',      desc: 'Notes + company data' },
          { label: 'Full AI Briefing',    to: '/briefing',         desc: 'Max personalization' },
        ].map((item) => (
          <Link key={item.label} to={item.to}
            className="rounded-xl border border-purple-200/80 bg-white/70 px-3 py-2.5 hover:bg-white dark:border-purple-800/40 dark:bg-gray-900/50 dark:hover:bg-gray-900">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PremiumPanel() {
  const { tier, tierExpiresAt, daysLeft } = useSubscription();
  if (tier === 'trial') return <TrialBanner tierExpiresAt={tierExpiresAt} daysLeft={daysLeft} />;
  if (tier === 'pro')   return <ProPanel   tierExpiresAt={tierExpiresAt} daysLeft={daysLeft} />;
  if (tier === 'max')   return <MaxPanel   tierExpiresAt={tierExpiresAt} daysLeft={daysLeft} />;
  return <FreeBanner />;
}
