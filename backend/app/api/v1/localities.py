from fastapi import APIRouter, HTTPException, status
from app.services.ranking_service import ranking_engine

router = APIRouter()

@router.get("/locality/{country_code}/{state_code}/{city_name}/{locality_id}", status_code=status.HTTP_200_OK)
async def serve_static_locality_node(country_code: str, state_code: str, city_name: str, locality_id: str):
    try:
        # Read the raw seeded JSON array to parse targeted single items out for chart initialization
        dataset = ranking_engine._load_dataset()
        localities = dataset.get("localities", [])
        
        target = next((item for item in localities if item.get("id") == locality_id.lower()), None)
        
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Locality reference code identifier '{locality_id}' not found in target city coordinates."
            )
        return target
    except Exception as err:
        if isinstance(err, HTTPException):
            raise err
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data provider repository link layer processing failure: {str(err)}"
        )