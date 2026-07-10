export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestPayload {
  user_id: string;
  session_id: string;
  message: string;
}

export interface ChatResponsePayload {
  session_id: string;
  reply: string;
  current_stage: string;
  profile_complete: boolean;
  missing_slots: string[];
}

export interface LocalityScoreBreakdown {
  locality_id: string;
  name: string;
  global_suitability_score: number;
  dimension_scores: Record<string, number>;
  calculation_explanation: string;
}

export interface RecommendResponsePayload {
  recommended_locality: LocalityScoreBreakdown;
  ranked_alternatives: LocalityScoreBreakdown[];
  conflicts_detected: string[];
  consultant_summary: string;
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const ApiClient = {
  async sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponsePayload> {
    const response = await fetch(`${BASE_API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`API Chat error: ${response.statusText}`);
    }
    return response.json();
  },

  async getRecommendations(user_id: string, session_id: string): Promise<RecommendResponsePayload> {
    const response = await fetch(`${BASE_API_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, session_id }),
    });
    if (!response.ok) {
      throw new Error(`API Recommendation error: ${response.statusText}`);
    }
    return response.json();
  },

  async getLocalityData(localityId: string): Promise<any> {
    const response = await fetch(`${BASE_API_URL}/locality/IN/TS/Hyderabad/${localityId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`API Locality fetch error: ${response.statusText}`);
    }
    return response.json();
  }
};