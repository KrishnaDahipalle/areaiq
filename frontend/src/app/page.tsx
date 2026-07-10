"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ApiClient, ChatMessage, RecommendResponsePayload } from '../lib/api';
import GrowthChart from '../components/dashboard/GrowthChart';
import RadarMetrics from '../components/dashboard/RadarMetrics';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import { Send, MapPin, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export default function Home() {
  // Session Configuration Matrices
  const [userId] = useState("hackathon_user_1");
  const [sessionId] = useState("session_" + Math.random().toString(36).substr(2, 9));
  
  // UI & Asynchronous State Managers
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [missingSlots, setMissingSlots] = useState<string[]>(["purpose", "office_location", "budget", "family_details", "priorities"]);
  
  // Hardcoded references of our 6 demo areas to safely back up charts before full profile sync
  const [allLocalitiesMaster, setAllLocalitiesMaster] = useState<any[]>([]);
  
  // Conversational Memory Context Triggers
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Namaste! I am JD, your AreaIQ advisor. Let me help you relocate to Hyderabad. To find your ideal neighborhood match, tell me a little bit about the purpose of your move and where your office will be located.' }
  ]);

  // Analytics Dashboard Engine Payload State
  const [analyticsData, setAnalyticsData] = useState<RecommendResponsePayload | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Populate master list fallback properties so selections render on mount
  useEffect(() => {
    const fetchBaselineLocalities = async () => {
      try {
        const ids = ["madhapur", "gachibowli", "kondapur", "hitech_city", "jubilee_hills", "kukatpally"];
        const resolved = await Promise.all(ids.map(id => ApiClient.getLocalityData(id)));
        setAllLocalitiesMaster(resolved);
      } catch (e) {
        console.error("Baseline fetch deferred until server link is operational", e);
      }
    };
    fetchBaselineLocalities();
  }, []);

  // Auto-scroll chat window when new elements appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Conversational Form Submissions
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      // 1. Dispatch chat vector text straight to the FastAPI router
      const chatResponse = await ApiClient.sendChatMessage({
        user_id: userId,
        session_id: sessionId,
        message: userText
      });

      setMessages(prev => [...prev, { role: 'assistant', content: chatResponse.reply }]);
      setProfileComplete(chatResponse.profile_complete);
      setMissingSlots(chatResponse.missing_slots);

      // 2. Continuous Evaluation: If profile matrix criteria check satisfies, trigger the rank calculations
      if (chatResponse.profile_complete || chatResponse.missing_slots.length === 0) {
        const recommendations = await ApiClient.getRecommendations(userId, sessionId);
        setAnalyticsData(recommendations);
      }
    } catch (error) {
      console.error("Communication pipeline failure:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection timed out briefly. Could you clarify your budget targets for me again?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to force bypass profile checks during a live presentation judge panel run
  const forceTriggerEvaluation = async () => {
    setIsLoading(true);
    try {
      const recommendations = await ApiClient.getRecommendations(userId, sessionId);
      setAnalyticsData(recommendations);
      setProfileComplete(true);
      setMissingSlots([]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Force-compiling all locality intelligence calculations down onto the workspace interface panels right now.' }]);
    } catch (error) {
      console.error("Bypass configuration route failure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Structural Global Navigation Banner */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center font-black tracking-tighter text-white shadow-lg shadow-indigo-500/10">IQ</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AreaIQ <span className="text-xs bg-indigo-500/10 text-indigo-400 font-medium px-2 py-0.5 rounded-full border border-indigo-500/20">Hyderabad Core v1</span>
            </h1>
          </div>
        </div>
        
        {/* State Monitoring Badges */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {missingSlots.map(slot => (
              <span key={slot} className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 rounded-md border border-slate-700/60">
                • {slot.replace('_', ' ')}
              </span>
            ))}
            {profileComplete && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 animate-pulse">
                ✓ Matrix Complete
              </span>
            )}
          </div>
          <button 
            onClick={forceTriggerEvaluation} 
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Skip to Dashboard
          </button>
        </div>
      </header>

      {/* Primary Workspace Grid Construction */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden max-h-[calc(100vh-69px)]">
        
        {/* PANEL A: Conversational Consultant Section (4 Columns) */}
        <section className="xl:col-span-4 border-r border-slate-800 bg-slate-900/20 flex flex-col h-full justify-between overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">Advisor Context Console</h2>
          </div>
          
          {/* Chat Stream History Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-210px)]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex gap-1.5 items-center">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Interface Block */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/80">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={profileComplete ? "Profile fully satisfied..." : "Type parameters to advise JD..."}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none transition placeholder:text-slate-500 text-slate-100"
              />
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        {/* PANEL B: Comparative Analytics Workspace Section (8 Columns) */}
        <section className="xl:col-span-8 bg-slate-950 overflow-y-auto p-6 space-y-6">
          {!analyticsData ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                <MapPin className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Awaiting Criteria Profiles</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Provide moving details via the conversational agent console. Once requirements are gathered, the engine calculates suitability rankings across the 6 target corridors.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* KPI Summary Block Rows */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" /> Primary Match Neighborhood
                  </span>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-white tracking-tight">{analyticsData.recommended_locality.name}</h4>
                    <p className="text-xs text-indigo-400 font-semibold mt-1">Global Suitability Index Peak Match</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Suitability Probability Yield
                  </span>
                  <div className="mt-4">
                    <h4 className="text-4xl font-black text-emerald-400 tracking-tight">{analyticsData.recommended_locality.global_utility_score || analyticsData.recommended_locality.global_suitability_score}%</h4>
                    <p className="text-xs text-slate-400 mt-1">MCDA Algorithm Score Optimization Value</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-violet-400" /> Boundary Conflicts Captured
                  </span>
                  <div className="mt-4">
                    <h4 className="text-4xl font-black text-white tracking-tight">{analyticsData.conflicts_detected.length}</h4>
                    <p className="text-xs text-slate-400 mt-1">Active constraint warning events logged</p>
                  </div>
                </div>
              </div>

              {/* Graphical Visualization Row Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allLocalitiesMaster.length > 0 && (
                  <GrowthChart localitiesData={allLocalitiesMaster} />
                )}
                {allLocalitiesMaster.length > 0 && (
                  <RadarMetrics 
                    recommendedName={analyticsData.recommended_locality.name}
                    recommendedScores={analyticsData.recommended_locality.dimension_scores}
                    allLocalities={allLocalitiesMaster}
                  />
                )}
              </div>

              {/* Horizontal Rankings Bar Progress Container */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">Locality Suitability Priority Rankings Matrix</h3>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">🥇 {analyticsData.recommended_locality.name}</span>
                      <span className="text-indigo-400">{analyticsData.recommended_locality.global_suitability_score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${analyticsData.recommended_locality.global_suitability_score}%` }}></div>
                    </div>
                  </div>

                  {analyticsData.ranked_alternatives.map((alt, index) => (
                    <div key={alt.locality_id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">#{index + 2} {alt.name}</span>
                        <span className="text-slate-400">{alt.global_suitability_score}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-600 h-full rounded-full transition-all duration-500" style={{ width: `${alt.global_suitability_score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitative assessment details layout breakdown */}
              {allLocalitiesMaster.length > 0 && (
                <InsightsPanel 
                  recommendedLocality={{
                    ...allLocalitiesMaster.find(l => l.id === analyticsData.recommended_locality.locality_id),
                    name: analyticsData.recommended_locality.name,
                    pros: allLocalitiesMaster.find(l => l.id === analyticsData.recommended_locality.locality_id)?.pros || [],
                    cons: allLocalitiesMaster.find(l => l.id === analyticsData.recommended_locality.locality_id)?.cons || [],
                    ai_insights_anchor: analyticsData.recommended_locality.calculation_explanation
                  }} 
                />
              )}

              {/* Active Constraints Alerts & Logs */}
              {analyticsData.conflicts_detected.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-2">Automated Optimization Conflict Warnings</h3>
                  <ul className="text-xs text-amber-300/80 space-y-1.5 list-disc pl-4">
                    {analyticsData.conflicts_detected.map((conf, index) => (
                      <li key={index} className="leading-relaxed">{conf}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </section>
        
      </div>
    </main>
  );
}