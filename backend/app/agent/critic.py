from typing import Dict, Any, List


class RecommendationCritic:

    def review_recommendation(
        self,
        recommendation_payload: Dict[str, Any],
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:

        issues = []
        warnings = []

        recommended = recommendation_payload.get(
            "recommended_locality",
            {}
        )

        locality_name = recommended.get("name")

        profile_budget = (
            user_profile.get("budget", {})
            .get("value")
        )

        family_size = (
            user_profile.get("family_details", {})
            .get("family_size")
        )

        preferences = (
            user_profile.get("preferences", {})
        )

        avoided_localities = (
            preferences.get(
                "avoid_localities",
                []
            )
        )

        if locality_name:

            if locality_name.lower() in [
                x.lower()
                for x in avoided_localities
            ]:
                issues.append(
                    f"{locality_name} was explicitly rejected by the user."
                )

        if profile_budget:

            explanation = recommended.get(
                "calculation_explanation",
                ""
            )

            if "penalty" in explanation.lower():
                warnings.append(
                    "Recommended locality exceeded budget and required penalty adjustment."
                )

        if family_size:

            if (
                family_size >= 4
                and locality_name
                and locality_name.lower()
                in [
                    "madhapur",
                    "hitech_city"
                ]
            ):
                warnings.append(
                    "Large family profile may prefer larger residential communities."
                )

        return {
            "approved": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "recommended_locality": locality_name
        }


critic_agent = RecommendationCritic()