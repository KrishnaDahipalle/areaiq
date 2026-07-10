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
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
        Strategic Fit Dossier
      </h3>
      <p className="text-xs italic text-slate-300 border-l-2 border-teal-500 pl-3 py-1.5 bg-slate-950/40 p-3 rounded-r-lg leading-relaxed font-medium">
        "{explanation.summary}"
      </p>
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
          Key Alignment Vectors ({explanation.matched_priority_count})
        </span>
        <div className="space-y-1.5">
          {explanation.explanation.map((reason, i) => (
            <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2.5 rounded border border-slate-800/40">
              <span className="text-teal-400 mt-0.5">✦</span>
              <span className="font-medium">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};