import re
from typing import Tuple

class ContextGuardShield:
    def verify_message_sanity(self, user_message: str) -> Tuple[bool, str]:
        """
        Intercepts raw user text streams to check for code injections or massive input spam.
        Returns a tuple parsing (is_safe, sanitized_or_fallback_text).
        """
        clean_text = user_message.strip()
        
        # 1. Check for basic input flooding constraints
        if len(clean_text) > 800:
            return False, "Your request input matrix is too dense. Please state your area or budget requirements briefly."
            
        # 2. Check for empty string injections
        if not clean_text:
            return False, "I didn't catch that parameter detail. What area or workplace node will you be commuting to?"
            
        # 3. Basic protection against standard command injection scripts
        malicious_patterns = [r"__import__", r"exec\s*\(", r"eval\s*\("]
        for pattern in malicious_patterns:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return False, "System verification check alert: Please input standard relocation preferences text strings only."
                
        return True, clean_text

agent_guard = ContextGuardShield()