from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.config.logging import logger
from app.api.routes import organizers, events, participants, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WorldID Reward Distribution System",
    description="Event-based reward distribution system with WorldID verification",
    version="1.0.0"
)

# CORS middleware
# Note: CORS is now handled by nginx, but we keep this for direct backend access
import os
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:80",
    "https://www.halalhaven.kr",
    "https://halalhaven.kr",
]
# Add domain from environment if set
domain = os.getenv("DOMAIN", "")
if domain:
    allowed_origins.extend([f"https://{domain}", f"http://{domain}"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Nginx handles CORS, so we allow all for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# Note: Organizer routes are deprecated - participants can now create events
# Keeping for backward compatibility but not recommended for new code
# app.include_router(organizers.router, prefix="/api/organizers", tags=["organizers"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(participants.router, prefix="/api", tags=["participants"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


# Logging will be initialized when module is imported
logger.info("WorldID Reward Distribution System API initialized")


@app.get("/")
async def root():
    return {"message": "WorldID Reward Distribution System API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
