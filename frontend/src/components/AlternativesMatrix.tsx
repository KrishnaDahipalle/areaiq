import React from 'react';
import { LocalityScoringResponse } from '../lib/api';

interface AlternativesMatrixProps {
  alternatives: LocalityScoringResponse[];
}

export const AlternativesMatrix: React.FC<AlternativesMatrixProps> = ({ alternatives }) => {
  return (
    <div className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-slate-800/60 p-5 shadow-xl shadow-slate-950/50">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-800/80 pb-2 flex items-center justify-between">
        <span>Ranked Corridor Alternatives</span>
        <span className="text-[10px] font-mono text-teal-400/80 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">Core Match</span>
      </h3>
      <div className="space-y-3">
        {alternatives.map((alt) => (
          <div 
            key={alt.locality_id} 
            className="bg-slate-950/40 backdrop-blur-sm border border-slate-850 hover:border-teal-500/30 p-3.5 rounded-lg flex flex-col gap-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white transition-colors duration-300 hover:text-teal-400">{alt.name}</div>
                <div className="text-[9px] text-slate-500 font-mono tracking-wider mt-0.5">{alt.locality_id.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold font-mono text-emerald-400">{alt.global_suitability_score}%</div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">Match Yield</span>
              </div>
            </div>
            
            {/* Horizontal Mini Score Bar Bars */}
            <div className="grid grid-cols-6 gap-1 pt-1.5 border-t border-slate-900/60">
              {Object.entries(alt.dimension_scores).map(([dim, val]) => (
                <div key={dim} className="text-center bg-slate-950/50 p-1 rounded border border-slate-850">
                  <div className="text-[8px] uppercase font-mono text-slate-500 truncate">{dim}</div>
                  <div className="text-[10px] font-extrabold font-mono text-slate-300 mt-0.5">{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};