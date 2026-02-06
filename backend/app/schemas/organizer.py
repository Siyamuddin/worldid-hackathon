from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class OrganizerCreate(BaseModel):
    email: EmailStr
    password: str
    name: str


class OrganizerLogin(BaseModel):
    email: EmailStr
    password: str


class OrganizerResponse(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
