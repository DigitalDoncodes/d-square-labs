import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Mail, Phone, Sparkles, Brain, Code2,
  Heart, ShieldCheck, Compass, Target, Zap, Trophy, TrendingUp,
  Quote, BookOpen, Building2, Users, CheckCircle, Globe,
  Lightbulb, Cpu, GraduationCap, Palette,
} from 'lucide-react';

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function CreatorPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">

      {/* Dot matrix background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.3) 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] bg-purple-600/8 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to DATAD
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Digital Don
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-16 text-center">
        <div className={`transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Avatar with glow */}
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 rounded-full bg-indigo-500 blur-3xl opacity-30 animate-pulse" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 text-5xl font-black text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-slate-900">
              DD
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-400 mb-3">
            Dhatchina Moorthi · akA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-400">Digital Don</span>
          </p>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white">
            Builder. Psychology grad.<br className="sm:hidden" />{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">One-person product studio.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
            Self-taught engineer from <strong className="text-white">Tamil Nadu, India</strong> — built{' '}
            <span className="font-bold text-white">DATAD</span> from scratch during placement season{' '}
            because no tool existed that could hold a student's entire life. Notes, career prep, finance, community,{' '}
            and an AI companion — all in one place, no ads, no tracking.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 italic leading-relaxed">
            "Technology should reduce complexity, not create it."
          </p>

          {/* Contact bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:digitaldoncodes@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm font-medium text-slate-200 hover:border-indigo-500/50 hover:text-white hover:bg-slate-800/90 transition-all group">
              <Mail className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> digitaldoncodes@gmail.com
            </a>
            <a href="tel:+919363632214"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm font-medium text-slate-200 hover:border-indigo-500/50 hover:text-white hover:bg-slate-800/90 transition-all group">
              <Phone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> +91 93636 32214
            </a>
            <a href="https://instagram.com/technerdalert" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-sm font-medium text-slate-200 hover:border-indigo-500/50 hover:text-white hover:bg-slate-800/90 transition-all group">
              <Globe className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> @technerdalert
            </a>
          </div>
        </div>
      </section>

      {/* ── The Origin Story ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="bg-gradient-to-br from-indigo-500/8 via-slate-900 to-purple-500/8 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-slate-800/20 pointer-events-none">
              <Quote className="w-40 h-40" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
              The origin story
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-5 mb-4">Why I started building</h2>

            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                I was a psychology student at <strong className="text-white">KCLAS</strong> watching my batchmates — and myself —{' '}
                juggle placement prep across WhatsApp groups, spreadsheets, Google Docs, and sticky notes. 
                Every campus had the same problem: the tools students needed were scattered, and the ones that existed{' '}
                were built for corporate HR, not for a 21-year-old trying to figure out their career.
              </p>
              <p>
                So I started building. No CS degree, no mentor, no funding — just a laptop and the conviction that{' '}
                software for students should feel different. Notes came first because every student needed them.{' '}
                Then a planner. Then a resume builder during placement season because the timing couldn't wait.
              </p>
              <p>
                One thing led to another. Finance tracking. Company prep. A community. Dax —{' '}
                an AI companion that doesn't try to replace you but works alongside you.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-indigo-500/10 flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-400 italic">
                "The best tools are built by the people who most need them. I was that student."
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── What I Believe ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="text-center mb-10 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
              The philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Three pillars that guide every decision</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Not buzzwords — actual engineering constraints I built the platform around.</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            {
              icon: Cpu, title: 'Technology',
              tagline: 'Full-stack, self-taught',
              gradient: 'from-cyan-500/10 via-slate-900 to-slate-900', border: 'border-cyan-500/30',
              desc: 'I learned by building. Every line of DATAD — from the Express server to the React components to the AI pipeline — was written by one person who refused to wait for someone else to make what students needed.',
            },
            {
              icon: Brain, title: 'Psychology',
              tagline: 'Cognitive design, not dark patterns',
              gradient: 'from-purple-500/10 via-slate-900 to-slate-900', border: 'border-purple-500/30',
              desc: 'My psychology background isn\'t a credential on a wall — it\'s in every decision. Sustainable tools need restorative breaks, not addictive loops. That\'s why DATAD has no infinite scroll and no engagement metrics.',
            },
            {
              icon: Heart, title: 'Impact',
              tagline: 'Student-first, always',
              gradient: 'from-rose-500/10 via-slate-900 to-slate-900', border: 'border-rose-500/30',
              desc: 'This platform exists to make campus life measurably better. If a feature doesn\'t help a student prepare better, save time, or feel less overwhelmed, it doesn\'t belong here. No bloat. No growth hacks.',
            },
          ].map((p, idx) => (
            <Reveal key={idx} delay={idx * 120}>
              <div className={`bg-gradient-to-b ${p.gradient} border ${p.border} p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group`}>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 w-fit shadow-md mb-4 group-hover:scale-110 transition-transform">
                  <p.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">{p.tagline}</span>
                <h3 className="text-base font-bold text-white mt-1 mb-3">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The principles */}
        <Reveal>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-base font-bold text-white mb-4 text-center">Lines I won't cross</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { icon: ShieldCheck, title: 'No ads. Ever.', body: 'A platform with ads answers to advertisers — optimizing for your attention, not your outcomes. DATAD will never carry one.' },
                { icon: Compass, title: 'No data selling', body: 'Your notes, finances, and reflections are not inventory. Nothing you put into DATAD is ever mined or shared.' },
                { icon: Zap, title: 'No engagement tricks', body: 'No streaks, no infinite feeds, no gamified retention. Success is you needing the platform less, not more.' },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="mx-auto mb-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 w-fit">
                    <item.icon className="w-4 h-4 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── The Journey ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="text-center mb-12 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
              The journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">From hostel room to student OS</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Built incrementally — each feature responding to what the batch actually needed that semester.</p>
          </div>
        </Reveal>

        <div className="relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/60 before:via-purple-500/60 before:to-rose-500/60">
          {[
            { year: '2022', title: 'The frustration', icon: Lightbulb, detail: 'Watching batchmates — and myself — juggle placement prep across WhatsApp, spreadsheets, and sticky notes. Wondering why no single tool existed for a student\'s entire campus life.' },
            { year: '2023', title: 'First lines of code', icon: Code2, detail: 'Started building alone. No CS degree, no framework, no plan — just a laptop and the belief that student software should feel fundamentally different from corporate tools.' },
            { year: '2024', title: 'Notes & Planner ship', icon: BookOpen, detail: 'Shared a note-taking app with a few classmates. They stayed. Then a planner. The first sign that this wasn\'t just a project — it was something people actually needed.' },
            { year: 'Early 2025', title: 'Finance & Resume', icon: TrendingUp, detail: 'Expense tracking, budget visualisation, and an ATS-ready resume builder. Built around placement season because that\'s when students need it most and no existing tool understood campus context.' },
            { year: 'Mid 2025', title: 'Career Hub & Dax', icon: Target, detail: 'Company prep, readiness scoring, daily case studies, live market briefing — and Dax, the AI companion. The platform stopped being a collection of tools and became a real operating system for student life.' },
            { year: 'Now', title: 'v1.0 — Public Launch', icon: Sparkles, detail: 'A complete Student Operating System: study, career, community, finance, wellbeing, and AI. One deliberately calm, ad-free space. Built by a student, for students — still maintained by the same person who wrote the first line.' },
          ].map((item, idx) => (
            <Reveal key={idx} delay={idx * 80}>
              <div className={`relative flex items-start gap-6 sm:gap-12 mb-8 ${idx % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-indigo-500 z-10 flex items-center justify-center shadow-[0_0_14px_rgba(99,102,241,0.5)]">
                  <item.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="ml-16 sm:ml-0 sm:w-1/2 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md hover:border-indigo-500/30 transition-all shadow-lg">
                  <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    {item.year}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-3">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── What's Inside ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="text-center mb-10 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              What I built
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">The platform, feature by feature</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Everything here was built because a student needed it — including me.</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, title: 'Notes & Study', desc: 'Rich text notes with tagging, search, and workspaces. Built first because every student needed it.' },
            { icon: Palette, title: 'Planner & Calendar', desc: 'Weekly planning, deadlines, and a calendar that actually understands semester rhythms.' },
            { icon: TrendingUp, title: 'Finance Tracker', desc: 'Expense logging, budgets, ROI calculators — built because campus money management is real.' },
            { icon: Building2, title: 'Career Hub', desc: 'Company prep, readiness scoring, placement drives, internship tracking. The feature that started it all.' },
            { icon: Users, title: 'Community', desc: 'Announcements, discussions, events, skill exchange, and a nostalgia archive for campus memories.' },
            { icon: Brain, title: 'Dax AI Companion', desc: 'Not a chatbot — an AI that knows your context, reviews your resume, plans your week, and adapts to you.' },
          ].map((item, idx) => (
            <Reveal key={idx} delay={idx * 60}>
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-md hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 w-fit mb-3">
                  <item.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── The T.A.D Signature ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mb-24">
        <Reveal>
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
              The name
            </span>
            <h2 className="text-2xl font-black text-white mt-5 mb-3">Why "DATAD"?</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              The letters <strong className="text-white">T, A, D</strong> at the heart of{' '}
              <strong className="text-white">DA<span className="text-indigo-300">T</span>AD</strong>{' '}
              are my initials: <strong className="text-white">T. A. Dhatchina Moorthi</strong>.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-3 max-w-lg mx-auto">
              The acronym — <strong className="text-slate-200">D</strong>iscover,{' '}
              <strong className="text-slate-200">A</strong>spire,{' '}
              <strong className="text-slate-200">T</strong>ransform,{' '}
              <strong className="text-slate-200">A</strong>chieve,{' '}
              <strong className="text-slate-200">D</strong>evelop — is the journey{' '}
              I wanted every student to take. The name came first. The meaning came from building it.
            </p>
            <div className="mt-5 pt-5 border-t border-slate-800">
              <p className="text-xs text-slate-500 italic">D² Labs — Technology × Psychology × Impact</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Closing Quote ── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mb-24 text-center">
        <Reveal>
          <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-slate-800/20 pointer-events-none"><Heart className="w-32 h-32" /></div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Still building
            </div>
            <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
              "DATAD was created out of a desire for a unified digital sanctuary — a place where raw analytical data meets human craftsmanship, and where productivity and deliberate rest coexist seamlessly. A student's life is not a funnel. It deserves better software."
            </blockquote>
            <div className="pt-2">
              <h4 className="text-sm font-bold text-white">T. A. Dhatchina Moorthi</h4>
              <p className="text-xs text-slate-500 mt-0.5">Psychology · KCLAS · Self-taught builder</p>
              <p className="text-xs text-slate-600 mt-1">Tamil Nadu, India · D² Labs</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <footer className="relative z-10 text-center space-y-6">
        <Reveal>
          <div className="max-w-lg mx-auto px-6">
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              Built by a student. For students.
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-5 mb-3">Try what I built</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Free for the student community. No ads. No tracking. Your data stays yours — always.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-indigo-950/50">
                <span>Join the platform</span><ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/support"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm font-bold hover:border-indigo-500/50 hover:text-white transition-all">
                <Sparkles className="w-4 h-4 text-amber-400" /> Back DATAD
              </Link>
            </div>
            <p className="mt-6 text-[11px] text-slate-600">Independent · Ad-free · Community-backed · D² Labs</p>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}
