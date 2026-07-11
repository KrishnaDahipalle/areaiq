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

        Infer persona.
        Possible values:

        WORKING_PROFESSIONAL
        FAMILY
        STUDENT
        INVESTOR
        BUSINESS_OWNER
        TENANT

        Examples:

        "I am moving for work"
        -> persona = WORKING_PROFESSIONAL

        "I want to buy property"
        -> persona = INVESTOR

        "I am moving with my wife and kids"
        -> persona = FAMILY

        "I want to open a restaurant"
        -> persona = BUSINESS_OWNER

        "I need a rental"
        -> persona = TENANT

        "I am joining college"
        -> persona = STUDENT

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
            prompt = f"""
            {system_instruction}

            You are an information extraction engine.
            Isolate parameters from the user's message.
            Keep all current values from the CURRENT STATE REGISTERS unless explicitly changed or overridden by the user.

            Return ONLY valid JSON.

            Schema:
            {{
              "persona": null or string (WORKING_PROFESSIONAL, FAMILY, STUDENT, INVESTOR, BUSINESS_OWNER, TENANT),
              "purpose": null or string,
              "office_location": null or string,
              "budget": {{
                "value": null or number
              }},
              "family_details": {{
                "has_children": null or boolean,
                "family_size": null or number
              }},
              "priorities": {{
                "safety": null or number,
                "education": null or number,
                "healthcare": null or number,
                "connectivity": null or number,
                "investment": null or number,
                "lifestyle": null or number
              }},
              "preferences": {{
                "avoid_localities": null or array of strings,
                "walk_to_work": null or boolean,
                "avoid_traffic": null or boolean,
                "nightlife_importance": null or number,
                "investment_focus": null or boolean,
                "quiet_neighborhood": null or boolean,
                "good_schools_priority": null or boolean
              }}
            }}

            User Message:
            {user_message}
            """
            response = self.model.generate_content(prompt)

            print("\nRAW GEMINI RESPONSE:")
            print(response.text)

            text = response.text.strip()

            # Robust markdown JSON block extraction
            if "```" in text:
                import re
                match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
                if match:
                    text = match.group(1).strip()

            parsed_json = json.loads(text)
            
            # Pure validation extraction using our schema definition model
            validated = MasterExtractionPayload.model_validate(parsed_json)
            return validated.model_dump(exclude_none=True)
        except Exception as e:
            print("\nEXTRACTOR ERROR:")
            print(type(e))
            print(str(e))
            return {}

ai_extractor = AIExtractor()