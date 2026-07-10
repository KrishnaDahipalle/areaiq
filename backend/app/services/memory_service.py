import uuid
from typing import Dict, Optional, Any

from app.api.schemas.memory import (
    UserSessionStateModel,
    ShortTermMemoryModel,
    LongTermMemoryModel
)

class MemoryService:
    def __init__(self):
        self._sessions: Dict[str, UserSessionStateModel] = {}

    def get_or_create_session(
        self,
        user_id: str,
        session_id: Optional[str] = None
    ) -> UserSessionStateModel:

        if not session_id or session_id not in self._sessions:
            active_session_id = session_id or str(
                uuid.uuid4()
            )
            session = UserSessionStateModel(
                user_id=user_id,
                session_id=active_session_id,
                short_term_memory=ShortTermMemoryModel(),
                long_term_memory=LongTermMemoryModel()
            )

            self._sessions[
                active_session_id
            ] = session
            return session
        return self._sessions[session_id]

    def add_message_to_buffer(
        self,
        session_id: str,
        role: str,
        content: str
    ):
        session = self._sessions[session_id]
        session.short_term_memory.chat_history.append(
            {
                "role": role,
                "content": content
            }
        )
        return session

    def update_profile_slot(
        self,
        session_id: str,
        slot_name: str,
        slot_value: Any
    ):
        session = self._sessions[session_id]
        profile = (
            session
            .long_term_memory
            .extracted_profile
        )

        profile[slot_name] = slot_value
        self._recalculate_state(session)
        return session

    def merge_profile_update(
        self,
        session_id: str,
        incoming_data: Dict[str, Any]
    ):
        session = self._sessions[session_id]
        profile = (
            session
            .long_term_memory
            .extracted_profile
        )
        for key, value in incoming_data.items():
            if value is None:
                continue

            if (
                isinstance(value, dict)
                and isinstance(profile.get(key), dict)
            ):
                profile[key].update(value)

            else:
                profile[key] = value
        self._recalculate_state(session)
        return session

    def _recalculate_state(
        self,
        session
    ):
        profile = (
            session
            .long_term_memory
            .extracted_profile
        )
        required = [
            "purpose",
            "office_location",
            "budget",
            "family_details",
            "priorities"
        ]

        missing = []
        for slot in required:
            value = profile.get(slot)
            if value is None:
                missing.append(slot)
                continue
            if isinstance(value, dict):
                meaningful = any(
                    v is not None
                    for v in value.values()
                )
                if not meaningful:
                    missing.append(slot)

        session.long_term_memory.missing_slots = missing
        session.long_term_memory.is_complete = (
            len(missing) == 0
        )
        session.short_term_memory.conversation_stage = (
            "EVALUATION"
            if session.long_term_memory.is_complete
            else "COLLECTING_PROFILE"
        )

memory_manager = MemoryService()