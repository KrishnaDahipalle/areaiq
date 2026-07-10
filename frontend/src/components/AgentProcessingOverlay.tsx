import React from 'react';

export const AgentProcessingOverlay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4 backdrop-blur-sm animate-pulse">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-teal-400 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
          Agent Execution Trace
        </div>
        <p className="text-[11px] text-slate-500 font-mono">
          Evaluating structural constraints against Hyderabad locality repositories...
        </p>
      </div>
    </div>
  );
};