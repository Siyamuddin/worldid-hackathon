from pydantic import BaseModel
from typing import Optional
from app.models.reward import RewardType


class RewardCreate(BaseModel):
    reward_type: RewardType
    token_address: str
    amount: Optional[float] = None  # For ERC-20
    token_id: Optional[int] = None  # For ERC-721/1155
    name: Optional[str] = None
    description: Optional[str] = None


class RewardResponse(BaseModel):
    id: int
    event_id: int
    reward_type: RewardType
    token_address: str
    amount: Optional[float]
    token_id: Optional[int]
    name: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True
