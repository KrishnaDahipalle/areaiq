from fastapi import APIRouter, HTTPException, status
from app.services.report_service import report_service
router = APIRouter()


@router.get(
    "/report/{locality_id}",
    status_code=status.HTTP_200_OK
)
async def get_locality_report(
    locality_id: str
):
    try:
        report = report_service.generate_report(
            locality_id
        )
        return report
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err)
        )