import json
import os
import math
from typing import Dict, List, Any, Tuple
from app.api.schemas.locality import UnifiedLocalityModel, CompleteCityPayloadModel

class RankingService:
    def __init__(self):
        # Locate and resolve our seeded demo dataset tracking configurations
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_file_path = os.path.join(base_dir, "data", "store", "IN", "TS", "hyderabad_demo.json")
        self._cached_city_data: Optional[Dict[str, Any]] = None

    def _load_dataset(self) -> Dict[str, Any]:
        """Loads and parses the hard historical baseline trend cache asset file safely."""
        if not self._cached_city_data:
            if not os.path.exists(self.data_file_path):
                raise FileNotFoundError(f"Seeded locality tracking frame missing at path: {self.data_file_path}")
            with open(self.data_file_path, "r", encoding="utf-8") as file:
                self._cached_city_data = json.load(file)
        return self._cached_city_data

    def calculate_rankings(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a Multi-Criteria Decision Analysis (MCDA) matrix over our 6 demo areas.
        Bakes in user weight allocations alongside deterministic budget penalty caps.
        """
        dataset = self._load_dataset()
        localities_list = dataset.get("localities", [])
        
        # Extract constraints from user profile context data frames
        user_budget = float(user_profile.get("budget", {}).get("value") or 1000000)
        user_priorities: Dict[str, float] = user_profile.get("priorities", {})
        
        # Fallback to equal weighting configurations if priorities aren't completely extracted
        dimensions = ["safety", "education", "healthcare", "connectivity", "investment", "lifestyle"]
        weights = {d: float(user_priorities.get(d, 1.0)) for d in dimensions}
        sum_weights = sum(weights.values()) or 1.0
        
        scored_results = []
        conflicts = []
        
        for loc in localities_list:
            scores_matrix = loc.get("scores", {})
            prices_matrix = loc.get("prices", {})
            
            # 1. Compute Base Weighted Suitability Profile Vector
            weighted_sum = sum(scores_matrix.get(d, 5.0) * weights[d] for d in dimensions)
            base_suitability = (weighted_sum / sum_weights) * 10.0 # Standardize metric scaling to a 0-100 ceiling
            
            # 2. Execute Financial Penalty Function Bounds Calculation
            avg_rent = float(prices_matrix.get("rent_3bhk_avg", 0))
            penalty = 0.0
            
            if avg_rent > user_budget:
                # Calculate percent overshoot threshold value
                overshoot_pct = (avg_rent - user_budget) / user_budget
                # Apply exponential deduction score boundaries
                penalty = min(base_suitability * 0.8, (overshoot_pct * 40.0))
                conflicts.append(f"{loc.get('name')} average market listing rate exceeds your targeted budget boundary.")
                
            final_score = round(max(0.0, base_suitability - penalty), 2)
            
            scored_results.append({
                "locality_id": loc.get("id"),
                "name": loc.get("name"),
                "global_suitability_score": final_score,
                "dimension_scores": scores_matrix,
                "calculation_explanation": f"Base composite utility calculated at {round(base_suitability, 1)}% suitability metrics with a localized cost offset constraint adjustments penalty deduction value of {round(penalty, 1)}% points applied."
            })
            
        # Sort output rows in descending order based on mathematical matrix yield values
        ranked_outputs = sorted(scored_results, key=lambda x: x["global_suitability_score"], reverse=True)
        
        return {
            "recommended_locality": ranked_outputs[0],
            "ranked_alternatives": ranked_outputs[1:],
            "conflicts_detected": list(set(conflicts))
        }

ranking_engine = RankingService()