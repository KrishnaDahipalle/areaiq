import React from 'react';
import { LocalityScoringResponse } from '../lib/api';

interface AlternativesMatrixProps {
  alternatives: LocalityScoringResponse[];
}

export const AlternativesMatrix: React.FC<AlternativesMatrixProps> = ({ alternatives }) => {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
        Ranked Corridor Alternatives
      </h3>
      <div className="space-y-3">
        {alternatives.map((alt) => (
          <div key={alt.locality_id} className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-bold text-white">{alt.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{alt.locality_id.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-teal-400">{alt.global_suitability_score}%</div>
                <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded font-mono text-slate-400">Match Yield</span>
              </div>
            </div>
            
            {/* Horizontal Mini Score Bar Bars */}
            <div className="grid grid-cols-6 gap-1 pt-1 border-t border-slate-900">
              {Object.entries(alt.dimension_scores).map(([dim, val]) => (
                <div key={dim} className="text-center bg-slate-900/40 p-1 rounded border border-slate-800/30">
                  <div className="text-[8px] uppercase font-mono text-slate-500 truncate">{dim}</div>
                  <div className="text-[10px] font-bold font-mono text-slate-300">{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};