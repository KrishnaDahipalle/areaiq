import json
import os
import logging
from typing import Dict, List, Any, Optional
from app.api.schemas.locality import UnifiedLocalityModel
from app.services.commute_service import commute_service
from app.services.preference_service import (
    preference_service
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AreaIQRankingEngine")

class RankingService:
    COMMUTE_WEIGHT = 2.5
    def __init__(self):
        # Locate and resolve our seeded demo dataset tracking configurations
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_file_path = os.path.join(base_dir, "data", "store", "IN", "TS", "hyderabad_demo.json")
        self._cached_city_data: Optional[Dict[str, Any]] = None

    def _load_dataset(self) -> Dict[str, Any]:
        """Loads and parses the hard historical baseline trend cache asset file safely."""
        if not self._cached_city_data:
            if not os.path.exists(self.data_file_path):
                logger.error(f"Seeded locality tracking frame missing at path: {self.data_file_path}")
                raise FileNotFoundError(f"Seeded locality tracking frame missing at path: {self.data_file_path}")
            with open(self.data_file_path, "r", encoding="utf-8") as file:
                self._cached_city_data = json.load(file)
        return self._cached_city_data

    def calculate_rankings(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes an advanced Multi-Criteria Decision Analysis (MCDA) matrix operation.
        Dynamically adapts cost matrices based on structural family profile size parameters 
        and applies an exponential penalty function overshoot calculation.
        """
        dataset = self._load_dataset()
        localities_list = dataset.get("localities", [])
        
        # 1. Parse and extract dynamic constraints from the long-term user profile state
        budget_block = user_profile.get("budget", {}) or {}
        user_budget = float(budget_block.get("value") or 1000000.0)
        
        family_details = user_profile.get("family_details", {}) or {}
        family_size = int(family_details.get("family_size") or 1)
        
        user_priorities = user_profile.get("priorities", {}) or {}
        preferences = (
            user_profile.get(
                "preferences",
                {}
            )
        )
        office_location = (user_profile.get("office_location"))   
        
        # 2. Establish baseline target parameters for vector weight normalization
        dimensions = ["safety", "education", "healthcare", "connectivity", "investment", "lifestyle"]
        weights = {}
        for d in dimensions:
            # Safely capture string weights from AI extractor and cast to floating points
            raw_weight = user_priorities.get(d, 1.0)
            try:
                weights[d] = float(raw_weight) if raw_weight is not None else 1.0
            except ValueError:
                weights[d] = 1.0
                
        sum_weights = sum(weights.values()) or 1.0
        
        scored_results = []
        conflicts = []
        
        # 3. Process calculations across all data rows
        for loc in localities_list:
            blocked_localities = {
                x.lower()
                for x in preferences.get(
                    "avoid_localities",
                    []
                )
            }

            if (loc.get("id","").lower() in blocked_localities):
                continue
            scores_matrix = loc.get("scores", {})
            prices_matrix = loc.get("prices", {})
            
            # Compute base weighted suitability vector profile (Standardized to 0-100 base)
            weighted_sum = sum(float(scores_matrix.get(d, 5.0)) * weights[d] for d in dimensions)
            base_suitability = (weighted_sum / sum_weights) * 10.0
            
            # 4. Adaptive Pricing Extraction: Choose unit target criteria based on family parameters
            # If the user has a larger family footprint, evaluate against the 3BHK profile index; else 2BHK.
            if family_size >= 3:
                avg_rent = float(prices_matrix.get("rent_3bhk_avg", 0.0))
                rent_label = "3BHK average market listing index"
            else:
                avg_rent = float(prices_matrix.get("rent_2bhk_avg", 0.0))
                rent_label = "2BHK average market listing index"
                
            # 5. Execute Financial Penalty Function Bounds Calculation
            penalty = 0.0
            if avg_rent > user_budget:
                # Calculate absolute target overshoot metrics percentage
                overshoot_pct = (avg_rent - user_budget) / user_budget
                # Apply high-precision exponential deduction penalty scaling
                penalty = min(base_suitability * 0.85, (overshoot_pct * 45.0))
                conflicts.append(
                    f"{loc.get('name')} {rent_label} ({int(avg_rent)} INR) exceeds your specified target budget threshold."
                )
                
            commute_bonus = (
                commute_service.get_commute_score(
                    office_location,
                    loc.get("id")
                )
                * self.COMMUTE_WEIGHT
            )

            preference_bonus = (
                preference_service
                .apply_preference_rules(
                    loc,
                    preferences
                )
            )

            if office_location:

                commute_bonus = (
                    commute_service.get_commute_score(
                        office_location,
                        loc.get("id")
                    )
                    * 2.0
                )

            final_score = round(
                max(
                    0.0,
                    base_suitability
                    - penalty
                    + commute_bonus
                    + preference_bonus
                ),
                2
            )
            scored_results.append({
                "locality_id": loc.get("id"),
                "name": loc.get("name"),
                "global_suitability_score": final_score,
                "commute_score": commute_bonus,
                "dimension_scores": {d: float(scores_matrix.get(d, 5.0)) for d in dimensions},
                "calculation_explanation": (
                    f"Base composite utility optimization yields {round(base_suitability, 1)}% structural alignment. "
                    f"Applied a financial variance constraint penalty deduction of {round(penalty, 1)}% points based on "
                    f"{rent_label} values."
                )
            })
            
        if not scored_results:
            raise ValueError("No matching matrix indices processed out of the local source framework database.")
            
        # 6. Sort rows strictly in descending structural sequence
        ranked_outputs = sorted(scored_results, key=lambda x: x["global_suitability_score"], reverse=True)
        
        return {
            "recommended_locality": ranked_outputs[0],
            "ranked_alternatives": ranked_outputs[1:],
            "conflicts_detected": list(set(conflicts))
        }

ranking_engine = RankingService()