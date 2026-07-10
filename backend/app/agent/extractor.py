import json
import google.generativeai as genai
from app.config import settings

class AIExtractor:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use gemini-2.5-flash for lightning-fast structural text classification during a hackathon
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def extract_slots_from_text(self, user_message: str, current_profile: dict) -> dict:
        """
        Passive extraction loop. Scans user inputs to isolate structured profile adjustments.
        Returns a clean JSON schema dictionary containing updated fields.
        """
        system_instruction = f"""
        You are a highly precise real estate slot-filling extractor agent for AreaIQ Hyderabad.
        Analyze the incoming user message and extract updates for any of these 5 profile keys:
        1. "purpose": Why are they moving? (e.g., family relocation, bachelor, corporate housing)
        2. "office_location": Specific workspace area name (e.g., Mindspace, Financial District, Gachibowli)
        3. "budget": A dictionary containing key "value" (integer, maximum monthly rental in INR). E.g., if they say 'under 50k', value is 50000.
        4. "family_details": Specific criteria like 'has_children' (boolean) or 'family_size' (integer).
        5. "priorities": A dictionary allocating importance values from 1.0 (Low) to 10.0 (Critical) for target dimensions: "safety", "education", "healthcare", "connectivity", "investment", "lifestyle".

        CURRENT PROFILE STATE REFERENCE:
        {json.dumps(current_profile)}

        CRITICAL OUTPUT RULE:
        You must reply EXCLUSIVELY with a valid raw JSON object. Do not include markdown codeblocks (like ```json), no wrapping prose, and no explanation text. If a value cannot be extracted, set its value to null.
        """

        try:
            response = self.model.generate_content(
                contents=[
                    {"role": "user", "parts": [f"{system_instruction}\n\nUSER MESSAGE: {user_message}"]}
                ]
            )
            
            # Sanitization logic block targeting clean JSON isolation
            clean_text = response.text.strip()
            if clean_text.startswith("```"):
                clean_text = clean_text.split("```")[1]
                if clean_text.startswith("json"):
                    clean_text = clean_text[4:]
            
            extracted_json = json.loads(clean_text.strip())
            return extracted_json
        except Exception:
            # Fallback defensively if formatting or rate-limits hiccup during live evaluation
            return {}

ai_extractor = AIExtractor()