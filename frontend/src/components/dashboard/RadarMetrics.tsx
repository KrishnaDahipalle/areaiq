"use client";

import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";

interface RadarMetricsProps {
  recommendedName: string;
  recommendedScores: Record<string, number>;
  allLocalities: Array<{
    name: string;
    id: string;
    safety: number;
    transit: number;
    affordability: number;
    lifestyle: number;
  }>;
}

export default function RadarMetrics({
  recommendedName,
  recommendedScores,
  allLocalities,
}: RadarMetricsProps) {
  // Calculate aggregate baseline averages across all available localities
  const totalCount = allLocalities.length || 1;

  const cityAverages = allLocalities.reduce(
    (acc, curr) => {
      acc.Safety += curr.safety;
      acc.Transit += curr.transit;
      acc.Affordability += curr.affordability;
      acc.Lifestyle += curr.lifestyle;
      return acc;
    },
    {
      Safety: 0,
      Transit: 0,
      Affordability: 0,
      Lifestyle: 0,
    }
  );

  // Radar chart dimensions
  const axisKeys = [
    "Safety",
    "Transit",
    "Affordability",
    "Lifestyle",
  ] as const;

  const roundToTwo = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100;

  const transformedRadarPayload = axisKeys.map((key) => {
    const recommendedValue =
      recommendedScores[key] ??
      recommendedScores[key.toLowerCase()] ??
      5;

    const computedAverage = cityAverages[key] / totalCount;

    return {
      subject: key,
      [recommendedName]: recommendedValue,
      "Hyderabad Average": roundToTwo(computedAverage),
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">
          Attribute Vector Analysis
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dimensional suitability matrix compared against city-wide baselines
        </p>
      </div>

      <div className="w-full h-[260px] flex items-center justify-center mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={transformedRadarPayload}
          >
            <PolarGrid stroke="#1e293b" />

            <PolarAngleAxis
              dataKey="subject"
              stroke="#94a3b8"
              style={{
                fontSize: "10px",
                fontWeight: "bold",
              }}
            />

            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              stroke="#475569"
              style={{
                fontSize: "9px",
              }}
            />

            <Radar
              name={recommendedName}
              dataKey={recommendedName}
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
            />

            <Radar
              name="Hyderabad Average"
              dataKey="Hyderabad Average"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.05}
              strokeDasharray="4 4"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "8px",
              }}
              itemStyle={{
                fontSize: "11px",
                color: "#cbd5e1",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={24}
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}