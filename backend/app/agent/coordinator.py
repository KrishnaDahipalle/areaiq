import logging
from typing import Dict, Any
from app.services.memory_service import memory_manager
from app.agent.extractor import ai_extractor
from app.agent.guard import agent_guard
from app.agent.validator import agent_validator
from app.agent.planner import planner_agent
from app.agent.executor import tool_executor
from app.agent.critic import critic_agent
from app.agent.response_builder import response_builder
from app.services.context_service import context_service
from app.services.persona_service import persona_service

logger = logging.getLogger("AreaIQAgentCoordinator")


class AreaIQAgentCoordinator:

    def __init__(self):
        self.checklist_slots = [
            "purpose",
            "office_location",
            "budget",
            "family_details",
            "priorities"
        ]

    async def process_user_turn(
        self,
        user_id: str,
        session_id: str,
        user_message: str
    ) -> Dict[str, Any]:

        logger.info(
            f"[AREAIQ] Processing session {session_id}"
        )

        is_safe, sanitized_text = (
            agent_guard.verify_message_sanity(
                user_message
            )
        )

        if not is_safe:

            session = memory_manager.get_or_create_session(
                user_id,
                session_id
            )

            return self._format_agent_output(
                session,
                sanitized_text
            )

        session = memory_manager.get_or_create_session(
            user_id,
            session_id
        )

        memory_manager.add_message_to_buffer(
            session.session_id,
            "user",
            sanitized_text
        )

        extracted = ai_extractor.extract_slots_from_text(
            user_message=sanitized_text,
            current_profile=
                session.long_term_memory.extracted_profile
        )
        print("\nEXTRACTED:")
        print(extracted)

        if isinstance(extracted, dict):

            validated, conflicts = (
                agent_validator.validate_and_repair_slots(
                    extracted
                )
            )

            memory_manager.merge_profile_update(
                session.session_id,
                validated
            )
            session = memory_manager.get_or_create_session(
                user_id,
                session_id
            )

            print("\nPROFILE:")
            print(session.long_term_memory.extracted_profile)

            print("\nMISSING:")
            print(session.long_term_memory.missing_slots)

            session = memory_manager.get_or_create_session(
                user_id,
                session_id
            )

        long_term = session.long_term_memory
        short_term = session.short_term_memory

        print(type(long_term))
        print(dir(long_term))

        context = context_service.resolve_reference(
            sanitized_text,
            long_term.agent_state
        )

        if (
            long_term.is_complete
            and short_term.conversation_stage
                == "EVALUATION"
        ):

            plan = {
                "intent": "RECOMMEND",
                "reason": "Profile completed",
                "requires_more_info": False,
                "entities": {}
            }

        else:

            plan = planner_agent.plan(
                user_message=sanitized_text,
                current_profile=
                    long_term.extracted_profile,
                missing_slots=
                    long_term.missing_slots
            )
            plan["conversation_context"] = context

            # Contextual pronoun and entity fallback resolution
            if "entities" in plan and plan["entities"]:
                entities = plan["entities"]
                if plan.get("intent") in ["EXPLAIN", "REPORT", "PLAN_VISIT"] and not entities.get("locality_id"):
                    if isinstance(context, str) and context:
                        entities["locality_id"] = context
                    elif long_term.agent_state.last_recommendation:
                        entities["locality_id"] = long_term.agent_state.last_recommendation
                elif plan.get("intent") == "COMPARE":
                    if not entities.get("locality_a") and long_term.agent_state.last_recommendation:
                        entities["locality_a"] = long_term.agent_state.last_recommendation

        long_term.agent_state.last_intent = (
            plan.get("intent")
        )

        if plan.get("requires_more_info"):

            reply = response_builder.build_response(
                user_message=sanitized_text,
                profile=long_term.extracted_profile,
                plan=plan,
                tool_result={"success": False, "error": "Profile incomplete"},
                critic_result=None,
                chat_history=[msg if isinstance(msg, dict) else (msg.model_dump() if hasattr(msg, "model_dump") else msg.dict()) for msg in short_term.chat_history]
            )

            memory_manager.add_message_to_buffer(
                session.session_id,
                "assistant",
                reply
            )

            memory_manager.persist_session_state(session.session_id)

            return self._format_agent_output(
                session,
                reply
            )

        tool_result = tool_executor.execute(
            plan=plan,
            user_profile=
                long_term.extracted_profile
        )

        critic_result = None

        if (
            plan.get("intent") == "RECOMMEND"
            and tool_result.get("success")
        ):

            critic_result = (
                critic_agent.review_recommendation(
                    recommendation_payload=
                        tool_result["result"],
                    user_profile=
                        long_term.extracted_profile
                )
            )

            recommended = (
                tool_result["result"]
                .get("recommended_locality", {})
            )

            long_term.agent_state.last_recommendation = (
                recommended.get("locality_id")
            )
            long_term.agent_state.last_report_locality = (
                recommended.get("locality_id")
            )

        if plan.get("intent") == "COMPARE":
            entities = plan.get(
                "entities",
                {}
            )
            loc_a = entities.get("locality_a")
            loc_b = entities.get("locality_b")
            
            if not loc_a and not loc_b:
                if not long_term.agent_state.last_compared_localities:
                    long_term.agent_state.last_compared_localities = ["gachibowli", "madhapur"]
            else:
                prev_list = long_term.agent_state.last_compared_localities or ["gachibowli", "madhapur"]
                if not loc_a:
                    loc_a = prev_list[0] or "gachibowli"
                if not loc_b:
                    loc_b = prev_list[1] or "madhapur"
                if loc_a == loc_b:
                    loc_b = "madhapur" if loc_a != "madhapur" else "gachibowli"
                long_term.agent_state.last_compared_localities = [loc_a, loc_b]

        if plan.get("intent") == "EXPLAIN":

            locality = (
                plan.get("entities", {})
                .get("locality_id")
            )

            long_term.agent_state.last_explained_locality = (
                locality
            )

        if plan.get("intent") == "REPORT":

            locality = (
                plan.get("entities", {})
                .get("locality_id")
            )

            long_term.agent_state.last_report_locality = (
                locality
            )

        if plan.get("intent") == "PLAN_VISIT":

            locality = (
                plan.get("entities", {})
                .get("locality_id")
            )

            long_term.agent_state.last_report_locality = (
                locality
            )

        reply = response_builder.build_response(
            user_message=sanitized_text,
            profile=long_term.extracted_profile,
            plan=plan,
            tool_result=tool_result,
            critic_result=critic_result,
            chat_history=[msg if isinstance(msg, dict) else (msg.model_dump() if hasattr(msg, "model_dump") else msg.dict()) for msg in short_term.chat_history]
        )

        memory_manager.add_message_to_buffer(
            session.session_id,
            "assistant",
            reply
        )

        memory_manager.persist_session_state(session.session_id)

        return self._format_agent_output(
            session,
            reply
        )

    def _format_agent_output(
        self,
        session,
        reply
    ):

        return {
            "session_id":
                session.session_id,

            "reply":
                reply,

            "current_stage":
                session.short_term_memory
                .conversation_stage,

            "profile_complete":
                session.long_term_memory
                .is_complete,

            "missing_slots":
                session.long_term_memory
                .missing_slots,

            "extracted_profile":
                session.long_term_memory
                .extracted_profile,

            "agent_state":
                session.long_term_memory
                .agent_state
        }


areaiq_agent = AreaIQAgentCoordinator()
