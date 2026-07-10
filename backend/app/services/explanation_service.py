from typing import Dict, Any, List, Optional
from app.services.ranking_service import ranking_engine

class ExplanationService:

    def generate_explanation(
        self,
        user_profile: Dict[str, Any],
        recommended_locality_id: str
    ) -> Dict[str, Any]:

        dataset = ranking_engine._load_dataset()

        localities = dataset.get("localities", [])

        locality = next(
            (
                loc
                for loc in localities
                if str(loc.get("id", "")).lower()
                == recommended_locality_id.lower()
            ),
            None
        )

        if not locality:
            raise ValueError(
                f"Locality '{recommended_locality_id}' not found"
            )

        scores = locality.get("scores", {})

        user_priorities = (
            user_profile.get("priorities", {})
            or {}
        )

        reasons = []

        dimension_labels = {
            "safety":
                "Strong safety profile with reliable neighborhood security.",
            "connectivity":
                "Excellent connectivity through major roads and transit corridors.",
            "education":
                "Access to quality schools and educational institutions nearby.",
            "healthcare":
                "Strong healthcare ecosystem with hospitals and clinics.",
            "investment":
                "Good long-term investment and appreciation potential.",
            "lifestyle":
                "Rich lifestyle ecosystem with dining, retail, and recreation."
        }

        for dim, description in dimension_labels.items():

            loc_score = float(
                scores.get(dim, 5.0)
            )

            user_weight = float(
                user_priorities.get(dim, 1.0)
            )

            if (
                loc_score >= 8.5
                or (
                    user_weight >= 7
                    and loc_score >= 7.5
                )
            ):
                reasons.append(description)

        if not reasons:
            reasons.append(
                "Balanced performance across key decision dimensions."
            )

        return {
            "locality":
                locality.get("name"),
            "matched_priority_count":
                len(reasons),
            "explanation":
                reasons,
            "summary":
                locality.get(
                    "overview",
                    "No summary available."
                )
        }

explanation_service = ExplanationService()