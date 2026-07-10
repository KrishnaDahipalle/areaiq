from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.comparison_service import comparison_service

router = APIRouter()

class ComparisonRequest(BaseModel):
    area1: str = Field(..., example="kondapur", description="Unique text identifier matching primary dataset keys")
    area2: str = Field(..., example="gachibowli", description="Unique text identifier matching primary dataset keys")

@router.post(
    "/compare",
    status_code=status.HTTP_200_OK
)
async def compare_localities(payload: ComparisonRequest):
    try:
        result = comparison_service.compare_localities(
            payload.area1,
            payload.area2
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
            detail=f"Comparative cross-matrix routing failure sequence: {str(err)}"
        )