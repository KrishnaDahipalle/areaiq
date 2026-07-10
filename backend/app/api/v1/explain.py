from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.memory_service import memory_manager
from app.services.explanation_service import explanation_service

router = APIRouter()

class ExplanationRequest(BaseModel):
    user_id: str = Field(..., example="hackathon_user_1")
    session_id: str = Field(..., example="session_abc123")
    locality_id: str = Field(..., example="madhapur")

@router.post(
    "/explain",
    status_code=status.HTTP_200_OK
)
async def explain_recommendation(payload: ExplanationRequest):
    try:
        # Fetch the active historical state profile context from memory layers
        session = memory_manager.get_or_create_session(payload.user_id, payload.session_id)
        extracted_profile = session.long_term_memory.extracted_profile

        result = explanation_service.generate_explanation(
            user_profile=extracted_profile,
            recommended_locality_id=payload.locality_id
        )
        return result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mathematical metric explanation subsystem error: {str(err)}"
        )