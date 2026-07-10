from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ChatMessageModel(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="The exact text content of the message")

class ShortTermMemoryModel(BaseModel):
    conversation_stage: str = Field("COLLECTING_PROFILE", description="Current execution node: COLLECTING_PROFILE, EVALUATION, COMPLETE")
    last_topic_discussed: Optional[str] = Field(None, description="Tracks the immediate contextual thread topic")
    chat_history: List[ChatMessageModel] = Field(default_factory=list, description="Recent conversation turns for UI buffer context")

class BudgetProfile(BaseModel):
    value: Optional[float] = Field(None, description="Maximum ceiling value extracted")
    currency: str = "INR"
    preferred_type: str = "Rent"

class FamilyProfile(BaseModel):
    has_children: Optional[bool] = Field(None, description="Flag for school accessibility weightings")
    family_size: Optional[int] = Field(None, description="Total absolute count of relocation members")

class PriorityMatrixAllocation(BaseModel):
    safety: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for local safety indexes")
    education: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for school access points")
    healthcare: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for clinical asset proximity")
    connectivity: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for transit corridors")
    investment: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for long-term appreciation trajectories")
    lifestyle: float = Field(1.0, ge=1.0, le=10.0, description="Importance allocation value for social profile density metrics")

class LongTermMemoryModel(BaseModel):
    missing_slots: List[str] = Field(
        default_factory=lambda: [
            "purpose",
            "office_location",
            "budget",
            "family_details",
            "priorities"
        ]
    )

    is_complete: bool = False

    extracted_profile: Dict[str, Any] = Field(
        default_factory=lambda: {
            "purpose": None,

            "office_location": None,

            "budget": {
                "value": None,
                "currency": "INR",
                "preferred_type": "Rent"
            },

            "family_details": {
                "has_children": None,
                "family_size": None
            },

            "priorities": {
                "safety": 1.0,
                "education": 1.0,
                "healthcare": 1.0,
                "connectivity": 1.0,
                "investment": 1.0,
                "lifestyle": 1.0
            },

            "preferences": {
                "avoid_localities": [],
                "walk_to_work": False,
                "avoid_traffic": False,
                "nightlife_importance": 5,
                "investment_focus": False,
                "quiet_neighborhood": False,
                "good_schools_priority": False
            }
        }
    )

class UserSessionStateModel(BaseModel):
    user_id: str
    session_id: str
    short_term_memory: ShortTermMemoryModel
    long_term_memory: LongTermMemoryModel