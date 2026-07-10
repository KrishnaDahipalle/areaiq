import uuid
from typing import Dict, Optional, List, Any
from app.api.schemas.memory import UserSessionStateModel, ShortTermMemoryModel, LongTermMemoryModel

class MemoryService:
    def __init__(self):
        # Operational in-memory session database tracking state across execution turns
        self._sessions: Dict[str, UserSessionStateModel] = {}

    def get_or_create_session(self, user_id: str, session_id: Optional[str] = None) -> UserSessionStateModel:
        """Retrieves an active session state instance or initializes a brand new one."""
        if not session_id or session_id not in self._sessions:
            active_session_id = session_id or str(uuid.uuid4())
            
            new_session = UserSessionStateModel(
                user_id=user_id,
                session_id=active_session_id,
                short_term_memory=ShortTermMemoryModel(
                    conversation_stage="COLLECTING_PROFILE",
                    last_topic_discussed=None,
                    chat_history=[]
                ),
                long_term_memory=LongTermMemoryModel(
                    missing_slots=["purpose", "office_location", "budget", "family_details", "priorities"],
                    is_complete=False,
                    extracted_profile={
                        "purpose": None,
                        "office_location": None,
                        "budget": None,
                        "family_details": None,
                        "priorities": None
                    }
                )
            )
            self._sessions[active_session_id] = new_session
            return new_session
            
        return self._sessions[session_id]

    def update_profile_slot(self, session_id: str, slot_name: str, slot_value: Any) -> UserSessionStateModel:
        """Updates a targeted profile criteria slot value and dynamic completion requirements metrics."""
        if session_id not in self._sessions:
            raise ValueError(f"Target execution session {session_id} not initialized.")
            
        session = self._sessions[session_id]
        long_term = session.long_term_memory
        
        if slot_name in long_term.extracted_profile:
            long_term.extracted_profile[slot_name] = slot_value
            
            # Recalculate remaining missing requirements slots list dynamically
            if slot_value is not None and slot_name in long_term.missing_slots:
                long_term.missing_slots.remove(slot_name)
                
            # Evaluate threshold block flag parameters
            if not long_term.missing_slots:
                long_term.is_complete = True
                session.short_term_memory.conversation_stage = "EVALUATION"
                
        return session

    def add_message_to_buffer(self, session_id: str, role: str, content: str) -> UserSessionStateModel:
        """Appends a conversation message tracking turn instance right into the short-term context buffer."""
        if session_id not in self._sessions:
            raise ValueError(f"Target execution session {session_id} not initialized.")
            
        session = self._sessions[session_id]
        session.short_term_memory.chat_history.append({
            "role": role,
            "content": content
        })
        return session

# Instantiated single service reference instance used across standard runtime endpoints
memory_manager = MemoryService()