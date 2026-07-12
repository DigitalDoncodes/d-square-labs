import React from 'react';
import { Sparkles, Calendar, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EntertainmentDashboardWidget() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 p-6 border border-purple-500/20 shadow-lg hover:border-purple-500/40 transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Throwback Friday</h4>
            <p className="text-[11px] text-slate-400">Take a 5-minute study break</p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
          Featured
        </span>
      </div>

      <div className="flex gap-4 items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
        <div className="w-16 h-16 rounded-lg bg-purple-900/40 flex items-center justify-center text-2xl shrink-0">
          📺
        </div>
        <div>
          <h5 className="text-sm font-semibold text-white">Dexter's Laboratory</h5>
          <p className="text-xs text-slate-400 line-clamp-1">Explore the secret laboratory under the bedroom floor.</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3 h-3" /> 96% Nostalgia</span>
            <span>1996 - 2003</span>
          </div>
        </div>
      </div>

      <Link
        to="/community/archive/cartoons/dexters-laboratory"
        className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
      >
        <span>Relive Memory</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}