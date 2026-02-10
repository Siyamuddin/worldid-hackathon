from fastapi import FastAPI
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

# CORS is handled by nginx reverse proxy
# Removing CORS middleware to prevent duplicate headers
# If accessing backend directly (not through nginx), configure CORS at the proxy level

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
