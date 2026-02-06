from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import engine, Base
from app.config.logging import logger
from app.api.routes import organizers, events, participants

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WorldID Reward Distribution System",
    description="Event-based reward distribution system with WorldID verification",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(organizers.router, prefix="/api/organizers", tags=["organizers"])
app.include_router(events.router, prefix="/api/organizers/events", tags=["organizer-events"])
app.include_router(participants.router, prefix="/api", tags=["participants"])


# Logging will be initialized when module is imported
logger.info("WorldID Reward Distribution System API initialized")


@app.get("/")
async def root():
    return {"message": "WorldID Reward Distribution System API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
