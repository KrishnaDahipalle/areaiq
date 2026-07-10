from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import our transactional router blocks safely from the existing v1 file path layouts
from app.api.v1.chat import router as chat_router
from app.api.v1.engine import router as engine_router
from app.api.v1.localities import router as localities_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scalable Locality Intelligence Relocation Infrastructure Core"
)

# Enable clean cross-origin resource communications interface limits
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind the operational routes directly onto the core V1 API path prefix string
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(engine_router, prefix=settings.API_V1_STR)
app.include_router(localities_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}