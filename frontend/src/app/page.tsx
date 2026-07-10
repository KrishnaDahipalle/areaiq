'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApiClient, ChatResponsePayload, RecommendResponsePayload, ComparisonResponsePayload, ExplanationResponsePayload, ItineraryResponsePayload } from '../lib/api';
import { AlternativesMatrix } from '../components/AlternativesMatrix';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { ItineraryTimeline } from '../components/ItineraryTimeline';
import { DossierAbstract } from '../components/DossierAbstract';
import { AgentProcessingOverlay } from '../components/AgentProcessingOverlay';
import { AnimatedMessage } from '../components/AnimatedMessage';
import { AnimatedPanel } from '../components/AnimatedPanel';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  // --- Workspace Anchors ---
  const [userId] = useState<string>('hackathon_user_1');
  const [sessionId] = useState<string>('session_abc123');

  // --- Dynamic Interface States ---
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([
    {
      role: 'assistant',
      content: "Namaste! I am JD, your AreaIQ advisor. Let me help you relocate to Hyderabad. Tell me about the purpose of your move and where your office will be located."
    }
  ]);

  const [missingSlots, setMissingSlots] = useState<string[]>(['purpose', 'office_location', 'budget', 'family_details', 'priorities']);
  const [currentStage, setCurrentStage] = useState<string>('COLLECTING_PROFILE');
  
  // --- Analytics States ---
  const [recommendations, setRecommendations] = useState<RecommendResponsePayload | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryResponsePayload | null>(null);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationResponsePayload | null>(null);
  const [comparisonPayload, setComparisonPayload] = useState<ComparisonResponsePayload | null>(null);
  const [comparisonTarget, setComparisonTarget] = useState<string>('gachibowli');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'itinerary' | 'comparison'>('matrix');

  // Anchor to auto-scroll chat window smoothly on new message increments
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

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
      setCurrentStage(response.current_stage);

      if (response.profile_complete || response.current_stage === 'EVALUATION') {
        await triggerEngineEvaluation();
      }
    } catch (err) {
      console.error("Connection breakdown:", err);
      setChatLogs((prev) => [...prev, { role: 'system', content: "Failed to connect to the backend server. Verify your FastAPI instance is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEngineEvaluation = async () => {
    setIsLoading(true);
    try {
      const recData = await ApiClient.getRecommendations(userId, sessionId);
      setRecommendations(recData);

      if (recData.recommended_locality) {
        const primaryId = recData.recommended_locality.locality_id;
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
      console.error("Evaluation calculation fault:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeNewComparison = async (targetId: string) => {
    if (!recommendations) return;
    setComparisonTarget(targetId);
    try {
      const primaryId = recommendations.recommended_locality.locality_id;
      const compareRes = await ApiClient.compareLocalities(primaryId, targetId);
      setComparisonPayload(compareRes);
    } catch (err) {
      console.error("Comparative node load error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 selection:bg-teal-500 selection:text-slate-950">
      
      {/* HEADER BAR */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            AreaIQ Hyderabad Core
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Locality Intelligence Decision Matrix Infrastructure
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(20, 184, 166, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={triggerEngineEvaluation}
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-sm font-semibold rounded-lg transition-all border border-teal-500/20 shadow-md"
        >
          Skip to Dashboard Mock
        </motion.button>
      </header>

      {/* CORE CONTROL GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CONVERSATION CONSOLE */}
        <section className="lg:col-span-4 bg-slate-900/60 rounded-xl border border-slate-800 p-5 h-[calc(100vh-140px)] flex flex-col justify-between shadow-2xl backdrop-blur-md">
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

            {/* FLOW SCROLL MESSAGE BOX CONTAINER WITH ANIMATE PRESENCE BLOCK */}
            <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 scrollbar-thin">
              <AnimatePresence initial={false}>
                {chatLogs.map((msg, index) => (
                  <AnimatedMessage key={index} role={msg.role} content={msg.content} />
                ))}
              </AnimatePresence>
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="relative flex items-center mb-4">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isLoading ? "Processing matrices..." : "Type parameters to advise..."}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg pl-3 pr-10 py-2.5 text-sm outline-none transition-all text-white placeholder:text-slate-600"
              />
              <button type="submit" className="absolute right-3 text-teal-400 hover:text-teal-300 transition-colors">⚡</button>
            </form>

            <div className="flex flex-wrap gap-2">
              {['purpose', 'office_location', 'budget', 'family_details', 'priorities'].map((slot) => {
                const isMissing = missingSlots.includes(slot);
                return (
                  <motion.span 
                    animate={{ scale: isMissing ? 1 : [1, 1.1, 1] }}
                    key={slot}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all duration-300 ${
                      isMissing 
                        ? 'bg-slate-950 text-slate-600 border-slate-900 line-through' 
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 font-bold'
                    }`}
                  >
                    {isMissing ? '✕' : '✓'} {slot.replace('_', ' ')}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </section>

        {/* DECISION MATRIX CORES DISPLAY */}
        <section className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading && !recommendations && (
              <AnimatedPanel key="loading">
                <AgentProcessingOverlay />
              </AnimatedPanel>
            )}

            {!recommendations ? (
              <AnimatedPanel key="placeholder">
                <div className="bg-slate-900/30 rounded-xl border border-slate-900 p-12 text-center text-slate-500">
                  <div className="text-3xl mb-3">📊</div>
                  <p className="text-sm font-medium">Provide relocation requirements via the Advisor Context Console.</p>
                  <p className="text-xs text-slate-600 mt-1">Once parameters match the core targets checklist, the analytics canvas grid will execute.</p>
                </div>
              </AnimatedPanel>
            ) : (
              <motion.div 
                key="dashboard"
                initial="hidden"
                animate="show"
                variants={{
                  show: { transition: { staggerChildren: 0.15 } }
                }}
                className="space-y-6"
              >
                {/* ADVANCED PRIMARY ENGINE RECOMMENDATION HERO HERO */}
                <AnimatedPanel delay={0.05}>
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-teal-500/10 text-teal-400 font-mono text-xs uppercase tracking-wider border-l border-b border-slate-800 rounded-bl-xl font-bold">
                      Top Engine Match
                    </div>
                    <span className="text-xs font-mono uppercase tracking-widest text-teal-400 block mb-1">Optimized Core Corridor Match</span>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">{recommendations.recommended_locality.name}</h2>
                    <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{recommendations.recommended_locality.global_suitability_score}% Match Index</div>
                    <p className="text-xs text-slate-400 mt-3 border-t border-slate-800/60 pt-3 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                      <span className="font-bold font-mono text-teal-500 block text-[10px] uppercase mb-1">Engine Mathematical Breakdown:</span>
                      {recommendations.recommended_locality.calculation_explanation}
                    </p>
                  </div>
                </AnimatedPanel>

                {/* TABS CONSOLE SELECTOR NAVIGATION LAYOUT */}
                <AnimatedPanel delay={0.1}>
                  <div className="flex border-b border-slate-800 gap-2">
                    {(['matrix', 'itinerary', 'comparison'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-all relative ${
                          activeTab === tab ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div 
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-teal-500"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </AnimatedPanel>

                {/* MATRIX TABS INTERACTIVE VISUAL VIEWS GRID */}
                <AnimatePresence mode="wait">
                  {activeTab === 'matrix' && (
                    <motion.div 
                      key="matrix-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <AlternativesMatrix alternatives={recommendations.ranked_alternatives} />
                      <DossierAbstract explanation={activeExplanation} />
                    </motion.div>
                  )}

                  {activeTab === 'itinerary' && (
                    <motion.div 
                      key="itinerary-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      <ItineraryTimeline payload={activeItinerary} />
                    </motion.div>
                  )}

                  {activeTab === 'comparison' && (
                    <motion.div 
                      key="comparison-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                    >
                      <ComparisonMatrix 
                        payload={comparisonPayload}
                        comparisonTarget={comparisonTarget}
                        onTargetChange={executeNewComparison}
                        alternatives={recommendations.ranked_alternatives}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}