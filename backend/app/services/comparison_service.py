from typing import Dict, Any, List
from app.services.ranking_service import ranking_engine

class ComparisonService:
    def compare_localities(
        self,
        locality_id_1: str,
        locality_id_2: str
    ) -> Dict[str, Any]:
        """
        Executes granular side-by-side suitability and pricing variance calculations
        between two discrete urban tech corridors.
        """
        dataset = ranking_engine._load_dataset()
        localities = dataset.get("localities", [])

        locality_1 = next(
            (loc for loc in localities if str(loc.get("id")).strip().lower() == locality_id_1.strip().lower()),
            None
        )
        locality_2 = next(
            (loc for loc in localities if str(loc.get("id")).strip().lower() == locality_id_2.strip().lower()),
            None
        )

        if not locality_1 or not locality_2:
            raise ValueError(
                f"Comparison pipeline abort sequence: One or both locality entities missing. "
                f"Parameters requested: target_a={locality_id_1}, target_b={locality_id_2}"
            )

        scores_1 = locality_1["scores"]
        scores_2 = locality_2["scores"]
        prices_1 = locality_1["prices"]
        prices_2 = locality_2["prices"]

        dimensions = ["safety", "education", "healthcare", "connectivity", "investment", "lifestyle"]
        comparison_matrix: Dict[str, Dict[str, float]] = {}
        
        locality_1_wins = 0
        locality_2_wins = 0

        # Compute pure matrix score variances
        for dim in dimensions:
            val_1 = float(scores_1.get(dim, 0.0))
            val_2 = float(scores_2.get(dim, 0.0))
            
            comparison_matrix[dim] = {
                "locality_1_value": val_1,
                "locality_2_value": val_2,
                "variance": round(val_1 - val_2, 2)
            }
            
            if val_1 > val_2:
                locality_1_wins += 1
            elif val_2 > val_1:
                locality_2_wins += 1

        # Calculate absolute financial rental overhead vectors
        rent_variance_3bhk = int(prices_1.get("rent_3bhk_avg", 0)) - int(prices_2.get("rent_3bhk_avg", 0))
        
        # Formulate analytical conclusion string
        if locality_1_wins > locality_2_wins:
            verdict = f"{locality_1['name']} exhibits superior structural utility across {locality_1_wins} target dimensions."
        elif locality_2_wins > locality_1_wins:
            verdict = f"{locality_2['name']} holds the performance advantage, outperforming across {locality_2_wins} vector blocks."
        else:
            verdict = "Localities hold an identical score allocation balance across the evaluated parameters matrix."

        winner_name = None

        if locality_1_wins > locality_2_wins:
            winner_name = locality_1["name"]
        elif locality_2_wins > locality_1_wins:
            winner_name = locality_2["name"]

        winner_strengths = []
        loser_strengths = []

        for dim in dimensions:

            val_1 = float(scores_1.get(dim, 0))
            val_2 = float(scores_2.get(dim, 0))

            if val_1 > val_2:
                winner_strengths.append(
                    f"{locality_1['name']} performs better in {dim}"
                )

            elif val_2 > val_1:
                loser_strengths.append(
                    f"{locality_2['name']} performs better in {dim}"
                )

        return {
            "locality_1_meta": {"id": locality_1["id"], "name": locality_1["name"], "tier": prices_1["market_tier"]},
            "locality_2_meta": {"id": locality_2["id"], "name": locality_2["name"], "tier": prices_2["market_tier"]},
            "dimensional_matrix": comparison_matrix,
            "financial_variance": {
                "rent_3bhk_delta_inr": rent_variance_3bhk,
                "more_affordable": locality_2["name"] if rent_variance_3bhk > 0 else locality_1["name"]
            },
            "summary": {
                "locality_1_score_wins": locality_1_wins,
                "locality_2_score_wins": locality_2_wins,
                "structural_verdict": verdict
            },
            "comparison_insights": {
                "winner": winner_name,
                "winner_strengths": winner_strengths,
                "other_strengths": loser_strengths,
                "recommendation": (
                    f"{winner_name} appears to be the stronger overall option "
                    f"based on the evaluated dimensions."
                    if winner_name
                    else "Both localities are closely matched."
                )
            }
        }

comparison_service = ComparisonService()