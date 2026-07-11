import json
import re
import google.generativeai as genai
from app.config import settings

class PlannerAgent:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-flash-lite-latest")

    def plan(
        self,
        user_message: str,
        current_profile: dict,
        missing_slots: list
    ):
        system_instruction = """
        You are the Intent and Entity Classifier for AreaIQ Hyderabad.
        Analyze the user's message and return a JSON payload classifying their intent and extracting locality entities.

        Valid Locality IDs:
        - gachibowli
        - hitech_city
        - kondapur
        - madhapur
        - jubilee_hills
        - kukatpally

        Intents:
        1. COMPARE: User wants to compare or contrast two areas (e.g. "compare madhapur vs gachibowli", "gachibowli vs kondapur", "which is better: kukatpally or miyapur").
           Entities: 'locality_a' and 'locality_b' mapped to valid locality IDs.
        2. EXPLAIN: User asks "why" an area was recommended, or requests specific explanation/details for an area (e.g. "why did you choose madhapur?", "explain gachibowli match").
           Entities: 'locality_id'.
        3. REPORT: User asks for a dossier, report, analytical summary, market status, or price history (e.g., "show me the report for jubilee hills", "dossier for gachibowli").
           Entities: 'locality_id'.
        4. PLAN_VISIT: User wants to visit, check out the neighborhood, or get a field itinerary (e.g., "plan a visit to madhapur", "give me an itinerary for kondapur").
           Entities: 'locality_id'.
        5. RECOMMEND: User is asking for the best place for them or general recommendations.
        6. COLLECT_PROFILE: Default when user is chatting or answering questions.

        Return ONLY a raw JSON block matching this schema:
        {
          "intent": "COMPARE" | "EXPLAIN" | "REPORT" | "PLAN_VISIT" | "RECOMMEND" | "COLLECT_PROFILE",
          "reason": "brief reason for classification",
          "entities": {
            "locality_a": null or string,
            "locality_b": null or string,
            "locality_id": null or string
          }
        }
        """

        try:
            response = self.model.generate_content(
                f"{system_instruction}\n\nUser Message:\n{user_message}"
            )
            text = response.text.strip()

            if "```" in text:
                match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
                if match:
                    text = match.group(1).strip()

            plan_data = json.loads(text)
        except Exception as e:
            print("\nPLANNER LLM ERROR:", str(e))
            plan_data = {
                "intent": "COLLECT_PROFILE",
                "reason": "Error parsing LLM response",
                "entities": {}
            }

        intent = plan_data.get("intent", "COLLECT_PROFILE")
        entities = plan_data.get("entities", {})

        # Normalize entity names to lowercase if mapped
        if entities:
            for k, v in entities.items():
                if isinstance(v, str):
                    entities[k] = v.lower().strip()

        # If they asked for a specific command, we prioritize executing it immediately
        if intent in ["COMPARE", "EXPLAIN", "REPORT", "PLAN_VISIT"]:
            return {
                "intent": intent,
                "reason": plan_data.get("reason", "User requested command"),
                "requires_more_info": False,
                "missing_information": [],
                "entities": entities
            }

        # Otherwise, if the profile is incomplete, collect profile
        if missing_slots:
            return {
                "intent": "COLLECT_PROFILE",
                "reason": "Profile incomplete",
                "requires_more_info": True,
                "missing_information": missing_slots,
                "entities": {}
            }

        return {
            "intent": "RECOMMEND",
            "reason": "Profile complete",
            "requires_more_info": False,
            "missing_information": [],
            "entities": {}
        }

planner_agent = PlannerAgent()