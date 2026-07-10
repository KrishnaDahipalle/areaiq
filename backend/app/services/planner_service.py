from typing import Dict, Any, List
from app.services.ranking_service import ranking_engine

class PlannerService:
    def generate_localized_itinerary(self, locality_id: str) -> Dict[str, Any]:
        """
        Generates a targeted, time-blocked neighborhood inspection itinerary
        built directly around the infrastructure assets of the specific locality.
        """
        dataset = ranking_engine._load_dataset()
        localities = dataset.get("localities", [])
        
        locality = next(
            (loc for loc in localities if loc["id"].lower() == locality_id.lower()),
            None
        )
        
        if not locality:
            raise ValueError(f"Locality reference key '{locality_id}' not found.")
            
        amenities = locality.get("amenities", {})
        schools = amenities.get("schools", ["Local Academy Tier-1"])
        hospitals = amenities.get("hospitals", ["Multi-specialty Medical Center"])
        metro = amenities.get("metro_stations", ["Primary Transit Node"])
        
        return {
            "locality_id": locality["id"],
            "locality_name": locality["name"],
            "recommended_focus": locality["ai_insights_anchor"],
            "itinerary": [
                {
                    "time": "09:30 AM",
                    "milestone": "Peak Commute Transit Test",
                    "activity": f"Arrive via {metro[0] if metro else 'main arterial link'} to evaluate real rush-hour congestion vectors to the tech park entry nodes."
                },
                {
                    "time": "11:30 AM",
                    "milestone": "Social Profile Infrastructure Walk",
                    "activity": f"Walk the immediate residential clusters flanking {schools[0] if schools else 'top localized school links'} to assess pedestrian accessibility."
                },
                {
                    "time": "02:00 PM",
                    "milestone": "Healthcare Link Contingency Validation",
                    "activity": f"Map navigation timelines to {hospitals[0] if hospitals else 'emergency clinics'} to check secondary road network traffic profiles."
                },
                {
                    "time": "04:30 PM",
                    "milestone": "Vibe Match Vibe Assessment",
                    "activity": "Inspect high-density market centers and retail complexes to judge noise levels during evening peak hours."
                }
            ]
        }

planner_service = PlannerService()