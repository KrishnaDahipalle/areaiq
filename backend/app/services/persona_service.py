class PersonaService:

    PERSONA_QUESTIONS = {
        "WORKING_PROFESSIONAL":
            "Where is your office located and what monthly rent budget are you targeting?",

        "FAMILY":
            "How many family members are moving and are schools important?",

        "INVESTOR":
            "Are you focused on rental yield, appreciation, or long-term capital growth?",

        "BUSINESS_OWNER":
            "What type of business are you planning and what customer profile are you targeting?",

        "TENANT":
            "What monthly budget and locality preferences do you have?",

        "STUDENT":
            "Which college or university will you attend and what is your housing budget?"
    }

    def next_question(self, persona):
        return self.PERSONA_QUESTIONS.get(
            persona,
            "Tell me more about your relocation goals."
        )

persona_service = PersonaService()