import React from 'react';
import { ComparisonResponsePayload } from '../lib/api';

interface ComparisonMatrixProps {
  payload: ComparisonResponsePayload | null;
  comparisonTarget: string;
  onTargetChange: (targetId: string) => void;
  alternatives: Array<{ locality_id: string; name: string }>;
  focusName?: string;
}

const ALL_LOCALITIES_LIST = [
  { locality_id: 'hitech_city', name: 'Hitech City' },
  { locality_id: 'gachibowli', name: 'Gachibowli' },
  { locality_id: 'madhapur', name: 'Madhapur' },
  { locality_id: 'kondapur', name: 'Kondapur' },
  { locality_id: 'kukatpally', name: 'Kukatpally' },
  { locality_id: 'jubilee_hills', name: 'Jubilee Hills' }
];

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  payload,
  comparisonTarget,
  onTargetChange,
  alternatives,
  focusName
}) => {
  if (!payload || !payload.locality_1_meta || !payload.locality_2_meta || !payload.dimensional_matrix) {
    return <div className="text-xs text-slate-600 font-mono p-4">Recalculating comparison variance indices...</div>;
  }

  const rentDelta = payload.financial_variance.rent_3bhk_delta_inr;
  const moreAffordable = payload.financial_variance.more_affordable;
  const financialConclusion = rentDelta === 0 
    ? "Both corridors exhibit identical average 3BHK rental index footprints."
    : `${moreAffordable} offers a more economical pricing structure, saving average rental overheads.`;

  const focusId = payload.locality_1_meta.name.toLowerCase() === focusName?.toLowerCase()
    ? payload.locality_1_meta.id
    : payload.locality_2_meta.id;

  const dropdownOptions = ALL_LOCALITIES_LIST.filter(
    (loc) => loc.locality_id.toLowerCase() !== focusId.toLowerCase()
  );

  return (
    <div className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-slate-800/60 p-5 shadow-xl shadow-slate-950/50 space-y-4">
      {/* Dynamic Selector Header row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Cross-Corridor Parametric Divergence
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Contrast Target:</span>
          <select 
            value={comparisonTarget}
            onChange={(e) => onTargetChange(e.target.value)}
            className="bg-slate-950 border border-slate-800/80 rounded px-2.5 py-1 text-xs text-teal-400 outline-none font-bold cursor-pointer focus:border-teal-500 transition-colors"
          >
            {dropdownOptions.map((alt) => (
              <option key={alt.locality_id} value={alt.locality_id}>
                {alt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Evaluation Matrix Grid */}
      <div className="overflow-hidden border border-slate-800/60 rounded-lg bg-slate-950/20 text-xs">
        <div className="grid grid-cols-4 bg-slate-900/40 p-3 font-mono uppercase font-bold text-slate-400 text-[9px] tracking-widest border-b border-slate-800/60">
          <div>Dimension</div>
          <div className="text-center text-slate-200">{payload.locality_1_meta.name}</div>
          <div className="text-center text-teal-400">{payload.locality_2_meta.name}</div>
          <div className="text-center">Variance</div>
        </div>
        
        {Object.entries(payload.dimensional_matrix).map(([dim, data]) => {
          const isLocality1Focus = payload.locality_1_meta.name.toLowerCase() === focusName?.toLowerCase();
          const displayVariance = isLocality1Focus 
            ? (data.locality_1_value - data.locality_2_value)
            : (data.locality_2_value - data.locality_1_value);
          const formattedVariance = displayVariance >= 0 
            ? `+${displayVariance.toFixed(1)}` 
            : `${displayVariance.toFixed(1)}`;

          return (
            <div key={dim} className="grid grid-cols-4 p-3 border-b border-slate-900/60 last:border-0 hover:bg-slate-900/20 font-medium items-center transition-colors">
              <div className="capitalize font-semibold text-slate-400">{dim}</div>
              
              {/* Localities Score Visualization */}
              <div className="text-center text-white font-mono flex items-center justify-center gap-2">
                <span className="font-bold">{data.locality_1_value.toFixed(1)}</span>
                <div className="w-10 h-1 bg-slate-900 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${data.locality_1_value * 10}%` }} />
                </div>
              </div>
              
              <div className="text-center text-teal-400 font-mono flex items-center justify-center gap-2">
                <span className="font-bold">{data.locality_2_value.toFixed(1)}</span>
                <div className="w-10 h-1 bg-slate-900 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${data.locality_2_value * 10}%` }} />
                </div>
              </div>
              
              <div className="text-center">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  displayVariance >= 0 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.05)]' 
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.05)]'
                }`}>
                  {formattedVariance}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Rental Overhead Summary Strip */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs leading-relaxed flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono block mb-1">
            Financial Variance Conclusion:
          </span>
          <span className="text-slate-300 font-medium">{financialConclusion}</span>
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