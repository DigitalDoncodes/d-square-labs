import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BrainCircuit, CalendarDays, Briefcase, FileText,
  Gauge, Users, Wallet, HeartHandshake, Sparkles, ArrowRight, ShieldCheck, Sun,
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Stagger } from '../components/common/motion';

// Every box deep-links: login first, then land exactly on the feature clicked.
const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'A calm daily home',
    desc: 'One focus, one encouragement, one next step — never a wall of widgets.',
    to: '/',
  },
  {
    icon: BookOpen,
    title: 'Notes, in your words',
    desc: 'Your personal knowledge repository — paraphrase today’s class, keep it forever.',
    to: '/study/notes',
  },
  {
    icon: BrainCircuit,
    title: 'Daily case practice',
    desc: 'One MBA case every morning with frameworks — the habit that compounds.',
    to: '/',
  },
  {
    icon: Briefcase,
    title: 'Company prep cards',
    desc: 'What they do, what they ask, what they pay — one page per recruiter.',
    to: '/career/companies',
  },
  {
    icon: Gauge,
    title: 'Placement readiness',
    desc: 'A live 0–100 score built from what you’ve actually done, with the next fix.',
    to: '/career',
  },
  {
    icon: FileText,
    title: 'Resume builder',
    desc: 'Build it once, keep it sharp — AI review when you want a second pair of eyes.',
    to: '/career/resume',
  },
  {
    icon: CalendarDays,
    title: 'Planner & deadlines',
    desc: 'Assignments, projects and prep tasks in one quiet list that feeds your day.',
    to: '/me/planner',
  },
  {
    icon: Users,
    title: 'Your batch, one place',
    desc: 'Feed, events, people and shared memories — you’re not doing this alone.',
    to: '/community',
  },
  {
    icon: Wallet,
    title: 'Money, explained simply',
    desc: 'SIPs, compounding, emergency funds — financial confidence before your first salary.',
    to: '/me/finance',
  },
  {
    icon: HeartHandshake,
    title: 'Wellbeing',
    desc: 'Breathing exercises, study techniques and a human to talk to when it’s heavy.',
    to: '/me/wellbeing',
  },
  {
    icon: Sparkles,
    title: 'AI where it helps',
    desc: 'Summaries, plans and guidance appear inside your work — never as homework.',
    to: '/study/notes',
  },
  {
    icon: Sun,
    title: 'A better you, daily',
    desc: 'Journal, streaks and small wins — six months from now, you’ll feel the difference.',
    to: '/me/journal',
  },
];

// Motion here is CSS-driven (`animate-in` / `.stagger`, see index.css), the
// same as the rest of the app. This page previously animated in with
// framer-motion, whose JS loop is throttled in a backgrounded tab — the hero,
// the badge and all twelve cards would sit at opacity:0 and the landing page
// rendered blank. CSS keyframes always settle visible.

export default function LandingPage() {
  useDocumentTitle('DATAD — Your student OS');
  const navigate = useNavigate();

  const enter = (to) => navigate(`/login?next=${encodeURIComponent(to)}`);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* A single quiet field behind the type. The three drifting colour blobs
          that used to live here were decoration on a 14–22s loop — calm is the
          product's first promise, so the page should sit still and let the
          words carry it. */}
      <div className="pointer-events-none absolute inset-0">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <p className="text-xl font-black tracking-tight text-indigo-400">DATAD</p>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Join your batch
          </Link>
        </div>
      </header>

      {/* Hero */}
      <Stagger className="relative z-10 mx-auto max-w-4xl px-6 pt-14 text-center sm:pt-20">
        <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5" /> Built by your batch, for your batch · No ads · No tracking
        </p>
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Your entire MBA,
          <br />
          <span className="text-indigo-400">one calm place.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg">
          Notes, placements, planning, money and wellbeing — everything a B-school student
          juggles, designed to make you a little better every single day. Not louder. Better.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white transition-colors duration-150 hover:bg-indigo-500"
          >
            Enter the portal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/register"
            className="rounded-2xl border border-gray-700 px-7 py-3.5 text-base font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
          >
            Create an account
          </Link>
        </div>
      </Stagger>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <p className="animate-in mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Tap anything — it&rsquo;s waiting for you inside
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <button
              key={f.title}
              onClick={() => enter(f.to)}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-5 text-left transition-colors hover:border-gray-600 active:scale-[0.98]"
            >
              <f.icon className="mb-3 h-6 w-6 text-gray-500 transition-colors group-hover:text-indigo-400" />
              <p className="mb-1 font-semibold">{f.title}</p>
              <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-indigo-400">
                Open after login <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20 text-center">
        <div className="animate-in rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.07] p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Six months from now, you&rsquo;ll be glad you started today.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-400">
            More organised, more placement-ready, more financially aware — and a lot less stressed.
            That&rsquo;s the whole point of DATAD.
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-10 text-xs text-gray-600">
          A D² Labs product · Independent, community-backed software · Your data belongs to you
        </p>
      </section>
    </div>
  );
}
