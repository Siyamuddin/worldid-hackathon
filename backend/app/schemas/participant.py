from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.event import EventListResponse


class ParticipantClaimRewards(BaseModel):
    world_id_proof: dict  # WorldID proof object
    wallet_address: str  # Required for claiming rewards


class ParticipantResponse(BaseModel):
    id: int
    email: Optional[str] = None
    google_id: Optional[str] = None
    wallet_address: Optional[str]
    created_at: datetime
    joined_events: List[EventListResponse] = []
    created_events: List[EventListResponse] = []

    class Config:
        from_attributes = True
