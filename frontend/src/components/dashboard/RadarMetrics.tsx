"use client";
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadarMetricsProps {
  recommendedName: string;
  recommendedScores: Record<string, number>;
  allLocalities: Array<{
    scores: Record<string, number>;
  }>;
}

export default function RadarMetrics({ recommendedName, recommendedScores, allLocalities }: RadarMetricsProps) {
  const dimensions = ["safety", "education", "healthcare", "connectivity", "investment", "lifestyle"];

  // Calculate the average city baseline dynamically across all 6 demo localities
  const cityAverages = dimensions.reduce((acc, dim) => {
    const total = allLocalities.reduce((sum, loc) => sum + (loc.scores[dim] || 0), 0);
    acc[dim] = roundToOneDecimal(total / allLocalities.length);
    return acc;
  }, {} as Record<string, number>);

  // Format dataset for Recharts radar consumption mapping vectors
  const formattedRadarData = dimensions.map(dim => {
    return {
      subject: dim.charAt(0).toUpperCase() + dim.slice(1),
      [recommendedName]: recommendedScores[dim] || 0,
      "City Average": cityAverages[dim] || 0,
    };
  });

  function roundToOneDecimal(num: number): number {
    return Math.round(num * 10) / 10;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">6-Dimensional Attribute Alignment Profile</h3>
        <p className="text-xs text-slate-500 mt-0.5">Comparing match metrics against the standard city baseline score vector</p>
      </div>

      {/* Recharts Core Radar Component */}
      <div className="h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={formattedRadarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: '500' }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#334155" style={{ fontSize: '9px' }} tickCount={6} />
            
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              itemStyle={{ fontSize: '11px', paddingTop: "1px", paddingBottom: "1px", }}
            />
            
            {/* The City Average Baseline Polygon Overlay Vector */}
            <Radar
              name="City Average"
              dataKey="City Average"
              stroke="#64748b"
              fill="#64748b"
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            
            {/* The Target Recommended Area Polygon Overlay Vector */}
            <Radar
              name={recommendedName}
              dataKey={recommendedName}
              stroke="#818cf8"
              fill="#6366f1"
              fillOpacity={0.35}
              strokeWidth={2.5}
            />
            
            <Legend verticalAlign="bottom" height={20} iconType="square" wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}