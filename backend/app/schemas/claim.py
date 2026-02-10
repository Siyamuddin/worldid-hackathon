from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.claim import ClaimStatus


class ClaimRequest(BaseModel):
    world_id_proof: dict  # WorldID proof object
    wallet_address: str  # Required for claiming rewards


class ClaimResponse(BaseModel):
    id: int
    event_id: int
    participant_id: int
    reward_id: int
    status: ClaimStatus
    transaction_hash: Optional[str]
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
