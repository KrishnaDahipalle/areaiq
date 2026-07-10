import json
import google.generativeai as genai

from app.config import settings
from app.services.recommendation_explainer import (
    recommendation_explainer
)


class ResponseBuilder:

    def __init__(self):

        genai.configure(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = genai.GenerativeModel(
            "gemini-flash-lite-latest"
        )

        self.system_prompt = """
You are JD, AreaIQ's senior relocation consultant.

Your job is to explain results naturally.

Rules:

- Be conversational.
- Be confident.
- Explain reasoning.
- Mention tradeoffs.
- Never dump raw JSON.
- If recommendations exist, explain why.
- If comparison exists, explain winner.
- If report exists, summarize insights.
- If itinerary exists, explain visit plan.

When recommendation_context is present:
1. Explain why the locality was selected.
2. Mention strengths.
3. Mention tradeoffs.
4. Mention alternatives.

Sound like an expert advisor.
"""

    def build_response(
        self,
        user_message: str,
        profile: dict,
        plan: dict,
        tool_result: dict,
        critic_result: dict = None
    ):

        recommendation_context = {}

        if (
            plan.get("intent") == "RECOMMEND"
            and tool_result.get("success")
        ):

            recommendation = (
                tool_result.get(
                    "result",
                    {}
                ).get(
                    "recommended_locality",
                    {}
                )
            )

            recommendation_context = (
                recommendation_explainer.explain(
                    recommendation,
                    profile
                )
            )

        payload = {
            "user_message": user_message,
            "profile": profile,
            "plan": plan,
            "tool_result": tool_result,
            "critic_result": critic_result,
            "recommendation_context":
                recommendation_context
        }

        try:

            response = self.model.generate_content(
                f"""
{self.system_prompt}

DATA:

{json.dumps(payload, indent=2)}

Generate the response.
"""
            )

            return response.text.strip()

        except Exception as e:

            print("RESPONSE BUILDER ERROR")
            print(str(e))

            return (
                "I completed the analysis but "
                "encountered a response generation issue."
            )


response_builder = ResponseBuilder()