from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.memory_service import memory_manager
from app.agent.extractor import ai_extractor
from app.agent.consultant import ai_consultant

router = APIRouter()

class ChatInputPayload(BaseModel):
    user_id: str = Field(..., example="hackathon_user_1")
    session_id: str = Field(..., example="session_abc123")
    message: str = Field(..., example="I want to move to Hyderabad near Mindspace with a budget of 50000 rent.")

class ChatOutputResponse(BaseModel):
    session_id: str
    reply: str
    current_stage: str
    profile_complete: bool
    missing_slots: list[str]

@router.post("/chat", response_model=ChatOutputResponse, status_code=status.HTTP_200_OK)
async def process_advisor_turn(payload: ChatInputPayload):
    try:
        # 1. Fetch or initialize session tracking instances dynamically
        session = memory_manager.get_or_create_session(payload.user_id, payload.session_id)
        
        # 2. Append the incoming user input directly into the session turning buffer
        memory_manager.add_message_to_buffer(session.session_id, "user", payload.message)
        
        # 3. Passive Extraction Track: Evaluate the user statement against missing matrix attributes
        if not session.long_term_memory.is_complete:
            extracted_slots = ai_extractor.extract_slots_from_text(
                user_message=payload.message, 
                current_profile=session.long_term_memory.extracted_profile
            )
            
            # Map slots updates back into the data store memory tracking system
            for slot_key, slot_val in extracted_slots.items():
                if slot_val is not None:
                    memory_manager.update_profile_slot(session.session_id, slot_key, slot_val)
                    
        # 4. Generate the conversational reply text string target via the consultant agent
        assistant_reply = ai_consultant.generate_response(
            chat_history=session.short_term_memory.chat_history,
            missing_slots=session.long_term_memory.missing_slots
        )
        
        # Save assistant text back into conversational turn memory vectors
        memory_manager.add_message_to_buffer(session.session_id, "assistant", assistant_reply)
        
        return ChatOutputResponse(
            session_id=session.session_id,
            reply=assistant_reply,
            current_stage=session.short_term_memory.conversation_stage,
            profile_complete=session.long_term_memory.is_complete,
            missing_slots=session.long_term_memory.missing_slots
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conversational loop routing collapse sequence triggered: {str(err)}"
        )