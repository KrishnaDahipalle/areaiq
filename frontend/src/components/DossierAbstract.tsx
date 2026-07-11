import React from 'react';
import { ExplanationResponsePayload } from '../lib/api';

interface DossierAbstractProps {
  explanation: ExplanationResponsePayload | null;
}

export const DossierAbstract: React.FC<DossierAbstractProps> = ({ explanation }) => {
  if (!explanation) {
    return <div className="text-xs text-slate-600 font-mono p-4">Awaiting analytical explanation data stream...</div>;
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-slate-800/60 p-5 shadow-xl shadow-slate-950/50 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800/80 pb-2 flex items-center justify-between">
        <span>Strategic Fit Dossier</span>
        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Alignment Analysis</span>
      </h3>
      <p className="text-xs italic text-slate-300 border-l-2 border-teal-500 pl-3 py-2.5 bg-slate-950/30 p-3 rounded-r-lg leading-relaxed font-medium shadow-inner shadow-black/45">
        "{explanation.summary}"
      </p>
      <div className="space-y-2.5">
        <span className="text-[9px] font-mono uppercase text-slate-500 tracking-widest block font-bold">
          Key Alignment Vectors ({explanation.matched_priority_count})
        </span>
        <div className="space-y-2">
          {explanation.explanation.map((reason, i) => (
            <div 
              key={i} 
              className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 hover:bg-slate-950/60 p-3 rounded border border-slate-850 hover:border-teal-500/20 transition-all duration-300 transform hover:translate-x-0.5"
            >
              <span className="text-teal-400 mt-0.5">✦</span>
              <span className="font-medium leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};