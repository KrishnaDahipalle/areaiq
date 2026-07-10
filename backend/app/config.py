import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AreaIQ Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Resolves directly against your local environment setup variables
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AIzaSyYourActualGeminiKeyHere")

    class Config:
        case_sensitive = True

settings = Settings()