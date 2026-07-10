from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.memory_service import memory_manager
from app.services.ranking_service import ranking_engine

router = APIRouter()

class EngineEvaluationInputPayload(BaseModel):
    user_id: str = Field(..., example="hackathon_user_1")
    session_id: str = Field(..., example="session_abc123")

class LocalityScoringResponse(BaseModel):
    locality_id: str
    name: str
    global_suitability_score: float
    dimension_scores: dict[str, float]
    calculation_explanation: str

class CompleteRecommendationPayloadResponse(BaseModel):
    recommended_locality: LocalityScoringResponse
    ranked_alternatives: list[LocalityScoringResponse]
    conflicts_detected: list[str]

@router.post("/recommend", response_model=CompleteRecommendationPayloadResponse, status_code=status.HTTP_200_OK)
async def compile_suitability_matrix(payload: EngineEvaluationInputPayload):
    try:
        # Retrieve target evaluation user profile session states
        session = memory_manager.get_or_create_session(payload.user_id, payload.session_id)
        
        # Execute multi-criteria matrix scoring optimizations over data structures
        results = ranking_engine.calculate_rankings(user_profile=session.long_term_memory.extracted_profile)
        
        return CompleteRecommendationPayloadResponse(
            recommended_locality=results["recommended_locality"],
            ranked_alternatives=results["ranked_alternatives"],
            conflicts_detected=results["conflicts_detected"]
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mathematical rank compilation routing pipeline collapse: {str(err)}"
        )