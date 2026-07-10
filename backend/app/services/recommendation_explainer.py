class RecommendationExplainer:

    def explain(
        self,
        recommendation: dict,
        profile: dict
    ):

        reasons = []
        tradeoffs = []

        commute_score = recommendation.get(
            "commute_score",
            0
        )

        if commute_score >= 15:
            reasons.append(
                "Excellent office connectivity"
            )
        elif commute_score >= 10:
            reasons.append(
                "Good office connectivity"
            )

        priorities = profile.get(
            "priorities",
            {}
        )

        if priorities.get("education", 1) >= 7:
            reasons.append(
                "Strong education ecosystem"
            )

        if priorities.get("healthcare", 1) >= 7:
            reasons.append(
                "Strong healthcare access"
            )

        if priorities.get("safety", 1) >= 7:
            reasons.append(
                "Good safety profile"
            )

        if priorities.get("investment", 1) >= 7:
            reasons.append(
                "Strong appreciation potential"
            )

        explanation = (
            recommendation.get(
                "calculation_explanation",
                ""
            )
        )

        if "penalty" in explanation.lower():
            tradeoffs.append(
                "Slight budget pressure compared to cheaper alternatives"
            )

        return {
            "reasons": reasons,
            "tradeoffs": tradeoffs
        }


recommendation_explainer = RecommendationExplainer()