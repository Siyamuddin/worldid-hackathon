from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.reward import RewardCreate, RewardResponse


class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    rewards: List[RewardCreate] = []


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class EventResponse(BaseModel):
    id: int
    organizer_id: int
    name: str
    description: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    rewards: List[RewardResponse] = []

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    reward_count: int = 0

    class Config:
        from_attributes = True
