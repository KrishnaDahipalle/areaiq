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

class LongTermMemoryModel(BaseModel):
    missing_slots: List[str] = Field(
        default_factory=lambda: ["purpose", "office_location", "budget", "family_details", "priorities"],
        description="Tracks unfilled criteria tokens required before calculation execution"
    )
    is_complete: bool = False
    extracted_profile: Dict[str, Any] = Field(
        default_factory=lambda: {
            "purpose": None,
            "office_location": None,
            "budget": None,
            "family_details": None,
            "priorities": None
        },
        description="Persisted metrics capturing verified user constraints"
    )

class UserSessionStateModel(BaseModel):
    user_id: str
    session_id: str
    short_term_memory: ShortTermMemoryModel
    long_term_memory: LongTermMemoryModel