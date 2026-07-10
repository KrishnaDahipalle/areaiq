import google.generativeai as genai
from typing import List, Dict
from app.config import settings

class AIConsultant:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate_response(self, chat_history: List[Dict[str, str]], missing_slots: List[str]) -> str:
        """
        Generates contextual conversations that politely steer the user to fill missing profile requirements.
        """
        next_target_slot = missing_slots[0] if missing_slots else "NONE"
        
        system_instruction = f"""
        You are 'JD', an expert AI real estate relocation advisor for AreaIQ helping a client move to Hyderabad.
        Your immediate objective is to hold a warm, conversational, natural dialogue while gathering information.
        
        THE PROFILE CRITERIA WE ARE MISSING IS: {missing_slots}
        THE HIGHEST PRIORITY HOLE WE NEED TO FILL RIGHT NOW IS: '{next_target_slot}'

        CONVERSATION PROTOCOL:
        1. Acknowledge what the user just said naturally (do not sound like a robotic form filler).
        2. Answer any immediate questions they have about Hyderabad areas, traffic, or layouts with absolute authority.
        3. Pivot smoothly to ask exactly ONE conversational question designed to extract details for the highest priority missing slot ('{next_target_slot}'). Never ask multiple questions at once.
        4. If the missing slots list is empty, warmly notify the user that their customized locality intelligence dashboard is ready below!
        """

        # Convert state model schema dictionary rows down into Gemini history turn blocks
        gemini_contents = [{"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]} for m in chat_history]
        
        # Prepend our system rules instruction set directly into the operational buffer chain
        gemini_contents.insert(0, {"role": "user", "parts": [system_instruction]})

        try:
            response = self.model.generate_content(contents=gemini_contents)
            return response.text.strip()
        except Exception as e:
            return "I am processing your location constraints right now. Could you clarify your budget target limits for the moving plan?"

ai_consultant = AIConsultant()