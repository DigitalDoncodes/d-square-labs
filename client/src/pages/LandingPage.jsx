import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, BrainCircuit, CalendarDays, Briefcase, FileText,
  Gauge, Users, Wallet, HeartHandshake, Sparkles, ArrowRight, ShieldCheck, Sun,
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Every box deep-links: login first, then land exactly on the feature clicked.
const FEATURES = [
  {
    icon: LayoutDashboard, color: 'text-indigo-400', glow: 'from-indigo-500/25',
    title: 'A calm daily home',
    desc: 'One focus, one encouragement, one next step — never a wall of widgets.',
    to: '/',
  },
  {
    icon: BookOpen, color: 'text-sky-400', glow: 'from-sky-500/25',
    title: 'Notes, in your words',
    desc: 'Your personal knowledge repository — paraphrase today’s class, keep it forever.',
    to: '/study/notes',
  },
  {
    icon: BrainCircuit, color: 'text-violet-400', glow: 'from-violet-500/25',
    title: 'Daily case practice',
    desc: 'One MBA case every morning with frameworks — the habit that compounds.',
    to: '/',
  },
  {
    icon: Briefcase, color: 'text-amber-400', glow: 'from-amber-500/25',
    title: 'Company prep cards',
    desc: 'What they do, what they ask, what they pay — one page per recruiter.',
    to: '/career/companies',
  },
  {
    icon: Gauge, color: 'text-emerald-400', glow: 'from-emerald-500/25',
    title: 'Placement readiness',
    desc: 'A live 0–100 score built from what you’ve actually done, with the next fix.',
    to: '/career',
  },
  {
    icon: FileText, color: 'text-rose-400', glow: 'from-rose-500/25',
    title: 'Resume builder',
    desc: 'Build it once, keep it sharp — AI review when you want a second pair of eyes.',
    to: '/career/resume',
  },
  {
    icon: CalendarDays, color: 'text-orange-400', glow: 'from-orange-500/25',
    title: 'Planner & deadlines',
    desc: 'Assignments, projects and prep tasks in one quiet list that feeds your day.',
    to: '/me/planner',
  },
  {
    icon: Users, color: 'text-cyan-400', glow: 'from-cyan-500/25',
    title: 'Your batch, one place',
    desc: 'Feed, events, people and shared memories — you’re not doing this alone.',
    to: '/community',
  },
  {
    icon: Wallet, color: 'text-lime-400', glow: 'from-lime-500/25',
    title: 'Money, explained simply',
    desc: 'SIPs, compounding, emergency funds — financial confidence before your first salary.',
    to: '/me/finance',
  },
  {
    icon: HeartHandshake, color: 'text-pink-400', glow: 'from-pink-500/25',
    title: 'Wellbeing',
    desc: 'Breathing exercises, study techniques and a human to talk to when it’s heavy.',
    to: '/me/wellbeing',
  },
  {
    icon: Sparkles, color: 'text-fuchsia-400', glow: 'from-fuchsia-500/25',
    title: 'AI where it helps',
    desc: 'Summaries, plans and guidance appear inside your work — never as homework.',
    to: '/study/notes',
  },
  {
    icon: Sun, color: 'text-yellow-400', glow: 'from-yellow-500/25',
    title: 'A better you, daily',
    desc: 'Journal, streaks and small wins — six months from now, you’ll feel the difference.',
    to: '/me/journal',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};

export default function LandingPage() {
  useDocumentTitle('DATAD — Your student OS');
  const navigate = useNavigate();

  const enter = (to) => navigate(`/login?next=${encodeURIComponent(to)}`);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Ambient animated background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-3xl"
          animate={{ x: [0, 60, -30, 0], y: [0, 40, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-1/5 top-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-3xl"
          animate={{ x: [0, -50, 20, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-sky-600/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
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
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-14 text-center sm:pt-20">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Built by your batch, for your batch · No ads · No tracking
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-4xl font-black leading-tight tracking-tight sm:text-6xl"
        >
          Your entire MBA,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
            one calm place.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg"
        >
          Notes, placements, planning, money and wellbeing — everything a B-school student
          juggles, designed to make you a little better every single day. Not louder. Better.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
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
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-16 sm:pt-24">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
        >
          Tap anything — it&rsquo;s waiting for you inside
        </motion.p>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((f) => (
            <motion.button
              key={f.title}
              variants={item}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => enter(f.to)}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/70 p-5 text-left backdrop-blur transition-colors hover:border-gray-600"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${f.glow} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <f.icon className={`mb-3 h-6 w-6 ${f.color}`} />
              <p className="mb-1 font-semibold">{f.title}</p>
              <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-indigo-400">
                Open after login <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-10"
        >
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
        </motion.div>
        <p className="mt-10 text-xs text-gray-600">
          A D² Labs product · Independent, community-backed software · Your data belongs to you
        </p>
      </section>
    </div>
  );
}
