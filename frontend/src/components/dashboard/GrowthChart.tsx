"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface GrowthChartProps {
  localitiesData: Array<{
    name: string;
    id: string;
    growth_trend?: number[];
  }>;
}

export default function GrowthChart({
  localitiesData,
}: GrowthChartProps) {
  // Timeline shown on the chart
  const staticTimeline = ["2022", "2023", "2024", "2025", "2026"];

  // Default trend data used when backend data is unavailable
  const baseTrends: Record<string, number[]> = {
    gachibowli: [60, 68, 75, 84, 92],
    hitech_city: [65, 72, 82, 90, 98],
    kondapur: [55, 62, 70, 78, 85],
    madhapur: [70, 76, 84, 91, 96],
    kukatpally: [50, 56, 62, 68, 74],
    miyapur: [45, 51, 58, 65, 71],
  };

  // Convert locality-wise trend arrays into Recharts row format
  const transformedChartPayload = staticTimeline.map((year, index) => {
    const rowEntry: Record<string, string | number> = {
      name: year,
    };

    localitiesData.forEach((locality) => {
      const trends =
        locality.growth_trend?.length
          ? locality.growth_trend
          : baseTrends[locality.id] ?? [50, 55, 60, 65, 70];

      rowEntry[locality.name] = trends[index];
    });

    return rowEntry;
  });

  const colorPalettes = [
    "#6366f1",
    "#10b981",
    "#38bdf8",
    "#a855f7",
    "#f59e0b",
    "#ef4444",
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between h-[360px]">
      <div>
        <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">
          Locality Value Vectors
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          5-Year compound annualized real estate price appreciation scaling
        </p>
      </div>

      <div className="w-full h-[260px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={transformedChartPayload}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#64748b"
              style={{ fontSize: "10px", fontWeight: "bold" }}
              tickLine={false}
            />

            <YAxis
              stroke="#64748b"
              style={{ fontSize: "10px" }}
              tickLine={false}
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
              labelStyle={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#6366f1",
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
                paddingBottom: "10px",
              }}
            />

            {localitiesData.map((locality, idx) => (
              <Line
                key={locality.id}
                type="monotone"
                dataKey={locality.name}
                stroke={colorPalettes[idx % colorPalettes.length]}
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}