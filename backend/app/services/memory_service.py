import uuid
import os
import json
from typing import Dict, Optional, Any

from app.api.schemas.memory import (
    UserSessionStateModel,
    ShortTermMemoryModel,
    LongTermMemoryModel,
    ChatMessageModel
)

class MemoryService:
    def __init__(self):
        self._sessions: Dict[str, UserSessionStateModel] = {}
        # Ensure storage directory exists under backend/app/storage
        self.storage_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
            "storage"
        )
        os.makedirs(self.storage_dir, exist_ok=True)

    def _get_storage_path(self, user_id: str) -> str:
        safe_user_id = "".join(c for c in user_id if c.isalnum() or c in ("-", "_")).rstrip()
        return os.path.join(self.storage_dir, f"long_term_{safe_user_id}.json")

    def _load_long_term_memory(self, user_id: str) -> Optional[LongTermMemoryModel]:
        path = self._get_storage_path(user_id)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return LongTermMemoryModel.model_validate(data)
            except Exception as e:
                print(f"Error loading long-term memory for user {user_id}: {e}")
        return None

    def _save_long_term_memory(self, user_id: str, memory: LongTermMemoryModel):
        path = self._get_storage_path(user_id)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(memory.model_dump(), f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving long-term memory for user {user_id}: {e}")

    def get_or_create_session(
        self,
        user_id: str,
        session_id: Optional[str] = None
    ) -> UserSessionStateModel:
        # Load stored long-term profile data if available
        long_term = self._load_long_term_memory(user_id)
        if not long_term:
            long_term = LongTermMemoryModel()

        active_session_id = session_id or str(uuid.uuid4())
        
        if active_session_id in self._sessions:
            return self._sessions[active_session_id]

        short_term = ShortTermMemoryModel()
        if active_session_id in long_term.chat_sessions:
            stored = long_term.chat_sessions[active_session_id]
            short_term.chat_history = [
                ChatMessageModel(role=m["role"], content=m["content"])
                for m in stored.get("chat_history", [])
            ]
            if stored.get("agent_state"):
                from app.api.schemas.memory import AgentState
                try:
                    long_term.agent_state = AgentState.model_validate(stored["agent_state"])
                except Exception as e:
                    print(f"Error parsing agent state: {e}")

        session = UserSessionStateModel(
            user_id=user_id,
            session_id=active_session_id,
            short_term_memory=short_term,
            long_term_memory=long_term
        )

        self._sessions[active_session_id] = session
        return session

    def add_message_to_buffer(
        self,
        session_id: str,
        role: str,
        content: str
    ):
        session = self._sessions[session_id]
        msg = ChatMessageModel(role=role, content=content)
        session.short_term_memory.chat_history.append(msg)
        
        if session_id not in session.long_term_memory.chat_sessions:
            session.long_term_memory.chat_sessions[session_id] = {
                "session_id": session_id,
                "title": f"Chat Session {session_id[:6]}",
                "chat_history": [],
                "agent_state": session.long_term_memory.agent_state.model_dump()
            }
        
        session.long_term_memory.chat_sessions[session_id]["chat_history"].append(msg.model_dump())
        session.long_term_memory.chat_sessions[session_id]["agent_state"] = session.long_term_memory.agent_state.model_dump()
        
        if len(session.short_term_memory.chat_history) >= 1:
            title = session.short_term_memory.chat_history[0].content
            if len(title) > 25:
                title = title[:22] + "..."
            session.long_term_memory.chat_sessions[session_id]["title"] = title

        self._save_long_term_memory(session.user_id, session.long_term_memory)
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

    def persist_session_state(self, session_id: str):
        if session_id in self._sessions:
            session = self._sessions[session_id]
            self._save_long_term_memory(session.user_id, session.long_term_memory)

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
            if slot == "budget":
                if value.get("value") is None:
                    missing.append(slot)
                continue
            if slot == "family_details":
                if value.get("family_size") is None and value.get("has_children") is None:
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
        
        # Save modifications instantly
        self._save_long_term_memory(session.user_id, session.long_term_memory)

memory_manager = MemoryService()