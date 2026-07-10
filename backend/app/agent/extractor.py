import json
from typing import Dict, Any, Optional
import google.generativeai as genai
from pydantic import BaseModel, Field
from app.config import settings

# Define matching Pydantic response structures for type-safe inference
class BudgetSlotSchema(BaseModel):
    value: Optional[int] = Field(None, description="Maximum monthly rent ceiling limit in INR numbers.")

class FamilySlotSchema(BaseModel):
    has_children: Optional[bool] = Field(None, description="True if kids or schooling context are present.")
    family_size: Optional[int] = Field(None, description="Total relocation headcount count index.")

class PrioritiesSlotSchema(BaseModel):
    safety: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")
    education: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")
    healthcare: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")
    connectivity: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")
    investment: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")
    lifestyle: Optional[float] = Field(None, description="Scale parameter valuation from 1.0 to 10.0")

class PreferenceSlotSchema(BaseModel):
    avoid_localities: Optional[list[str]] = None
    walk_to_work: Optional[bool] = None
    avoid_traffic: Optional[bool] = None
    nightlife_importance: Optional[int] = None
    investment_focus: Optional[bool] = None
    quiet_neighborhood: Optional[bool] = None
    good_schools_priority: Optional[bool] = None
    

class MasterExtractionPayload(BaseModel):
    purpose: Optional[str] = Field(None)
    office_location: Optional[str] = Field(None)
    budget: Optional[BudgetSlotSchema] = Field(None)
    family_details: Optional[FamilySlotSchema] = Field(None)
    priorities: Optional[PrioritiesSlotSchema] = Field(None)
    preferences: Optional[PreferenceSlotSchema] = Field(None)

class AIExtractor:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-flash-lite-latest")

    def extract_slots_from_text(self, user_message: str, current_profile: dict) -> dict:
        """
        Passive parameter extraction using native structural json token rendering configurations.
        """
        system_instruction = f"""
        You are a structured extraction engine for AreaIQ Hyderabad. Isolating parameters from user messages.
        
        CURRENT STATE REGISTERS:
        {json.dumps(current_profile)}
        
        If an attribute is populated in the state register, keep it unless overridden explicitly.

        Also extract lifestyle preferences.

        Examples:

        "I hate traffic"
        -> avoid_traffic=true

        "I prefer quiet places"
        -> quiet_neighborhood=true

        "I want good schools"
        -> good_schools_priority=true

        "I want nightlife"
        -> nightlife_importance=10

        "Don't recommend Madhapur"
        -> avoid_localities=["madhapur"]

        "I want to walk to work"
        -> walk_to_work=true

        "I am investing"
        -> investment_focus=true
        """
        
        try:
            response = self.model.generate_content(
                f"""
            You are an information extraction engine.

            Extract relocation information from the user message.

            Return ONLY valid JSON.

            Schema:

            {{
            "purpose": null,
            "office_location": null,
            "budget": {{
                "value": null
            }},
            "family_details": {{
                "has_children": null,
                "family_size": null
            }},
            "preferences": {{
                "avoid_traffic": null,
                "quiet_neighborhood": null,
                "walk_to_work": null,
                "investment_focus": null
            }}
            }}

            User Message:
            {user_message}
            """
            )

            print("\nRAW GEMINI RESPONSE:")
            print(response.text)

            text = response.text.strip()

            if text.startswith("```json"):
                text = (
                    text.replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            return json.loads(text)
            print("\nRAW GEMINI RESPONSE:")
            print(response.text)
            
            # Pure validation extraction using our schema definition model
            validated = MasterExtractionPayload.model_validate_json(response.text.strip())
            return validated.model_dump(exclude_none=True)
        except Exception as e:
            print("\nEXTRACTOR ERROR:")
            print(type(e))
            print(str(e))
            return {}

ai_extractor = AIExtractor()