'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import newly integrated premium dashboard components
import RadarMetrics from '../components/dashboard/RadarMetrics';
import GrowthChart from '../components/dashboard/GrowthChart';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

import { AnimatedPanel } from '../components/AnimatedPanel';
import { AnimatedMessage } from '../components/AnimatedMessage';
import { AlternativesMatrix } from '../components/AlternativesMatrix';
import { DossierAbstract } from '../components/DossierAbstract';
import { ComparisonMatrix } from '../components/ComparisonMatrix';
import { ItineraryTimeline } from '../components/ItineraryTimeline';

import { 
  ApiClient, 
  ChatResponsePayload, 
  RecommendResponsePayload, 
  ComparisonResponsePayload, 
  ExplanationResponsePayload, 
  ItineraryResponsePayload 
} from '../lib/api';

export default function Home() {
  // --- Workspace Anchors ---
  const [userId] = useState<string>('hackathon_user_1');
  const [sessionId, setSessionId] = useState<string>('session_abc123');

  // --- Dynamic Interface States ---
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLogs, setChatLogs] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([
    {
      role: 'assistant',
      content: "Hi, I am AreaIQ. What can I help you with?\n\nHere is what I can do:\n• Find and recommend the best localities for you based on your needs\n• Compare different areas side-by-side (e.g., 'compare Madhapur vs Gachibowli')\n• Explain match reasons and show appreciation trends (e.g., 'show stats for Kukatpally')\n• Plan a travel inspection itinerary for any neighborhood (e.g., 'plan visit to Kondapur')"
    }
  ]);

  const [missingSlots, setMissingSlots] = useState<string[]>(['purpose', 'office_location', 'budget', 'family_details', 'priorities']);
  const [currentStage, setCurrentStage] = useState<string>('COLLECTING_PROFILE');
  const [currentIntent, setCurrentIntent] = useState<string>('');
  
  // --- Analytics States ---
  const [recommendations, setRecommendations] = useState<RecommendResponsePayload | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<ItineraryResponsePayload | null>(null);
  const [activeExplanation, setActiveExplanation] = useState<ExplanationResponsePayload | null>(null);
  const [comparisonPayload, setComparisonPayload] = useState<ComparisonResponsePayload | null>(null);
  const [comparisonTarget, setComparisonTarget] = useState<string>('gachibowli');
  const [recommendedMetadata, setRecommendedMetadata] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'infrastructure' | 'itinerary' | 'comparison'>('matrix');

  const [sessions, setSessions] = useState<any[]>([]);
  const [showSessionsList, setShowSessionsList] = useState<boolean>(false);

  // Load sessions list
  const loadSessionsList = async () => {
    try {
      const sessList = await ApiClient.listSessions(userId);
      setSessions(sessList);
    } catch (err) {
      console.error("Error listing sessions:", err);
    }
  };

  useEffect(() => {
    loadSessionsList();
  }, [userId, sessionId]);

  const startNewChatSession = () => {
    const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    setChatLogs([
      {
        role: 'assistant',
        content: "Hi, I am AreaIQ. What can I help you with?\n\nHere is what I can do:\n• Find and recommend the best localities for you based on your needs\n• Compare different areas side-by-side (e.g., 'compare Madhapur vs Gachibowli')\n• Explain match reasons and show appreciation trends (e.g., 'show stats for Kukatpally')\n• Plan a travel inspection itinerary for any neighborhood (e.g., 'plan visit to Kondapur')"
      }
    ]);
    
    // Reset dashboard state
    setRecommendations(null);
    setActiveItinerary(null);
    setActiveExplanation(null);
    setComparisonPayload(null);
    setRecommendedMetadata(null);
    setCurrentIntent('');
    setShowSessionsList(false);
  };

  const selectChatSession = async (sessId: string) => {
    setIsLoading(true);
    setSessionId(sessId);
    try {
      const data = await ApiClient.getSession(userId, sessId);
      
      // Load logs
      if (data.chat_history && data.chat_history.length > 0) {
        setChatLogs(data.chat_history);
      } else {
        setChatLogs([
          {
            role: 'assistant',
            content: "Hi, I am AreaIQ. Starting a fresh conversation in this session!"
          }
        ]);
      }
      
      // Load state
      const agentState = data.agent_state;
      if (agentState) {
        const intent = agentState.last_intent || '';
        setCurrentIntent(intent);
        
        const recData = await ApiClient.getRecommendations(userId, sessId).catch(() => null);
        if (recData) setRecommendations(recData);

        const primaryId = agentState.last_recommendation || (recData?.recommended_locality?.locality_id) || "madhapur";

        if (intent === 'COMPARE' && agentState.last_compared_localities && agentState.last_compared_localities.length >= 2) {
          const locA = agentState.last_compared_localities[0] || primaryId;
          const locB = agentState.last_compared_localities[1] || comparisonTarget;
          setComparisonTarget(locB);
          const compareRes = await ApiClient.compareLocalities(locA, locB).catch(() => null);
          if (compareRes) {
            setComparisonPayload(compareRes);
            setActiveTab('comparison');
          }
        } 
        else if (intent === 'PLAN_VISIT') {
          const targetLoc = agentState.last_report_locality || primaryId;
          const itineraryRes = await ApiClient.getItinerary(targetLoc).catch(() => null);
          if (itineraryRes) {
            setActiveItinerary(itineraryRes);
            setActiveTab('itinerary');
          }
        } 
        else if (intent === 'EXPLAIN' || intent === 'REPORT') {
          const targetLoc = agentState.last_explained_locality || agentState.last_report_locality || primaryId;
          const [explainRes, metadataRes] = await Promise.all([
            ApiClient.getExplanation(userId, sessId, targetLoc).catch(() => null),
            ApiClient.getLocalityMetadata(targetLoc).catch(() => null)
          ]);
          if (explainRes) setActiveExplanation(explainRes);
          if (metadataRes) setRecommendedMetadata(metadataRes);
          setActiveTab('infrastructure');
        }
        else if (intent === 'RECOMMEND') {
          if (recData) {
            const [itineraryRes, explainRes, compareRes, metadataRes] = await Promise.all([
              ApiClient.getItinerary(primaryId).catch(() => null),
              ApiClient.getExplanation(userId, sessId, primaryId).catch(() => null),
              ApiClient.compareLocalities(primaryId, comparisonTarget).catch(() => null),
              ApiClient.getLocalityMetadata(primaryId).catch(() => null)
            ]);
            if (itineraryRes) setActiveItinerary(itineraryRes);
            if (explainRes) setActiveExplanation(explainRes);
            if (compareRes) setComparisonPayload(compareRes);
            if (metadataRes) setRecommendedMetadata(metadataRes);
          }
          setActiveTab('matrix');
        }
      } else {
        // Reset dashboard state if there's no agent state
        setRecommendations(null);
        setActiveItinerary(null);
        setActiveExplanation(null);
        setComparisonPayload(null);
        setRecommendedMetadata(null);
        setCurrentIntent('');
      }
      setShowSessionsList(false);
    } catch (err) {
      console.error("Error reloading session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Anchor to auto-scroll chat window smoothly on new message increments
  const chatLogsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogsContainerRef.current) {
      chatLogsContainerRef.current.scrollTop = chatLogsContainerRef.current.scrollHeight;
    }
  }, [chatLogs]);

  const submitMessage = async (userMessage: string) => {
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

      const agentState = response.agent_state;
      if (agentState) {
        const intent = agentState.last_intent || '';
        setCurrentIntent(intent);
        
        // Always trigger recommendations load in the background so we have the alternatives list populated
        const recData = await ApiClient.getRecommendations(userId, sessionId).catch(() => null);
        if (recData) {
          setRecommendations(recData);
        }

        const primaryId = agentState.last_recommendation || (recData?.recommended_locality?.locality_id) || "madhapur";

        if (intent === 'COMPARE' && agentState.last_compared_localities && agentState.last_compared_localities.length >= 2) {
          const locA = agentState.last_compared_localities[0] || primaryId;
          const locB = agentState.last_compared_localities[1] || comparisonTarget;
          setComparisonTarget(locB);
          const compareRes = await ApiClient.compareLocalities(locA, locB).catch(() => null);
          if (compareRes) {
            setComparisonPayload(compareRes);
            setActiveTab('comparison');
          }
        } 
        else if (intent === 'PLAN_VISIT') {
          const targetLoc = agentState.last_report_locality || primaryId;
          const itineraryRes = await ApiClient.getItinerary(targetLoc).catch(() => null);
          if (itineraryRes) {
            setActiveItinerary(itineraryRes);
            setActiveTab('itinerary');
          }
        } 
        else if (intent === 'EXPLAIN' || intent === 'REPORT') {
          const targetLoc = agentState.last_explained_locality || agentState.last_report_locality || primaryId;
          const [explainRes, metadataRes] = await Promise.all([
            ApiClient.getExplanation(userId, sessionId, targetLoc).catch(() => null),
            ApiClient.getLocalityMetadata(targetLoc).catch(() => null)
          ]);
          if (explainRes) setActiveExplanation(explainRes);
          if (metadataRes) setRecommendedMetadata(metadataRes);
          setActiveTab('infrastructure');
        }
        else if (intent === 'RECOMMEND') {
          if (recData) {
            const [itineraryRes, explainRes, compareRes, metadataRes] = await Promise.all([
              ApiClient.getItinerary(primaryId).catch(() => null),
              ApiClient.getExplanation(userId, sessionId, primaryId).catch(() => null),
              ApiClient.compareLocalities(primaryId, comparisonTarget).catch(() => null),
              ApiClient.getLocalityMetadata(primaryId).catch(() => null)
            ]);
            if (itineraryRes) setActiveItinerary(itineraryRes);
            if (explainRes) setActiveExplanation(explainRes);
            if (compareRes) setComparisonPayload(compareRes);
            if (metadataRes) setRecommendedMetadata(metadataRes);
          }
          setActiveTab('matrix');
        }
      } else if (response.profile_complete || response.current_stage === 'EVALUATION') {
        await triggerEngineEvaluation();
      }
    } catch (err) {
      console.error("Connection breakdown:", err);
      setChatLogs((prev) => [...prev, { role: 'system', content: "Failed to connect to the backend server. Verify your FastAPI instance is running on port 8000." }]);
    } finally {
      setIsLoading(false);
      loadSessionsList().catch(() => null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    await submitMessage(userMessage);
  };

  const triggerEngineEvaluation = async () => {
    setIsLoading(true);
    try {
      const recData = await ApiClient.getRecommendations(userId, sessionId);
      setRecommendations(recData);
      setCurrentIntent('RECOMMEND');

      if (recData.recommended_locality) {
        const primaryId = recData.recommended_locality.locality_id;
        const [itineraryRes, explainRes, compareRes, metadataRes] = await Promise.all([
          ApiClient.getItinerary(primaryId),
          ApiClient.getExplanation(userId, sessionId, primaryId),
          ApiClient.compareLocalities(primaryId, comparisonTarget),
          ApiClient.getLocalityMetadata(primaryId)
        ]);

        setActiveItinerary(itineraryRes);
        setActiveExplanation(explainRes);
        setComparisonPayload(compareRes);
        setRecommendedMetadata(metadataRes);
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

  const activeLocalityId = (activeExplanation?.locality || recommendedMetadata?.id || "").toLowerCase();

  // Determine active locality to display based on intent
  const activeLocalityData = (currentIntent === 'REPORT' || currentIntent === 'EXPLAIN')
    ? (recommendations?.recommended_locality?.locality_id.toLowerCase() === activeLocalityId
        ? recommendations.recommended_locality
        : recommendations?.ranked_alternatives.find(loc => loc.locality_id.toLowerCase() === activeLocalityId) || {
            name: recommendedMetadata?.name || activeExplanation?.locality || "Kukatpally",
            locality_id: recommendedMetadata?.id || "kukatpally",
            global_suitability_score: recommendations?.ranked_alternatives.find(l => l.locality_id.toLowerCase() === activeLocalityId)?.global_suitability_score || 85.0,
            commute_score: recommendedMetadata?.scores?.connectivity || 5.0,
            dimension_scores: recommendedMetadata?.scores || {},
            calculation_explanation: "Ad-hoc query evaluation generated."
          })
    : recommendations?.recommended_locality;

  // Dynamically select which locality is the focus of the Hero Card and KPI blocks based on the active tab
  const currentDisplayLocality = (() => {
    if (activeTab === 'comparison' && comparisonPayload) {
      const primaryId = comparisonPayload.locality_1_meta.id;
      return recommendations?.recommended_locality?.locality_id === primaryId
        ? recommendations.recommended_locality
        : recommendations?.ranked_alternatives.find(loc => loc.locality_id === primaryId) || {
            name: comparisonPayload.locality_1_meta.name,
            locality_id: primaryId,
            global_suitability_score: 90.0,
            commute_score: 8.0,
            dimension_scores: {}
          };
    }
    if (activeTab === 'itinerary' && activeItinerary) {
      const primaryId = activeItinerary.locality_id;
      return recommendations?.recommended_locality?.locality_id === primaryId
        ? recommendations.recommended_locality
        : recommendations?.ranked_alternatives.find(loc => loc.locality_id === primaryId) || {
            name: activeItinerary.locality_name,
            locality_id: primaryId,
            global_suitability_score: 85.0,
            commute_score: 7.0,
            dimension_scores: {}
          };
    }
    return activeLocalityData;
  })();

  // Synchronize recommendedMetadata and activeItinerary with the focused display locality to prevent metrics/timeline mismatch
  useEffect(() => {
    if (currentDisplayLocality?.locality_id) {
      ApiClient.getLocalityMetadata(currentDisplayLocality.locality_id)
        .then(metadataRes => {
          setRecommendedMetadata(metadataRes);
        })
        .catch(err => console.error("Error loading locality metadata:", err));

      ApiClient.getItinerary(currentDisplayLocality.locality_id)
        .then(itineraryRes => {
          setActiveItinerary(itineraryRes);
        })
        .catch(err => console.error("Error loading itinerary:", err));
    }
  }, [currentDisplayLocality?.locality_id]);

  const activeExplanationText = activeExplanation?.explanation 
    || (currentDisplayLocality && 'calculation_explanation' in currentDisplayLocality ? currentDisplayLocality.calculation_explanation : '')
    || recommendedMetadata?.summary?.overview
    || "Locality intelligence data loaded successfully.";

  // Map active scores properly for Radar Chart key matching
  const mappedActiveScores = currentDisplayLocality ? {
    safety: currentDisplayLocality.dimension_scores?.safety || 5.0,
    transit: currentDisplayLocality.dimension_scores?.connectivity || currentDisplayLocality.dimension_scores?.transit || 5.0,
    affordability: currentDisplayLocality.locality_id === 'jubilee_hills' ? 2.0 :
                   currentDisplayLocality.locality_id === 'hitech_city' ? 4.0 :
                   currentDisplayLocality.locality_id === 'madhapur' ? 4.5 :
                   currentDisplayLocality.locality_id === 'gachibowli' ? 5.0 :
                   currentDisplayLocality.locality_id === 'kondapur' ? 7.0 :
                   currentDisplayLocality.locality_id === 'kukatpally' ? 9.0 : 6.0,
    lifestyle: currentDisplayLocality.dimension_scores?.lifestyle || 5.0
  } : {};

  // Compile localities scores list for radar vector chart comparison (Hyderabad Averages baseline)
  const radarLocalities = recommendations ? [
    recommendations.recommended_locality,
    ...recommendations.ranked_alternatives
  ].map((loc) => {
    const scores = loc.dimension_scores;
    return {
      id: loc.locality_id,
      name: loc.name,
      safety: scores.safety || 5.0,
      transit: scores.connectivity || 5.0,
      affordability: loc.locality_id === 'jubilee_hills' ? 2.0 :
                     loc.locality_id === 'hitech_city' ? 4.0 :
                     loc.locality_id === 'madhapur' ? 4.5 :
                     loc.locality_id === 'gachibowli' ? 5.0 :
                     loc.locality_id === 'kondapur' ? 7.0 :
                     loc.locality_id === 'kukatpally' ? 9.0 : 6.0,
      lifestyle: scores.lifestyle || 5.0
    };
  }) : [
    { id: 'madhapur', name: 'Madhapur', safety: 8.5, transit: 9.5, affordability: 4.5, lifestyle: 9.5 },
    { id: 'gachibowli', name: 'Gachibowli', safety: 9.0, transit: 9.0, affordability: 5.0, lifestyle: 8.0 },
    { id: 'kondapur', name: 'Kondapur', safety: 8.5, transit: 8.5, affordability: 7.0, lifestyle: 8.5 },
    { id: 'hitech_city', name: 'Hitech City', safety: 9.5, transit: 9.5, affordability: 4.0, lifestyle: 9.0 },
    { id: 'jubilee_hills', name: 'Jubilee Hills', safety: 9.5, transit: 8.5, affordability: 2.0, lifestyle: 10.0 },
    { id: 'kukatpally', name: 'Kukatpally', safety: 8.0, transit: 9.0, affordability: 9.0, lifestyle: 7.5 }
  ];

  // Compile list for growth trend line chart appreciation mapping
  const localitiesForChart = (currentIntent === 'COMPARE' && comparisonPayload)
    ? [
        { id: comparisonPayload.locality_1_meta.id, name: comparisonPayload.locality_1_meta.name },
        { id: comparisonPayload.locality_2_meta.id, name: comparisonPayload.locality_2_meta.name }
      ]
    : ((currentIntent === 'REPORT' || currentIntent === 'EXPLAIN') && activeLocalityData)
      ? [
          { id: activeLocalityData.locality_id, name: activeLocalityData.name }
        ]
      : (recommendations ? [
          recommendations.recommended_locality,
          ...recommendations.ranked_alternatives
        ].map(loc => ({
          name: loc.name,
          id: loc.locality_id
        })) : (recommendedMetadata ? [{
          name: recommendedMetadata.name,
          id: recommendedMetadata.id
        }] : []));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 selection:bg-teal-500 selection:text-slate-950 tech-grid mesh-glow relative overflow-hidden">
      {/* Dynamic Ambient Blurs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      {/* HEADER BAR */}
      <header className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* CONVERSATION CONSOLE */}
        <section className="lg:col-span-4 bg-slate-900/40 rounded-xl border border-slate-800 p-5 h-[calc(100vh-140px)] flex flex-col justify-between shadow-2xl backdrop-blur-md glow-border-teal">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
              <h2 className="text-base font-bold tracking-tight text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Advisor Console
              </h2>
              <div className="flex items-center gap-1.5">
                <button 
                  type="button"
                  onClick={() => setShowSessionsList(!showSessionsList)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono rounded text-slate-300 border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  📂 {showSessionsList ? "Chat" : "History"}
                </button>
                <button 
                  type="button"
                  onClick={startNewChatSession}
                  className="px-2 py-1 bg-teal-950/60 hover:bg-teal-900 text-[10px] font-mono rounded text-teal-400 border border-teal-800/40 flex items-center gap-1 transition-colors"
                >
                  ➕ New
                </button>
              </div>
            </div>

            {showSessionsList ? (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2 font-bold">Saved Chat Sessions</div>
                {sessions.length === 0 ? (
                  <div className="text-xs text-slate-600 italic p-6 text-center bg-slate-950/20 border border-slate-800/50 rounded-xl">
                    No active chat sessions found. Start a new chat!
                  </div>
                ) : (
                  sessions.map((sess) => (
                    <button
                      key={sess.session_id}
                      onClick={() => selectChatSession(sess.session_id)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1.5 ${
                        sessionId === sess.session_id 
                          ? 'bg-teal-950/30 border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/5' 
                          : 'bg-slate-950/30 border-slate-850 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-bold truncate">{sess.title || `Chat Session ${sess.session_id.substring(0, 6)}`}</div>
                      <div className="text-[9px] font-mono text-slate-500 flex justify-between items-center w-full">
                        <span>ID: {sess.session_id.substring(0, 8)}...</span>
                        {sess.agent_state?.last_intent && (
                          <span className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            {sess.agent_state.last_intent}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div ref={chatLogsContainerRef} className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                <AnimatePresence initial={false}>
                  {chatLogs.map((msg, index) => (
                    <AnimatedMessage key={index} role={msg.role} content={msg.content} />
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-1 items-center text-xs text-slate-500 font-mono p-2"
                    >
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1.5">AreaIQ is processing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
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
          </div>
        </section>

        {/* DECISION MATRIX CORES DISPLAY */}
        <section className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {isLoading && !['RECOMMEND', 'COMPARE', 'PLAN_VISIT', 'EXPLAIN', 'REPORT'].includes(currentIntent) && (
              <AnimatedPanel key="loading">
                <DashboardSkeleton />
              </AnimatedPanel>
            )}

            {!['RECOMMEND', 'COMPARE', 'PLAN_VISIT', 'EXPLAIN', 'REPORT'].includes(currentIntent) ? (
              <AnimatedPanel key="placeholder">
                <div className="bg-slate-900/30 rounded-xl border border-slate-800 p-12 text-center text-slate-500 shadow-2xl backdrop-blur-md">
                  <div className="text-4xl mb-4 text-teal-400/80 animate-pulse">📊</div>
                  <h3 className="text-lg font-bold text-slate-300 mb-2">Relocation Analytics Canvas</h3>
                  <p className="text-sm max-w-md mx-auto leading-relaxed text-slate-400">
                    Ask AreaIQ to recommend localities, compare neighborhoods (e.g., <span className="text-teal-400 font-mono">"compare Gachibowli and Madhapur"</span>), or request reports (e.g., <span className="text-teal-400 font-mono">"stats for Kukatpally"</span>) to load the visualization matrices.
                  </p>
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
                {/* ADVANCED PRIMARY ENGINE RECOMMENDATION HERO */}
                {currentDisplayLocality && (
                  <AnimatedPanel delay={0.05}>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden shadow-teal-500/5">
                      <div className="absolute top-0 right-0 p-3 bg-teal-500/10 text-teal-400 font-mono text-xs uppercase tracking-wider border-l border-b border-slate-800 rounded-bl-xl font-bold">
                        {currentIntent === 'COMPARE' ? "Locality Comparison" : (currentIntent === 'REPORT' || currentIntent === 'EXPLAIN' ? "Locality Statistics" : "Top Engine Match")}
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest text-teal-400 block mb-1">
                        {currentIntent === 'COMPARE' ? "Side-by-Side Analysis" : (currentIntent === 'REPORT' || currentIntent === 'EXPLAIN' ? "Ad-hoc Report" : "Optimized Core Corridor Match")}
                      </span>

                      {currentIntent === 'COMPARE' && comparisonPayload ? (
                        <>
                          <h2 className="text-4xl font-extrabold text-white tracking-tight">
                            {comparisonPayload.locality_1_meta.name} vs {comparisonPayload.locality_2_meta.name}
                          </h2>
                          <div className="text-2xl font-black text-teal-400 mt-2 font-mono">
                            {comparisonPayload.summary.locality_1_focus_wins > comparisonPayload.summary.locality_2_focus_wins 
                              ? `${comparisonPayload.locality_1_meta.name} leads by ${comparisonPayload.summary.locality_1_focus_wins - comparisonPayload.summary.locality_2_focus_wins} dimensions`
                              : comparisonPayload.summary.locality_2_focus_wins > comparisonPayload.summary.locality_1_focus_wins
                                ? `${comparisonPayload.locality_2_meta.name} leads by ${comparisonPayload.summary.locality_2_focus_wins - comparisonPayload.summary.locality_1_focus_wins} dimensions`
                                : "Balanced Dimension Comparison"}
                          </div>
                          <p className="text-xs text-slate-300 mt-3 border-t border-slate-800/60 pt-3 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                            <span className="font-bold font-mono text-teal-500 block text-[10px] uppercase mb-1">Structural Verdict:</span>
                            {comparisonPayload.summary.structural_verdict}
                          </p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-4xl font-extrabold text-white tracking-tight">{currentDisplayLocality.name}</h2>
                          {currentIntent === 'RECOMMEND' ? (
                            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                              {currentDisplayLocality.global_suitability_score}% Match Index
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2.5 text-sm font-mono font-bold">
                              {recommendedMetadata?.prices?.avg_price_per_sqft && (
                                <span className="text-emerald-400">
                                  Land Price: ₹{recommendedMetadata.prices.avg_price_per_sqft.toLocaleString('en-IN')}/sqft
                                </span>
                              )}
                              {recommendedMetadata?.prices?.rent_3bhk_avg && (
                                <span className="text-teal-400">
                                  Avg 3BHK Rent: ₹{recommendedMetadata.prices.rent_3bhk_avg.toLocaleString('en-IN')}/Mo
                                </span>
                              )}
                              {recommendedMetadata?.prices?.market_tier && (
                                <span className="text-indigo-400">
                                  Market Tier: {recommendedMetadata.prices.market_tier}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-slate-300 mt-3 border-t border-slate-800/60 pt-3 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                            <span className="font-bold font-mono text-teal-500 block text-[10px] uppercase mb-1">
                              {currentIntent === 'RECOMMEND' ? "Engine Mathematical Breakdown:" : "Locality Intelligence Summary:"}
                            </span>
                            {activeExplanationText}
                          </p>
                        </>
                      )}
                    </div>
                  </AnimatedPanel>
                )}

                {/* KPI STATS ROW (Only shown when not comparing) */}
                {currentDisplayLocality && currentIntent !== 'COMPARE' && (
                  <AnimatedPanel delay={0.08}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-lg hover:border-teal-500/30 transition-colors">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Commute Suitability</span>
                          <h3 className="text-xl font-bold font-mono text-teal-400 mt-1">
                            {currentDisplayLocality.commute_score > 0 
                              ? `${(currentDisplayLocality.commute_score / 2).toFixed(1)}/10` 
                              : "Direct Match"}
                          </h3>
                        </div>
                        <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-lg text-sm">🚇</div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-lg hover:border-emerald-500/30 transition-colors">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Appreciation CAGR</span>
                          <h3 className="text-xl font-bold font-mono text-emerald-400 mt-1">
                            {recommendedMetadata?.growth_analytics?.cagr_5_year_pct 
                              ? `${recommendedMetadata.growth_analytics.cagr_5_year_pct}%` 
                              : "15.5%"}
                          </h3>
                        </div>
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm">📈</div>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between shadow-lg hover:border-indigo-500/30 transition-colors">
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Market Price Tier</span>
                          <h3 className="text-xl font-bold font-mono text-indigo-400 mt-1">
                            {recommendedMetadata?.prices?.market_tier || "Premium"}
                          </h3>
                        </div>
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm">💎</div>
                      </div>
                    </div>
                  </AnimatedPanel>
                )}

                {/* TABS CONSOLE SELECTOR NAVIGATION LAYOUT */}
                <AnimatedPanel delay={0.1}>
                  <div className="flex border-b border-slate-800 gap-2 overflow-x-auto scrollbar-none">
                    {(['matrix', 'infrastructure', 'itinerary', 'comparison'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[2px] transition-all relative whitespace-nowrap ${
                          activeTab === tab ? 'text-teal-400 border-teal-500' : 'text-slate-500 hover:text-slate-300 border-transparent'
                        }`}
                      >
                        {tab === 'matrix' ? 'Metrics & Suitability' : 
                         tab === 'infrastructure' ? 'Infrastructure & Prices' : 
                         tab === 'itinerary' ? 'Itinerary Timeline' : 
                         'Comparison Matrix'}
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
                      className="space-y-6"
                    >
                      {/* Ranked alternatives and Dossier */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendations && <AlternativesMatrix alternatives={recommendations.ranked_alternatives} />}
                        <DossierAbstract explanation={activeExplanation} />
                      </div>

                      {/* Integrated Interactive Recharts Visualization Analytics Graphs */}
                      {(recommendations || recommendedMetadata) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <GrowthChart localitiesData={localitiesForChart} />
                          <RadarMetrics 
                            recommendedName={activeLocalityData ? activeLocalityData.name : (recommendedMetadata ? recommendedMetadata.name : "")}
                            recommendedScores={mappedActiveScores}
                            allLocalities={radarLocalities}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'infrastructure' && (
                    <motion.div 
                      key="infrastructure-tab"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="space-y-6"
                    >
                      {/* Land & Rental Price Index Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Land & Rental Price Index Card */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                          <div>
                            <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">Pricing & Market Valuation</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Average asset valuation metrics</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">Land Valuation (Per Sqft)</span>
                              <span className="font-mono text-emerald-400 font-bold">
                                ₹{recommendedMetadata?.prices?.avg_price_per_sqft?.toLocaleString('en-IN') || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">Average 2BHK Rent</span>
                              <span className="font-mono text-teal-400 font-bold">
                                ₹{recommendedMetadata?.prices?.rent_2bhk_avg?.toLocaleString('en-IN') || "N/A"} / Mo
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">Average 3BHK Rent</span>
                              <span className="font-mono text-teal-400 font-bold">
                                ₹{recommendedMetadata?.prices?.rent_3bhk_avg?.toLocaleString('en-IN') || "N/A"} / Mo
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">Market Tier Grade</span>
                              <span className="font-mono text-indigo-400 font-bold">
                                {recommendedMetadata?.prices?.market_tier || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Market Status & 5-Year CAGR Card */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                          <div>
                            <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400">Market Appreciation & Status</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Appreciation metrics & trajectories</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">5-Year Appreciation CAGR</span>
                              <span className="font-mono text-emerald-400 font-bold">
                                {recommendedMetadata?.growth_analytics?.cagr_5_year_pct 
                                  ? `${recommendedMetadata.growth_analytics.cagr_5_year_pct}%` 
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-xs text-slate-300 font-medium">Market Momentum Status</span>
                              <span className="font-mono text-indigo-400 font-bold">
                                {recommendedMetadata?.growth_analytics?.market_status || "N/A"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/20 p-2.5 rounded border border-slate-800/40">
                              • Land prices have appreciated steadily driven by tech expansions.
                              <br />
                              • High rental demand exists from incoming corporate relocation vectors.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities Details (Schools, Hospitals, Metro) */}
                      {recommendedMetadata && (
                        <InsightsPanel recommendedLocality={recommendedMetadata} />
                      )}
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
                        alternatives={recommendations ? recommendations.ranked_alternatives : []}
                        focusName={currentDisplayLocality?.name}
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