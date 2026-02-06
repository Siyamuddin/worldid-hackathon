from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class EventParticipant(Base):
    __tablename__ = "event_participants"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constraints - one join per event per participant
    __table_args__ = (
        UniqueConstraint('event_id', 'participant_id', name='uq_event_participant'),
    )

    # Relationships
    event = relationship("Event", back_populates="event_participants")
    participant = relationship("Participant", back_populates="event_participants")
