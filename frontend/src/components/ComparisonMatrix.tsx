import React from 'react';
import { ComparisonResponsePayload } from '../lib/api';

interface ComparisonMatrixProps {
  payload: ComparisonResponsePayload | null;
  comparisonTarget: string;
  onTargetChange: (targetId: string) => void;
  alternatives: Array<{ locality_id: string; name: string }>;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  payload,
  comparisonTarget,
  onTargetChange,
  alternatives
}) => {
  if (!payload) {
    return <div className="text-xs text-slate-600 font-mono p-4">Recalculating comparison variance indices...</div>;
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md space-y-4">
      {/* Dynamic Selector Header row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Cross-Corridor Parametric Divergence
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Contrast Target:</span>
          <select 
            value={comparisonTarget}
            onChange={(e) => onTargetChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-teal-400 outline-none font-bold cursor-pointer focus:border-teal-500"
          >
            {alternatives.map((alt) => (
              <option key={alt.locality_id} value={alt.locality_id}>
                {alt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Evaluation Matrix Grid */}
      <div className="overflow-hidden border border-slate-800 rounded-lg bg-slate-950 text-xs">
        <div className="grid grid-cols-4 bg-slate-900/80 p-3 font-mono uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-800">
          <div>Dimension</div>
          <div className="text-center text-white">{payload.locality_1_meta.name}</div>
          <div className="text-center text-teal-400">{payload.locality_2_meta.name}</div>
          <div className="text-center">Variance</div>
        </div>
        {Object.entries(payload.dimensional_matrix).map(([dim, data]) => (
          <div key={dim} className="grid grid-cols-4 p-3 border-b border-slate-900 last:border-0 hover:bg-slate-900/40 font-medium items-center">
            <div className="capitalize font-semibold text-slate-400">{dim}</div>
            <div className="text-center text-white font-mono">{data.locality_1_value}</div>
            <div className="text-center text-teal-400 font-mono">{data.locality_2_value}</div>
            <div className={`text-center font-mono font-bold ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.variance >= 0 ? `+${data.variance}` : data.variance}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Rental Overhead Summary Strip */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs leading-relaxed flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono block mb-1">
            Financial Variance Conclusion:
          </span>
          <span className="text-slate-300 font-medium">{payload.summary.structural_verdict}</span>
        </div>
        <div className="bg-slate-900/60 px-4 py-2 rounded border border-slate-800 text-right shrink-0">
          <span className="text-[9px] text-slate-500 font-mono uppercase block mb-0.5">3BHK Cost Delta</span>
          <span className="font-mono font-bold text-teal-400 text-sm">
            {Math.abs(payload.financial_variance.rent_3bhk_delta_inr).toLocaleString('en-IN')} INR / Mo
          </span>
        </div>
      </div>
    </div>
  );
};