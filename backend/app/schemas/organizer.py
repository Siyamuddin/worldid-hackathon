from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class OrganizerRegister(BaseModel):
    world_id_proof: Dict  # WorldID proof object
    name: Optional[str] = None  # Optional organizer name


class OrganizerLogin(BaseModel):
    world_id_proof: Dict  # WorldID proof object


class OrganizerResponse(BaseModel):
    id: int
    world_id_hash: str
    name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
