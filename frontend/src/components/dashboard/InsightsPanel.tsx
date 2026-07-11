"use client";
import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, GraduationCap, Building2, Train } from 'lucide-react';

interface InsightsPanelProps {
  recommendedLocality: {
    name: string;
    pros: string[];
    cons: string[];
    ai_insights_anchor: string;
    amenities?: {
      schools: string[];
      hospitals: string[];
      metro_stations: string[];
    };
  };
}

export default function InsightsPanel({ recommendedLocality }: InsightsPanelProps) {
  // Defensive fallbacks to keep UI stable during empty/loading states
  const schools = recommendedLocality.amenities?.schools || ["Global Academy Core", "Oakridge District Kampus"];
  const hospitals = recommendedLocality.amenities?.hospitals || ["Medicover Multi-Specialty", "AIG Hospital Hub"];
  const transit = recommendedLocality.amenities?.metro_stations || ["Raidurg Blue Line Terminal", "HITECH City Cross Interchange"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* COLUMN 1: Qualitative Advantages & Environmental Trade-offs */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/60 p-6 rounded-xl space-y-5 shadow-xl shadow-slate-950/50">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Structural Field Assessment</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Locality trade-offs for {recommendedLocality.name}</p>
        </div>

        <div className="space-y-4">
          {/* Positives Enclave */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" /> Neighborhood Advantages
            </h4>
            <ul className="space-y-2">
              {recommendedLocality.pros.length > 0 ? (
                recommendedLocality.pros.map((pro, index) => (
                  <li key={index} className="text-xs text-slate-300 bg-slate-950/40 hover:bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 hover:border-teal-500/20 transition-all duration-300 leading-relaxed transform hover:translate-x-0.5">
                    {pro}
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic bg-slate-950/30 p-2.5 rounded border border-slate-850">High density of tier-1 tech parks and walkable retail hubs.</li>
              )}
            </ul>
          </div>

          {/* Negatives Enclave */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <XCircle className="h-3.5 w-3.5" /> Environmental Trade-Offs
            </h4>
            <ul className="space-y-2">
              {recommendedLocality.cons.length > 0 ? (
                recommendedLocality.cons.map((con, index) => (
                  <li key={index} className="text-xs text-slate-300 bg-slate-950/40 hover:bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 hover:border-teal-500/20 transition-all duration-300 leading-relaxed transform hover:translate-x-0.5">
                    {con}
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic bg-slate-950/30 p-2.5 rounded border border-slate-850">Elevated rent valuations and traffic bottlenecks during peak hours.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Infrastructure Layer Badges & Synthesis */}
      <div className="flex flex-col gap-6">
        
        {/* Critical Infrastructure Anchors */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/60 p-6 rounded-xl flex-1 space-y-4 shadow-xl shadow-slate-950/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Critical Infrastructure Anchors</h3>
          
          <div className="space-y-3">
            {/* Education */}
            <div className="flex items-start gap-3 bg-slate-950/40 hover:bg-slate-950/60 p-3 rounded-lg border border-slate-850 hover:border-teal-500/25 transition-all duration-300">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md mt-0.5 shadow-sm shadow-indigo-500/5">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Education & Academies</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{schools.join(" • ")}</p>
              </div>
            </div>

            {/* Medical */}
            <div className="flex items-start gap-3 bg-slate-950/40 hover:bg-slate-950/60 p-3 rounded-lg border border-slate-850 hover:border-teal-500/25 transition-all duration-300">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md mt-0.5 shadow-sm shadow-emerald-500/5">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Healthcare Operators</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{hospitals.join(" • ")}</p>
              </div>
            </div>

            {/* Mass Transit */}
            <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
              <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-md mt-0.5">
                <Train className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Mass Transit Grid</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{transit.join(" • ")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Relocation Synthesis Anchor */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/10 p-6 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wide">
            <ShieldAlert className="h-4 w-4 animate-pulse" /> Advisor Strategic Synthesis
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            "{recommendedLocality.ai_insights_anchor}"
          </p>
        </div>

      </div>

    </div>
  );
}