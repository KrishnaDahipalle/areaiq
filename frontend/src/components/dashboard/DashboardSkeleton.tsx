"use client";
import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Blocks Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 p-5 h-28 rounded-xl flex flex-col justify-between">
            <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
            <div className="h-6 w-3/4 bg-slate-800 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Charts Loading Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 p-6 h-[360px] rounded-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
            </div>
            <div className="w-full h-[240px] bg-slate-950/40 border border-slate-900 rounded-lg mt-4 flex items-center justify-center">
              <span className="text-xs text-slate-600 uppercase tracking-widest font-mono">Syncing Analytics Vectors...</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rankings Block */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 h-48 rounded-xl space-y-4">
        <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-1/6 bg-slate-800 rounded"></div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}