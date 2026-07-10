class PreferenceService:

    def apply_preference_rules(
        self,
        locality,
        preferences
    ):

        bonus = 0

        scores = locality.get(
            "scores",
            {}
        )

        if preferences.get(
            "avoid_traffic"
        ):
            bonus += (
                scores.get(
                    "connectivity",
                    5
                ) * 0.5
            )

        if preferences.get(
            "good_schools_priority"
        ):
            bonus += (
                scores.get(
                    "education",
                    5
                ) * 0.5
            )

        if preferences.get(
            "investment_focus"
        ):
            bonus += (
                scores.get(
                    "investment",
                    5
                ) * 0.5
            )

        if preferences.get(
            "quiet_neighborhood"
        ):
            bonus += (
                scores.get(
                    "safety",
                    5
                ) * 0.3
            )

        return bonus


preference_service = PreferenceService()