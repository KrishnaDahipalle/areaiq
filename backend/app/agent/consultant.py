import google.generativeai as genai
from typing import List, Dict
from app.config import settings

class AIConsultant:
    def __init__(self):
        # Bind credentials dynamically from configuration states
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Keep the exact elite advisor behavioral ruleset
        self.system_base = """
        You are 'JD', an expert AI real estate relocation advisor for AreaIQ helping a client move to Hyderabad.
        Your immediate objective is to hold a warm, conversational, natural dialogue while gathering information.

        CONVERSATION PROTOCOL:
        1. Acknowledge what the user just said naturally (do not sound like a robotic form filler).
        2. Answer any immediate questions they have about Hyderabad areas, traffic, or layouts with absolute authority.
        3. Pivot smoothly to ask exactly ONE conversational question designed to extract details for the highest priority missing slot. Never ask multiple questions at once.
        4. If the missing slots list is empty, warmly notify the user that their customized locality intelligence dashboard is ready below!
        """
        
        # Initialize the model without the version-locked keyword argument
        self.model = genai.GenerativeModel(model_name="gemini-2.0-flash")

    def generate_response(self, chat_history: List[Dict[str, str]], missing_slots: List[str]) -> str:
        """
        Generates contextual conversations that politely steer the user to fill missing profile requirements.
        """
        next_target_slot = missing_slots[0] if missing_slots else "NONE"
        
        # Build the dynamic system prompt wrapper block
        dynamic_system_instruction = f"{self.system_base}\n\n[SYSTEM CONTEXT: Remaining slots = {missing_slots} | Current Focus Target = '{next_target_slot}']"

        # Initialize the contents array with the system instruction framed as the baseline context anchor
        gemini_contents = [
            {
                "role": "user",
                "parts": [f"{dynamic_system_instruction}\n\nUnderstood. Let's begin the tracking conversation."]
            },
            {
                "role": "model",
                "parts": ["Understood. I am initialized as JD. Ready to assist the client with their relocation."]
            }
        ]

        # Append the historical message turns cleanly from short-term memory schemas
        for turn in chat_history:
            gemini_contents.append({
                "role": "user" if turn["role"] == "user" else "model",
                "parts": [turn["content"]]
            })

        try:
            # Dispatch the request down to the generation pipeline
            response = self.model.generate_content(contents=gemini_contents)
            return response.text.strip()
        except Exception:
            return f"I am organizing your relocation criteria details right now. Could you tell me more about your target {next_target_slot.replace('_', ' ')}?"

ai_consultant = AIConsultant()