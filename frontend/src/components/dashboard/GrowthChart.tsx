"use client";
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GrowthChartProps {
  localitiesData: Array<{
    id: string;
    name: string;
    growth_analytics: {
      market_status: string;
      cagr_5_year_pct: number;
      time_series_data: Record<string, number>;
    };
  }>;
}

export default function GrowthChart({ localitiesData }: GrowthChartProps) {
  // Default comparisons to our primary baseline demo anchors
  const [primaryId, setPrimaryId] = useState<string>("madhapur");
  const [secondaryId, setSecondaryId] = useState<string>("hitech_city");

  const primaryLoc = localitiesData.find(l => l.id === primaryId);
  const secondaryLoc = localitiesData.find(l => l.id === secondaryId);

  // Parse time-series mappings directly into Recharts horizontal object streams
  const years = ["2022", "2023", "2024", "2025", "2026"];
  const formattedChartData = years.map(year => {
    return {
      name: year,
      [primaryLoc?.name || "Primary"]: primaryLoc?.growth_analytics.time_series_data[year] || 0,
      [secondaryLoc?.name || "Secondary"]: secondaryLoc?.growth_analytics.time_series_data[year] || 0,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">5-Year Historical Capital Growth Index</h3>
          <p className="text-xs text-slate-500 mt-0.5">Price metrics mapped in INR value scales per sqft</p>
        </div>
        
        {/* Dynamic Comparison Selection Controls */}
        <div className="flex items-center gap-2">
          <select 
            value={primaryId} 
            onChange={(e) => setPrimaryId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none text-slate-200"
          >
            {localitiesData.map(l => (
              <option key={l.id} value={l.id} disabled={l.id === secondaryId}>{l.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-600 font-bold">VS</span>
          <select 
            value={secondaryId} 
            onChange={(e) => setSecondaryId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none text-slate-200"
          >
            {localitiesData.map(l => (
              <option key={l.id} value={l.id} disabled={l.id === primaryId}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recharts Core Vector Visualization Window */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} />
            <YAxis stroke="#64748b" style={{ fontSize: '11px' }} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
              itemStyle={{ fontSize: '12px', paddingTop: "2px", paddingBottom: "2px", }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '600' }} />
            <Line 
              type="monotone" 
              dataKey={primaryLoc?.name || "Primary"} 
              stroke="#6366f1" 
              strokeWidth={3} 
              activeDot={{ r: 6 }} 
              dot={{ strokeWidth: 2, r: 3 }} 
            />
            <Line 
              type="monotone" 
              dataKey={secondaryLoc?.name || "Secondary"} 
              stroke="#38bdf8" 
              strokeWidth={2} 
              dot={{ strokeWidth: 1, r: 3 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Real-time Status Meta Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">{primaryLoc?.name} Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-white">{primaryLoc?.growth_analytics.market_status}</span>
            <span className="text-xs text-indigo-400 font-semibold">({primaryLoc?.growth_analytics.cagr_5_year_pct}% CAGR)</span>
          </div>
        </div>
        <div className="p-3 bg-sky-500/5 rounded-lg border border-sky-500/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">{secondaryLoc?.name} Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-bold text-white">{secondaryLoc?.growth_analytics.market_status}</span>
            <span className="text-xs text-sky-400 font-semibold">({secondaryLoc?.growth_analytics.cagr_5_year_pct}% CAGR)</span>
          </div>
        </div>
      </div>
    </div>
  );
}