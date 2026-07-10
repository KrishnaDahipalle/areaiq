from typing import Dict, Any, List, Optional
from app.services.ranking_service import ranking_engine
from app.api.schemas.locality import CompleteCityPayloadModel, UnifiedLocalityModel

class ExplanationService:
    def generate_explanation(
        self,
        user_profile: Dict[str, Any],
        recommended_locality_id: str
    ) -> Dict[str, Any]:
        """
        Dynamically analyzes a locality's validated Pydantic score vectors against 
        a user's extracted priorities to provide mathematically backed fit explanations.
        """
        # 1. Ingest data via strict Pydantic model payloads
        city_payload: CompleteCityPayloadModel = ranking_engine._load_dataset()
        localities: List[UnifiedLocalityModel] = city_payload.localities

        # 2. Extract specific model instance using clean object properties
        locality: Optional[UnifiedLocalityModel] = next(
            (loc for loc in localities if loc.id.lower() == recommended_locality_id.lower()),
            None
        )

        if not locality:
            raise ValueError(f"Locality reference token '{recommended_locality_id}' not found in master records.")

        # 3. Access scores through the Pydantic schema property
        scores: Dict[str, float] = locality.scores
        user_priorities: Dict[str, Any] = user_profile.get("priorities", {}) or {}
        
        reasons: List[str] = []
        
        dimension_labels = {
            "safety": "High-security threshold configuration with robust localized emergency responsiveness.",
            "connectivity": "Highly optimized transit accessibility and seamless highway/metro corridor link infrastructure.",
            "education": "Top-tier immediate proximity access vectors to elite international institutions.",
            "healthcare": "Exceptional concentration of multi-specialty clinical operators and healthcare hubs.",
            "investment": "Strong historical CAGR trajectory mapping premium capital appreciation metrics.",
            "lifestyle": "Vibrant recreational ecosystem scaling rich social profile density metrics."
        }

        for dim, description in dimension_labels.items():
            loc_score = float(scores.get(dim, 5.0))
            user_weight = float(user_priorities.get(dim, 1.0))
            
            # Analytical evaluation loop targeting profile priority weights
            if loc_score >= 8.5 or (user_weight >= 7.0 and loc_score >= 7.5):
                reasons.append(description)

        if not reasons:
            reasons.append("Balanced structural performance matching generic city baseline parameters securely.")

        return {
            "locality": locality.name,
            "matched_priority_count": len(reasons),
            "explanation": reasons,
            "summary": locality.ai_insights_anchor
        }

explanation_service = ExplanationService()