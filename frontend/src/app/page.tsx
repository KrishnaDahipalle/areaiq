'use client';

import React, { useState, useEffect } from 'react';
import { 
  ApiClient, 
  ChatResponsePayload, 
  RecommendResponsePayload, 
  ComparisonResponsePayload, 
  ExplanationResponsePayload, 
  ItineraryResponsePayload 
} from '../lib/api'; 

export default function Home() {
  // --- Persistent Workspace Session Anchors ---
  const [userId] = useState<string>('hackathon_user_1');
  const [sessionId] = useState<string>('session_abc123');

  // --- Dynamic Interface Data Framework States ---
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Namaste! I am JD, your AreaIQ advisor. Let me help you relocate to Hyderabad. To find your ideal neighborhood match, tell me a little bit about the purpose of your move and where your office will be located."
    }
  ]);

  const [missingSlots, setMissingSlots] = useState<string[]>(['purpose', 'office_location', 'budget', 'family_details', 'priorities']);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<string>('COLLECTING_PROFILE');

  // --- Advanced Deep Analytic Microservice Results States ---
  const [recommendations, setRecommendations] = useState<RecommendResponsePayload | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryResponsePayload | null>(null);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationResponsePayload | null>(null);
  const [comparisonPayload, setComparisonPayload] = useState<ComparisonResponsePayload | null>(null);
  const [comparisonTarget, setComparisonTarget] = useState<string>('gachibowli'); // Default comparison baseline node

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'itinerary' | 'comparison'>('matrix');

  // --- Dispatches Conversational Inputs Into the AI Agent Loop ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatLogs((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response: ChatResponsePayload = await ApiClient.sendChatMessage({
        user_id: userId,
        session_id: sessionId,
        message: userMessage
      });

      setChatLogs((prev) => [...prev, { role: 'assistant', content: response.reply }]);
      setMissingSlots(response.missing_slots);
      setIsProfileComplete(response.profile_complete);
      setCurrentStage(response.current_stage);

      // Trigger structural recalculation immediately if the agent loop finishes slot allocation
      if (response.profile_complete || response.current_stage === 'EVALUATION') {
        await triggerEngineEvaluation();
      }
    } catch (err) {
      console.error("Agent workflow execution breakdown:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Triggers the Core Multi-Criteria Scoring Optimization Array ---
  const triggerEngineEvaluation = async () => {
    setIsLoading(true);
    try {
      const recData = await ApiClient.getRecommendations(userId, sessionId);
      setRecommendations(recData);

      if (recData.recommended_locality) {
        const primaryId = recData.recommended_locality.locality_id;
        
        // Execute supplementary analytics requests concurrently
        const [itineraryRes, explainRes, compareRes] = await Promise.all([
          ApiClient.getItinerary(primaryId),
          ApiClient.getExplanation(userId, sessionId, primaryId),
          ApiClient.compareLocalities(primaryId, comparisonTarget)
        ]);

        setActiveItinerary(itineraryRes);
        setActiveExplanation(explainRes);
        setComparisonPayload(compareRes);
      }
    } catch (err) {
      console.error("Analytical calculation stack processing fault:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Toggles Comparison Benchmarks Dynamically via Selection Arrays ---
  const executeNewComparison = async (targetId: string) => {
    if (!recommendations) return;
    setComparisonTarget(targetId);
    try {
      const primaryId = recommendations.recommended_locality.locality_id;
      const compareRes = await ApiClient.compareLocalities(primaryId, targetId);
      setComparisonPayload(compareRes);
    } catch (err) {
      console.error("Comparative node reload mapping failure:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 selection:bg-teal-500 selection:text-slate-950">
      {/* HEADER BAR */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            AreaIQ Hyderabad Core
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Scalable Locality Intelligence Decision Matrix Infrastructure
          </p>
        </div>
        <button 
          onClick={triggerEngineEvaluation}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-sm font-semibold rounded-lg transition-all shadow-lg shadow-teal-950/40 border border-teal-500/20"
        >
          Skip to Dashboard (Mock Data Evaluation)
        </button>
      </header>

      {/* CORE CONTROL GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: THE ADVISOR INTEGRATED CONVERSATION STREAM */}
        <section className="lg:col-span-4 bg-slate-900/60 rounded-xl border border-slate-800 backdrop-blur-md p-5 h-[calc(100vh-140px)] flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-lg font-bold tracking-tight text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Advisor Context Console
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                {currentStage}
              </span>
            </div>

            {/* MESSAGE TRACK DISPLAY */}
            <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatLogs.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                    {msg.role === 'user' ? 'Client Request' : 'JD / Advisor'}
                  </span>
                  <div className={`text-sm p-3 rounded-xl max-w-[90%] font-medium leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-teal-600 text-slate-900 rounded-tr-none font-semibold' 
                      : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LOWER INTERACTION INTERACTION LAYER */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            {/* INPUT FIELD BUFFER SHEET */}
            <form onSubmit={handleSendMessage} className="relative flex items-center mb-3">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isLoading ? "Processing constraints..." : "Type parameters to advise..."}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-lg pl-3 pr-10 py-2.5 text-sm outline-none transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit" 
                className="absolute right-2 p-1.5 text-teal-400 hover:text-teal-300 transition-colors"
              >
                ⚡
              </button>
            </form>

            {/* REAL-TIME MATRIX EXTRACTION CHECKBOX SLOTS TRACKER */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-2">
                Awaiting Criteria Profiles
              </span>
              <div className="flex flex-wrap gap-2">
                {['purpose', 'office_location', 'budget', 'family_details', 'priorities'].map((slot) => {
                  const isMissing = missingSlots.includes(slot);
                  return (
                    <span 
                      key={slot}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all duration-300 ${
                        isMissing 
                          ? 'bg-slate-950 text-slate-600 border border-slate-900 line-through' 
                          : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-semibold'
                      }`}
                    >
                      {isMissing ? '✕' : '✓'} {slot.replace('_', ' ')}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: DECISION ENGINE MATRIX INTERACTIVE RENDERING BOARDS */}
        <section className="lg:col-span-8 space-y-6">
          {!recommendations ? (
            <div className="bg-slate-900/30 rounded-xl border border-slate-900 p-12 text-center text-slate-500">
              <div className="text-3xl mb-3">📊</div>
              <p className="text-sm font-medium">Provide moving details via the conversational agent console.</p>
              <p className="text-xs text-slate-600 mt-1">Once requirements are gathered, the engine calculates suitability rankings across the target corridors.</p>
            </div>
          ) : (
            <>
              {/* PRIMARY HIGHLIGHT MATRIX HERO BAR */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-teal-500/10 text-teal-400 font-mono text-xs uppercase tracking-wider border-l border-b border-slate-800 rounded-bl-xl font-bold">
                  Top Engine Match
                </div>
                <span className="text-xs font-mono uppercase tracking-widest text-teal-400 block mb-1">
                  Optimized Core Corridor Match
                </span>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  {recommendations.recommended_locality.name}
                </h2>
                <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                  {recommendations.recommended_locality.global_suitability_score}% Match Index
                </div>
                <p className="text-xs text-slate-400 mt-3 border-t border-slate-800/60 pt-3 leading-relaxed font-medium bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                  <span className="font-bold font-mono text-teal-500 block text-[10px] uppercase mb-1">Engine Mathematical Breakdown:</span>
                  {recommendations.recommended_locality.calculation_explanation}
                </p>
              </div>

              {/* DYNAMIC TAB CONTROLLER */}
              <div className="flex border-b border-slate-800 gap-2">
                {(['matrix', 'itinerary', 'comparison'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
                      activeTab === tab
                        ? 'border-teal-500 text-teal-400 bg-slate-900/40'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* VIEW PANEL 1: SUITABILITY SCORE MATRICES */}
              {activeTab === 'matrix' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ALTERNATIVES SUITABILITY TRACK ROWS */}
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
                      Ranked System Alternatives
                    </h3>
                    <div className="space-y-3">
                      {recommendations.ranked_alternatives.map((alt) => (
                        <div key={alt.locality_id} className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-sm font-bold text-white">{alt.name}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[200px] font-mono mt-0.5">{alt.locality_id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-teal-400">{alt.global_suitability_score}%</div>
                            <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded font-mono text-slate-400">Score Matrix</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADVISOR MATRIX ANALYSIS BLOCK */}
                  <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
                        Strategic Alignment Analysis
                      </h3>
                      {activeExplanation ? (
                        <div className="space-y-3">
                          <p className="text-xs italic text-slate-400 border-l-2 border-teal-500 pl-3 py-1 bg-slate-950/50 p-2 rounded-r-lg">
                            "{activeExplanation.summary}"
                          </p>
                          <div className="space-y-1.5 pt-2">
                            {activeExplanation.explanation.map((reason, i) => (
                              <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/30 p-2 rounded border border-slate-800/30">
                                <span className="text-teal-400 mt-0.5">✦</span>
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 font-mono">Generating vector explanations...</div>
                      )}
                    </div>
                    
                    {/* SYSTEM CONSTRAINT CONFLICTS BLOCK */}
                    {recommendations.conflicts_detected.length > 0 && (
                      <div className="mt-4 p-3 bg-red-950/20 border border-red-900/40 rounded-lg">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-red-400 block mb-1 font-bold">
                          Detected Budget Anomalies
                        </span>
                        {recommendations.conflicts_detected.map((conflict, i) => (
                          <div key={i} className="text-[11px] text-red-300 leading-relaxed">
                            ⚠️ {conflict}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW PANEL 2: ASSET NEIGHBORHOOD EXPLORATION TIMELINES */}
              {activeTab === 'itinerary' && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-800 pb-2">
                    Physical Field Verification Dossier
                  </h3>
                  {activeItinerary ? (
                    <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                      {activeItinerary.itinerary.map((item, index) => (
                        <div key={index} className="relative pl-10 group">
                          <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-slate-950 border border-teal-400 group-hover:bg-teal-400 transition-colors duration-300" />
                          <div className="bg-slate-950 border border-slate-800/70 p-3 rounded-lg hover:border-slate-700 transition-colors shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black font-mono text-teal-400">{item.time}</span>
                              <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 border border-slate-800 rounded font-bold uppercase">{item.milestone}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 font-mono">Compiling local exploration grids...</div>
                  )}
                </div>
              )}

              {/* VIEW PANEL 3:Granular NODE-TO-NODE VARIANCES */}
              {activeTab === 'comparison' && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Cross-Corridor Parametric Divergence
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Contrast Target:</span>
                      <select 
                        value={comparisonTarget}
                        onChange={(e) => executeNewComparison(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-teal-400 outline-none font-bold"
                      >
                        {recommendations.ranked_alternatives.map((alt) => (
                          <option key={alt.locality_id} value={alt.locality_id}>
                            {alt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {comparisonPayload ? (
                    <div className="space-y-4">
                      {/* STATS COMPARISON MATRIX GRID */}
                      <div className="overflow-hidden border border-slate-800 rounded-lg bg-slate-950 text-xs">
                        <div className="grid grid-cols-4 bg-slate-900 p-2.5 font-mono uppercase font-bold text-slate-400 text-[10px] tracking-wider border-b border-slate-800">
                          <div>Dimension</div>
                          <div className="text-center text-white">{comparisonPayload.locality_1_meta.name}</div>
                          <div className="text-center text-teal-400">{comparisonPayload.locality_2_meta.name}</div>
                          <div className="text-center">Variance</div>
                        </div>
                        {Object.entries(comparisonPayload.dimensional_matrix).map(([dim, data]) => (
                          <div key={dim} className="grid grid-cols-4 p-2.5 border-b border-slate-900 last:border-0 hover:bg-slate-900/40 font-medium">
                            <div className="capitalize font-semibold text-slate-400">{dim}</div>
                            <div className="text-center text-white font-mono">{data.locality_1_value}</div>
                            <div className="text-center text-teal-400 font-mono">{data.locality_2_value}</div>
                            <div className={`text-center font-mono font-bold ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {data.variance >= 0 ? `+${data.variance}` : data.variance}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* FINANCIAL SPREAD ADVISOR SUMMARY BOX */}
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs leading-relaxed flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono block mb-0.5">Financial Variance Conclusion:</span>
                          <span className="text-slate-300 font-medium">{comparisonPayload.summary.structural_verdict}</span>
                        </div>
                        <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-right shrink-0">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">3BHK Cost Delta</span>
                          <span className="font-mono font-bold text-teal-400">{Math.abs(comparisonPayload.financial_variance.rent_3bhk_delta_inr).toLocaleString('en-IN')} INR / Mo</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 font-mono">Re-indexing variance arrays...</div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}