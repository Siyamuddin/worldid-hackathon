from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("organizers.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    organizer = relationship("Organizer", back_populates="events")
    rewards = relationship("Reward", back_populates="event", cascade="all, delete-orphan")
    event_participants = relationship("EventParticipant", back_populates="event", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="event", cascade="all, delete-orphan")
