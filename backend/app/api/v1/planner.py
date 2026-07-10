from fastapi import APIRouter, HTTPException
from app.services.planner_service import planner_service

router = APIRouter()

@router.get("/planner/{locality_id}")
async def generate_plan(locality_id: str):
    try:
        return planner_service.generate_localized_itinerary(
            locality_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )