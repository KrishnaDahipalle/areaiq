import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-flash-lite-latest"
)

response = model.generate_content(
    "Say hello in one sentence."
)

print(response.text)