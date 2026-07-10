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


class ChatOutputResponse(BaseModel):
    session_id: str
    reply: str
    current_stage: str
    profile_complete: bool
    missing_slots: list[str]


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
            missing_slots=result["missing_slots"]
        )

    except Exception as err:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent orchestration failure: {str(err)}"
        )