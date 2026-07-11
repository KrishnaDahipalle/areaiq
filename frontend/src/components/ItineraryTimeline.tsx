import React from 'react';
import { ItineraryResponsePayload } from '../lib/api';

interface ItineraryTimelineProps {
  payload: ItineraryResponsePayload | null;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ payload }) => {
  if (!payload || !payload.itinerary || !Array.isArray(payload.itinerary)) {
    return <div className="text-xs text-slate-600 font-mono p-4">Compiling neighborhood inspection timeline parameters...</div>;
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-slate-800/60 p-5 shadow-xl shadow-slate-950/50 space-y-4">
      <div className="border-b border-slate-800/80 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Field Verification Timeline
        </h3>
        <p className="text-[10px] text-teal-400 font-mono mt-0.5 uppercase tracking-wider font-bold">
          Target Cluster: {payload.locality_name}
        </p>
      </div>

      {/* Step Connection Vertical Array */}
      <div className="space-y-4 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800/60">
        {payload.itinerary.map((item, index) => (
          <div key={index} className="relative pl-10 group">
            {/* Pulsing Target Dot Marker */}
            <div className="absolute left-2 top-2.5 w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-teal-500/80 group-hover:bg-teal-400 group-hover:shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-300" />
            
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-850 hover:border-teal-500/20 p-3.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <span className="text-xs font-extrabold font-mono text-teal-400 uppercase tracking-wider">
                  {item.time}
                </span>
                <span className="text-[8px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 border border-slate-800 rounded font-bold uppercase tracking-wider">
                  {item.milestone}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium pt-0.5">
                {item.activity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};