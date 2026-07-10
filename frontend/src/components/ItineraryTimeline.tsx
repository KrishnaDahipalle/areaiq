import React from 'react';
import { ItineraryResponsePayload } from '../lib/api';

interface ItineraryTimelineProps {
  payload: ItineraryResponsePayload | null;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ payload }) => {
  if (!payload) {
    return <div className="text-xs text-slate-600 font-mono p-4">Compiling neighborhood inspection timeline parameters...</div>;
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Field Verification Timeline
        </h3>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
          Target Cluster: {payload.locality_name}
        </p>
      </div>

      {/* Step Connection Vertical Array */}
      <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
        {payload.itinerary.map((item, index) => (
          <div key={index} className="relative pl-10 group">
            {/* Pulsing Target Dot Marker */}
            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-slate-950 border-2 border-teal-400 group-hover:bg-teal-400 transition-colors duration-300" />
            
            <div className="bg-slate-950 border border-slate-800/70 p-3.5 rounded-lg hover:border-slate-700 transition-colors shadow-sm space-y-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <span className="text-xs font-black font-mono text-teal-400 uppercase tracking-wider">
                  {item.time}
                </span>
                <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 border border-slate-800 rounded font-bold uppercase tracking-wider">
                  {item.milestone}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium pt-1">
                {item.activity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};