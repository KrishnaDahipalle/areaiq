from typing import Dict, Any

from app.services.ranking_service import ranking_engine
from app.services.comparison_service import comparison_service
from app.services.explanation_service import explanation_service
from app.services.report_service import report_service
from app.services.planner_service import planner_service


class ToolExecutor:

    def execute(
        self,
        plan: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:

        intent = plan.get("intent")
        entities = plan.get("entities", {})

        try:

            if intent == "RECOMMEND":

                result = ranking_engine.calculate_rankings(
                    user_profile=user_profile
                )

                return {
                    "success": True,
                    "tool": "ranking_engine",
                    "result": result
                }

            if intent == "COMPARE":

                locality_a = entities.get("locality_a")
                locality_b = entities.get("locality_b")

                if not locality_a or not locality_b:
                    return {
                        "success": False,
                        "error": "Two localities required."
                    }

                result = comparison_service.compare_localities(
                    locality_a,
                    locality_b
                )

                return {
                    "success": True,
                    "tool": "comparison_service",
                    "result": result
                }

            if intent == "EXPLAIN":

                locality_id = entities.get("locality_id")

                if not locality_id:
                    return {
                        "success": False,
                        "error": "Locality required."
                    }

                result = explanation_service.generate_explanation(
                    user_profile=user_profile,
                    recommended_locality_id=locality_id
                )

                return {
                    "success": True,
                    "tool": "explanation_service",
                    "result": result
                }

            if intent == "REPORT":

                locality_id = entities.get("locality_id")

                if not locality_id:
                    return {
                        "success": False,
                        "error": "Locality required."
                    }

                result = report_service.generate_report(
                    locality_id
                )

                return {
                    "success": True,
                    "tool": "report_service",
                    "result": result
                }

            if intent == "PLAN_VISIT":

                locality_id = entities.get("locality_id")

                if not locality_id:
                    return {
                        "success": False,
                        "error": "Locality required."
                    }

                result = planner_service.generate_localized_itinerary(
                    locality_id
                )

                return {
                    "success": True,
                    "tool": "planner_service",
                    "result": result
                }

            return {
                "success": False,
                "error": f"Unsupported intent: {intent}"
            }

        except Exception as e:

            return {
                "success": False,
                "error": str(e)
            }


tool_executor = ToolExecutor()