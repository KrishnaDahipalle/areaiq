import logging
from typing import Dict, Any, Tuple
from app.services.ranking_service import ranking_engine

logger = logging.getLogger("AreaIQAgentValidator")

class AgentMemoryValidator:
    def __init__(self):
        # Establish structural boundaries matching our real micro-market dataset
        self.min_realistic_rent = 10000  # Floor budget boundary for Hyderabad tech corridors
        
    def validate_and_repair_slots(self, extracted_slots: Dict[str, Any]) -> Tuple[Dict[str, Any], list[str]]:
        """
        Audits extracted entities against dataset constraints before memory persistence.
        Returns a tuple of (sanitized_slots, conflict_messages).
        """
        sanitized = extracted_slots.copy()
        conflicts = []
        
        # 1. Audit Budget Boundaries
        budget_block = sanitized.get("budget")
        if budget_block and isinstance(budget_block, dict):
            raw_val = budget_block.get("value")
            if raw_val is not None:
                try:
                    numeric_val = float(raw_val)
                    if numeric_val < self.min_realistic_rent:
                        conflicts.append(
                            f"Extracted budget of {int(numeric_val)} INR is below the realistic "
                            f"market entry floor of {self.min_realistic_rent} INR for the IT corridor."
                        )
                        # Repair the slot data: Clear out the invalid value
                        sanitized["budget"] = None
                except (ValueError, TypeError):
                    sanitized["budget"] = None

        # 2. Audit Office Location Alignment
        office = sanitized.get("office_location")
        if office and isinstance(office, str):
            dataset = ranking_engine._get_dataset()
            localities = dataset.get("localities", [])
            
            # Cross-check if the stated office location matches or flanks known areas
            known_ids = {loc["id"].lower() for loc in localities}
            known_names = {loc["name"].lower() for loc in localities}
            
            office_clean = office.strip().lower()
            
            # Simple keyword match fallback test
            matched = any(
                (kid in office_clean or office_clean in kid or office_clean in kname)
                for kid, kname in zip(known_ids, known_names)
            )
            
            # If they specify an office location completely outside our coverage coordinates
            if not matched and "hyderabad" not in office_clean:
                conflicts.append(
                    f" Stated workspace context '{office}' falls outside the active "
                    "Hyderabad high-growth tech corridor dataset coverage area."
                )
                sanitized["office_location"] = None

        return sanitized, conflicts

agent_validator = AgentMemoryValidator()