from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.event import EventListResponse


class ParticipantJoinEvent(BaseModel):
    wallet_address: str
    world_id_proof: dict  # WorldID proof object


class ParticipantResponse(BaseModel):
    id: int
    wallet_address: str
    created_at: datetime
    joined_events: List[EventListResponse] = []

    class Config:
        from_attributes = True
