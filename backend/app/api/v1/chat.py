from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.agent.coordinator import areaiq_agent

router = APIRouter()


class ChatInputPayload(BaseModel):
    user_id: str = Field(..., example="hackathon_user_1")
    session_id: str = Field(..., example="session_abc123")
    message: str = Field(
        ...,
        example="I work in Mindspace and my budget is 50000."
    )


from app.api.schemas.memory import AgentState
from typing import Optional

class ChatOutputResponse(BaseModel):
    session_id: str
    reply: str
    current_stage: str
    profile_complete: bool
    missing_slots: list[str]
    agent_state: Optional[AgentState] = None


@router.post(
    "/chat",
    response_model=ChatOutputResponse,
    status_code=status.HTTP_200_OK
)
async def process_advisor_turn(
    payload: ChatInputPayload
):
    try:

        result = await areaiq_agent.process_user_turn(
            user_id=payload.user_id,
            session_id=payload.session_id,
            user_message=payload.message
        )

        return ChatOutputResponse(
            session_id=result["session_id"],
            reply=result["reply"],
            current_stage=result["current_stage"],
            profile_complete=result["profile_complete"],
            missing_slots=result["missing_slots"],
            agent_state=result.get("agent_state")
        )

    except Exception as err:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent orchestration failure: {str(err)}"
        )


@router.get("/chat/sessions/{user_id}", status_code=status.HTTP_200_OK)
async def list_user_sessions(user_id: str):
    from app.services.memory_service import memory_manager
    memory = memory_manager._load_long_term_memory(user_id)
    if not memory:
        return []
    
    sessions_list = []
    for sid, sdata in memory.chat_sessions.items():
        sessions_list.append({
            "session_id": sid,
            "title": sdata.get("title", f"Session {sid[:6]}"),
            "agent_state": sdata.get("agent_state")
        })
    return sessions_list


@router.get("/chat/sessions/{user_id}/{session_id}", status_code=status.HTTP_200_OK)
async def get_session_state(user_id: str, session_id: str):
    from app.services.memory_service import memory_manager
    session = memory_manager.get_or_create_session(user_id, session_id)
    
    return {
        "session_id": session.session_id,
        "chat_history": [
            {"role": m.role, "content": m.content}
            for m in session.short_term_memory.chat_history
        ],
        "agent_state": session.long_term_memory.agent_state.model_dump()
    }