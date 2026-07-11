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
You are AreaIQ, a helpful relocation assistant.

Speak normally like a human in a chat conversation.

Rules:
- Be highly conversational, friendly, and direct.
- Do NOT write in long paragraphs or formal essays.
- Keep responses short and punchy (typically 2-4 sentences max).
- If the user's profile is incomplete (plan indicates requires_more_info is true), ask for the next missing information elements in a friendly, conversational way (ask for only one or two things at a time, naturally responding to their message).
- If recommending, comparing, or planning, summarize the main point in 1-2 brief sentences and use short bullet points for details if necessary.
- Never use markdown styling symbols like asterisks (* or **) or hash headers (#). If you need bullet points, use the unicode bullet character (•) followed by a space.
- Use the provided chat_history array to maintain conversational context and follow user choices throughout the conversation (e.g. remember what localities were recommended or discussed).
- Use natural contractions (e.g., "let's", "I'll", "there's") and speak like you are texting a client.
- Avoid formal corporate talk.
"""

    def build_response(
        self,
        user_message: str,
        profile: dict,
        plan: dict,
        tool_result: dict,
        critic_result: dict = None,
        chat_history: list = None
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
            "chat_history": chat_history or [],
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