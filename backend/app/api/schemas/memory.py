from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class ChatMessageModel(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="The exact text content of the message")


class ShortTermMemoryModel(BaseModel):
    conversation_stage: str = Field(
        "COLLECTING_PROFILE",
        description="Current execution node"
    )

    last_topic_discussed: Optional[str] = Field(
        None,
        description="Tracks immediate context"
    )

    chat_history: List[ChatMessageModel] = Field(
        default_factory=list,
        description="Recent conversation turns"
    )


class BudgetProfile(BaseModel):
    value: Optional[float] = Field(None)
    currency: str = "INR"
    preferred_type: str = "Rent"


class FamilyProfile(BaseModel):
    has_children: Optional[bool] = Field(None)
    family_size: Optional[int] = Field(None)


class PriorityMatrixAllocation(BaseModel):
    safety: float = Field(1.0, ge=1.0, le=10.0)
    education: float = Field(1.0, ge=1.0, le=10.0)
    healthcare: float = Field(1.0, ge=1.0, le=10.0)
    connectivity: float = Field(1.0, ge=1.0, le=10.0)
    investment: float = Field(1.0, ge=1.0, le=10.0)
    lifestyle: float = Field(1.0, ge=1.0, le=10.0)


class AgentState(BaseModel):
    last_intent: Optional[str] = None
    last_recommendation: Optional[str] = None
    last_report_locality: Optional[str] = None
    last_explained_locality: Optional[str] = None
    last_compared_localities: List[str] = Field(
        default_factory=list
    )


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

    agent_state: AgentState = Field(
        default_factory=AgentState
    )


class UserSessionStateModel(BaseModel):
    user_id: str
    session_id: str
    short_term_memory: ShortTermMemoryModel
    long_term_memory: LongTermMemoryModel