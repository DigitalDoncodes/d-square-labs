import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Compass, Target, Zap, Trophy, TrendingUp, RefreshCw, 
  ShieldCheck, Cpu, Brain, Heart, ArrowRight, User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const [activeNode, setActiveNode] = useState(null);
  
  // Stages tracking array for the 5 columns in the matrix header
  const [columnStages, setColumnStages] = useState([0, 0, 0, 0, 0]);

  // Updated DATAD Pillar Mappings
  const letters = [
    {
      char: 'D',
      color: 'text-cyan-400',
      shadow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]',
      topNode: {
        id: 'discover',
        title: 'D — Discover',
        subtitle: 'Uncover Insight',
        desc: 'Explore knowledge, opportunities, and yourself.',
        icon: Compass,
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-500/10 text-cyan-400'
      }
    },
    {
      char: 'A',
      color: 'text-cyan-300',
      shadow: 'drop-shadow-[0_0_12px_rgba(103,232,249,0.5)]',
      bottomNode: {
        id: 'aspire',
        title: 'A — Aspire',
        subtitle: 'Set Purpose',
        desc: 'Dream bigger and set meaningful goals.',
        icon: Target,
        border: 'border-blue-500/50',
        bg: 'bg-blue-500/10 text-blue-400'
      }
    },
    {
      char: 'T',
      color: 'text-purple-400',
      shadow: 'drop-shadow-[0_0_14px_rgba(192,132,252,0.6)]',
      topNode: {
        id: 'transform',
        title: 'T — Transform',
        subtitle: 'Apply Knowledge',
        desc: 'Convert learning into practical skills.',
        icon: Zap,
        border: 'border-purple-500/50',
        bg: 'bg-purple-500/10 text-purple-400'
      }
    },
    {
      char: 'A',
      color: 'text-amber-300',
      shadow: 'drop-shadow-[0_0_12px_rgba(252,211,77,0.5)]',
      bottomNode: {
        id: 'achieve',
        title: 'A — Achieve',
        subtitle: 'Realize Success',
        desc: 'Reach academic and career milestones.',
        icon: Trophy,
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/10 text-amber-400'
      }
    },
    {
      char: 'D',
      color: 'text-amber-400',
      shadow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]',
      topNode: {
        id: 'develop',
        title: 'D — Develop',
        subtitle: 'Continuous Growth',
        desc: 'Continue growing personally and professionally.',
        icon: TrendingUp,
        border: 'border-rose-500/50',
        bg: 'bg-rose-500/10 text-rose-400'
      }
    }
  ];

  const pillars = [
    {
      icon: Cpu,
      title: 'Architectural Philosophy',
      tagline: 'Engineering Meets Intuition',
      description: 'DATAD is designed as an external digital brain. By combining real-time data persistence, fluid user experience, and structured milestone tracking, it turns goal setting into daily action.',
      gradient: 'from-cyan-500/10 via-slate-900 to-slate-900',
      border: 'border-cyan-500/30'
    },
    {
      icon: Brain,
      title: 'Psychological Balance',
      tagline: 'Cognitive Recovery by Design',
      description: 'High achievement requires mental restoration. DATAD embeds nostalgia, entertainment archives, and reflective tools alongside productivity systems for sustainable personal growth.',
      gradient: 'from-purple-500/10 via-slate-900 to-slate-900',
      border: 'border-purple-500/30'
    },
    {
      icon: ShieldCheck,
      title: 'Personal Data Sovereignty',
      tagline: 'Your Private Growth Vault',
      description: 'Your goals, notes, finances, and reflections belong exclusively to you. DATAD operates with zero tracking, ensuring your personal evolution remains private.',
      gradient: 'from-amber-500/10 via-slate-900 to-slate-900',
      border: 'border-amber-500/30'
    }
  ];

  const milestones = [
    { year: 'Phase I', label: 'Discover & Aspire', detail: 'Foundational tools for capturing raw knowledge, managing schedules, and mapping long-term aspirations.' },
    { year: 'Phase II', label: 'Transform & Execute', detail: 'Integrating actionable task systems, financial trackers, and skill-building workbenches.' },
    { year: 'Phase III', label: 'Achieve & Relive', detail: 'Tracking major milestones paired with cognitive recovery and nostalgia archives.' },
    { year: 'Phase IV', label: 'Develop & Scale', detail: 'Deploying personal AI sync to connect daily actions with long-term career evolution.' }
  ];

  useEffect(() => {
    startRevealSequence();
  }, []);

  const startRevealSequence = () => {
    setColumnStages([0, 0, 0, 0, 0]);
    const delayPerColumn = 1800; 

    letters.forEach((_, colIdx) => {
      const baseDelay = colIdx * delayPerColumn;

      setTimeout(() => {
        setColumnStages((prev) => {
          const next = [...prev];
          next[colIdx] = 1;
          return next;
        });
      }, baseDelay + 100);

      setTimeout(() => {
        setColumnStages((prev) => {
          const next = [...prev];
          next[colIdx] = 2;
          return next;
        });
      }, baseDelay + 600);

      setTimeout(() => {
        setColumnStages((prev) => {
          const next = [...prev];
          next[colIdx] = 3;
          return next;
        });
      }, baseDelay + 1800);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden flex flex-col justify-between">
      
      {/* 🟢 Dot Matrix Canvas Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(168, 85, 247, 0.4) 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Radial Core Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 pt-10 text-center px-6 flex items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The DATAD Growth Matrix</span>
        </div>

        <button
          onClick={startRevealSequence}
          title="Replay Aura Sequence"
          className="p-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 text-slate-400 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* 🧠 Main Dot Matrix Canvas */}
      <main className="relative z-10 max-w-6xl mx-auto w-full min-h-[580px] my-auto flex flex-col items-center justify-center px-4">
        
        {/* 1. TOP NODES ROW */}
        <div className="w-full grid grid-cols-5 gap-2 sm:gap-4 mb-6 z-20">
          {letters.map((item, idx) => {
            const stage = columnStages[idx];
            const isCardRevealed = stage >= 3;

            return (
              <div key={`top-${idx}`} className="flex justify-center">
                {item.topNode ? (
                  <div
                    onClick={() => isCardRevealed && setActiveNode(activeNode?.id === item.topNode.id ? null : item.topNode)}
                    className={`p-3 sm:p-4 rounded-2xl bg-slate-900/90 border ${item.topNode.border} backdrop-blur-md shadow-xl cursor-pointer hover:scale-105 transition-all duration-700 w-full max-w-[190px] ${
                      isCardRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${item.topNode.bg}`}>
                        <item.topNode.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-white truncate">{item.topNode.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.topNode.desc}</p>
                  </div>
                ) : (
                  <div className="h-12" />
                )}
              </div>
            );
          })}
        </div>

        {/* 2. DOTTED VECTOR CONNECTORS & CENTRAL WORD */}
        <div className="relative w-full py-8 flex items-center justify-center">
          
          {/* SVG Dotted Matrix Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line
              x1="10%" y1="50%" x2="10%" y2="0%"
              stroke="rgba(34, 211, 238, 0.9)" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
              style={{
                strokeDashoffset: columnStages[0] >= 2 ? '0' : '200',
                opacity: columnStages[0] >= 2 ? 1 : 0,
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
              }}
            />
            <line
              x1="30%" y1="50%" x2="30%" y2="100%"
              stroke="rgba(103, 232, 249, 0.9)" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(103,232,249,0.7)]"
              style={{
                strokeDashoffset: columnStages[1] >= 2 ? '0' : '200',
                opacity: columnStages[1] >= 2 ? 1 : 0,
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
              }}
            />
            <line
              x1="50%" y1="50%" x2="50%" y2="0%"
              stroke="rgba(192, 132, 252, 1)" strokeWidth="3.5" strokeDasharray="4 10" strokeLinecap="round"
              className="drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
              style={{
                strokeDashoffset: columnStages[2] >= 2 ? '0' : '200',
                opacity: columnStages[2] >= 2 ? 1 : 0,
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
              }}
            />
            <line
              x1="70%" y1="50%" x2="70%" y2="100%"
              stroke="rgba(252, 211, 77, 0.9)" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]"
              style={{
                strokeDashoffset: columnStages[3] >= 2 ? '0' : '200',
                opacity: columnStages[3] >= 2 ? 1 : 0,
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
              }}
            />
            <line
              x1="90%" y1="50%" x2="90%" y2="0%"
              stroke="rgba(251, 191, 36, 0.9)" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]"
              style={{
                strokeDashoffset: columnStages[4] >= 2 ? '0' : '200',
                opacity: columnStages[4] >= 2 ? 1 : 0,
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s'
              }}
            />
          </svg>

          {/* 🌟 Center Core: DATAD Letter Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-4 w-full text-center">
            {letters.map((item, idx) => {
              const stage = columnStages[idx];
              const isLetterVisible = stage >= 1;

              return (
                <div key={idx} className="flex flex-col items-center justify-center">
                  {item.topNode ? (
                    <div className={`w-2.5 h-2.5 rounded-full bg-purple-400 mb-2 transition-all duration-300 ${
                      stage >= 2 ? 'scale-100 opacity-100 animate-ping shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'scale-0 opacity-0'
                    }`} />
                  ) : (
                    <div className="h-4" />
                  )}

                  <div className={`p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-500 transform ${
                    isLetterVisible ? 'scale-100 opacity-100 translate-y-0 shadow-purple-900/20' : 'scale-50 opacity-0 translate-y-4'
                  }`}>
                    <span className={`text-4xl sm:text-7xl font-black ${item.color} ${item.shadow}`}>
                      {item.char}
                    </span>
                  </div>

                  {item.bottomNode ? (
                    <div className={`w-2.5 h-2.5 rounded-full bg-purple-400 mt-2 transition-all duration-300 ${
                      stage >= 2 ? 'scale-100 opacity-100 animate-ping shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'scale-0 opacity-0'
                    }`} />
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. BOTTOM NODES ROW */}
        <div className="w-full grid grid-cols-5 gap-2 sm:gap-4 mt-6 z-20">
          {letters.map((item, idx) => {
            const stage = columnStages[idx];
            const isCardRevealed = stage >= 3;

            return (
              <div key={`bottom-${idx}`} className="flex justify-center">
                {item.bottomNode ? (
                  <div
                    onClick={() => isCardRevealed && setActiveNode(activeNode?.id === item.bottomNode.id ? null : item.bottomNode)}
                    className={`p-3 sm:p-4 rounded-2xl bg-slate-900/90 border ${item.bottomNode.border} backdrop-blur-md shadow-xl cursor-pointer hover:scale-105 transition-all duration-700 w-full max-w-[190px] ${
                      isCardRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${item.bottomNode.bg}`}>
                        <item.bottomNode.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-white truncate">{item.bottomNode.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{item.bottomNode.desc}</p>
                  </div>
                ) : (
                  <div className="h-12" />
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* 📖 Popup Inspector Card */}
      {activeNode && (
        <div className="relative z-30 max-w-xl mx-auto px-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/95 border border-purple-500/40 p-5 rounded-2xl backdrop-blur-xl shadow-2xl flex justify-between items-start gap-4">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{activeNode.subtitle}</span>
              <h3 className="text-base font-bold text-white mt-0.5">{activeNode.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5">{activeNode.desc}</p>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 📜 SCROLL DOWN SECTION 1: Architectural Pillars */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mt-24 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">The Core Pillars</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Built from the ground up to unify personal management, cognitive clarity, and emotional wellbeing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className={`bg-gradient-to-b ${p.gradient} border ${p.border} p-6 sm:p-8 rounded-3xl backdrop-blur-md shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 w-fit text-purple-400 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">{p.tagline}</span>
                    <h3 className="text-lg font-bold text-white mt-1">{p.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 📜 SCROLL DOWN SECTION 2: Interactive Timeline / Roadmap */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mt-28 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Ecosystem Evolution</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            From an individual productivity toolkit to a multi-faceted personal intelligence platform.
          </p>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-cyan-500/50 before:to-transparent">
          {milestones.map((m, idx) => (
            <div 
              key={idx}
              className={`relative flex items-center gap-6 sm:gap-12 ${
                idx % 2 === 0 ? 'sm:flex-row-reverse' : ''
              }`}
            >
              <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-purple-400 z-10 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />

              <div className="ml-12 sm:ml-0 sm:w-1/2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md hover:border-purple-500/40 transition-all shadow-lg">
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {m.year}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-3">{m.label}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📜 SCROLL DOWN SECTION 3: Founder Statement */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 mt-28 text-center">
        <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-800 pointer-events-none">
            <Heart className="w-32 h-32 opacity-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>Crafted with Purpose</span>
          </div>

          <blockquote className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
            "DATAD was created out of a desire for a unified digital sanctuary—a place where raw analytical data meets human craftsmanship, and where productivity and deliberate rest coexist seamlessly."
          </blockquote>

          <div className="pt-2">
            <h4 className="text-sm font-bold text-white">T. A. Dhatchina Moorthi</h4>
            <p className="text-xs text-slate-500 mt-0.5">Founder & Systems Architect, DATAD</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 text-center mt-20">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-xl shadow-purple-950/50"
        >
          <span>Enter the DATAD Ecosystem</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </footer>
    </div>
  );
}