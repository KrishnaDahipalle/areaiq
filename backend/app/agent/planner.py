import json
import google.generativeai as genai

from app.config import settings


class PlannerAgent:

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)

        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash"
        )

        self.system_prompt = """
You are the AreaIQ Planning Agent.

Determine the user's intent.

Available intents:

COLLECT_PROFILE
RECOMMEND
COMPARE
EXPLAIN
REPORT
PLAN_VISIT
CHAT

Return JSON only.

Schema:

{
  "intent":"",
  "reason":"",
  "requires_more_info":false,
  "missing_information":[],
  "entities":{}
}
"""

    def plan(
        self,
        user_message: str,
        current_profile: dict,
        missing_slots: list
    ):

        prompt = f"""
CURRENT PROFILE:
{json.dumps(current_profile)}

MISSING SLOTS:
{missing_slots}

USER MESSAGE:
{user_message}
"""

        try:

            response = self.model.generate_content(
                f"{self.system_prompt}\n\n{prompt}"
            )

            text = response.text.strip()

            if text.startswith("```json"):
                text = (
                    text.replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            return json.loads(text)

        except Exception:

            return {
                "intent": "CHAT",
                "reason": "Planner fallback",
                "requires_more_info": False,
                "missing_information": [],
                "entities": {}
            }


planner_agent = PlannerAgent()