export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponsePayload {
  session_id: string;
  reply: string;
  current_stage: string;
  profile_complete: boolean;
  missing_slots: string[];
  agent_state?: {
    last_intent?: string;
    last_recommendation?: string;
    last_report_locality?: string;
    last_explained_locality?: string;
    last_compared_localities?: string[];
  };
}

export interface LocalityScoringResponse {
  locality_id: string;
  name: string;
  global_suitability_score: number;
  commute_score: number;
  dimension_scores: Record<string, number>;
  calculation_explanation: string;
}

export interface RecommendResponsePayload {
  recommended_locality: LocalityScoringResponse;
  ranked_alternatives: LocalityScoringResponse[];
  conflicts_detected: string[];
}

export interface DimensionalMatrixEntry {
  locality_1_value: number;
  locality_2_value: number;
  variance: number;
}

export interface ComparisonResponsePayload {
  locality_1_meta: {
    id: string;
    name: string;
    tier: string;
  };
  locality_2_meta: {
    id: string;
    name: string;
    tier: string;
  };
  dimensional_matrix: Record<string, DimensionalMatrixEntry>;
  financial_variance: {
    rent_3bhk_delta_inr: number;
    more_affordable: string;
  };
  summary: {
    locality_1_focus_wins: number;
    locality_2_focus_wins: number;
    structural_verdict: string;
  };
}

export interface ExplanationResponsePayload {
  locality: string;
  matched_priority_count: number;
  explanation: string[];
  summary: string;
}

export interface ItineraryItem {
  time: string;
  milestone: string;
  activity: string;
}

export interface ItineraryResponsePayload {
  locality_id: string;
  locality_name: string;
  recommended_focus: string;
  itinerary: ItineraryItem[];
}

export class ApiClient {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Network pipeline communication breakdown: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Dispatches user message tokens straight to the conversational agent loop coordinator
   */
  static async sendChatMessage(payload: { user_id: string; session_id: string; message: string }): Promise<ChatResponsePayload> {
    return this.request<ChatResponsePayload>("/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Compiles the MCDA suitability evaluation matrix based on extracted user state vectors
   */
  static async getRecommendations(user_id: string, session_id: string): Promise<RecommendResponsePayload> {
    return this.request<RecommendResponsePayload>("/recommend", {
      method: "POST",
      body: JSON.stringify({ user_id, session_id }),
    });
  }

  /**
   * Executes a cross-matrix side-by-side dimensional performance and budget variant assessment
   */
  static async compareLocalities(area1: string, area2: string): Promise<ComparisonResponsePayload> {
    return this.request<ComparisonResponsePayload>("/compare", {
      method: "POST",
      body: JSON.stringify({ area1, area2 }),
    });
  }

  /**
   * Generates mathematical alignment analysis matching profile priorities to area indexes
   */
  static async getExplanation(user_id: string, session_id: string, locality_id: string): Promise<ExplanationResponsePayload> {
    return this.request<ExplanationResponsePayload>("/explain", {
      method: "POST",
      body: JSON.stringify({ user_id, session_id, locality_id }),
    });
  }

  /**
   * Pulls physical neighborhood exploration timelines generated from asset vectors
   */
  static async getItinerary(locality_id: string): Promise<ItineraryResponsePayload> {
    return this.request<ItineraryResponsePayload>(`/planner/generate/${locality_id}`, {
      method: "GET",
    });
  }

  /**
   * Fetches raw locality details including pros, cons, schools, and hospitals
   */
  static async getLocalityMetadata(locality_id: string): Promise<any> {
    return this.request<any>(`/locality/IN/TS/Hyderabad/${locality_id}`, {
      method: "GET",
    });
  }

  /**
   * Fetches list of all chat sessions for a user ID
   */
  static async listSessions(userId: string): Promise<any[]> {
    return this.request<any[]>(`/chat/sessions/${userId}`, {
      method: "GET",
    });
  }

  /**
   * Fetches and restores previous chat logs and state for a session
   */
  static async getSession(userId: string, sessionId: string): Promise<any> {
    return this.request<any>(`/chat/sessions/${userId}/${sessionId}`, {
      method: "GET",
    });
  }
}