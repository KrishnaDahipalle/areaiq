"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

interface DemoPresetsProps {
  onSelectPreset: (text: string) => void;
}

export default function DemoPresets({ onSelectPreset }: DemoPresetsProps) {
  const presets = [
    {
      label: "Tech Exec",
      text: "I am moving near Mindspace, target budget is 75000 INR, priority is nightlife, and metro proximity is highly important."
    },
    {
      label: "Family Focus",
      text: "Our office is in Gachibowli, budget limit 50k, need a family friendly zone near schools, transit doesn't matter much."
    },
    {
      label: "Budget Hustler",
      text: "Commuting to HITECH city, strict budget under 30k, need cheap affordability, close to public trains."
    }
  ];

  return (
    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
        <Sparkles className="h-3 w-3" /> Judge Demo Simulation Presets
      </div>
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPreset(preset.text)}
            className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium py-2 px-1.5 rounded-lg border border-slate-800 hover:border-indigo-500/40 text-center transition truncate"
            title={preset.text}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}