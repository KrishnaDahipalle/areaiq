class PlannerAgent:

    def plan(
        self,
        user_message: str,
        current_profile: dict,
        missing_slots: list
    ):

        msg = user_message.lower()

        if (
            "compare" in msg
            or "vs" in msg
            or "versus" in msg
        ):
            return {
                "intent": "COMPARE",
                "reason": "Comparison request",
                "requires_more_info": False,
                "missing_information": [],
                "entities": {}
            }

        if any(
            x in msg
            for x in [
                "recommend",
                "suggest",
                "best area",
                "best locality",
                "where should i live",
                "which area"
            ]
        ):
            return {
                "intent": "RECOMMEND",
                "reason": "Recommendation request",
                "requires_more_info": False,
                "missing_information": [],
                "entities": {}
            }

        if any(
            x in msg
            for x in [
                "why",
                "explain",
                "details"
            ]
        ):
            return {
                "intent": "EXPLAIN",
                "reason": "Explanation request",
                "requires_more_info": False,
                "missing_information": [],
                "entities": {}
            }

        if missing_slots:

            return {
                "intent": "COLLECT_PROFILE",
                "reason": "Profile incomplete",
                "requires_more_info": True,
                "missing_information": missing_slots,
                "entities": {}
            }

        return {
            "intent": "RECOMMEND",
            "reason": "Profile complete",
            "requires_more_info": False,
            "missing_information": [],
            "entities": {}
        }


planner_agent = PlannerAgent()