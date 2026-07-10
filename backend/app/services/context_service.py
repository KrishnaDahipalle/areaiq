class ContextService:

    def resolve_reference(
        self,
        message: str,
        agent_state
    ):

        msg = message.lower()

        if "it" in msg:

            return (
                agent_state.last_recommendation
            )

        if any(
            word in msg
            for word in [
                "school",
                "schools",
                "education"
            ]
        ):

            if (
                agent_state
                .last_compared_localities
            ):
                return {
                    "type": "comparison_context",
                    "localities":
                        agent_state
                        .last_compared_localities
                }

        return None


context_service = ContextService()