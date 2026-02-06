from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.config.database import Base


class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id"), nullable=False)
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.PENDING)
    transaction_hash = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Constraints - one claim per event per participant per reward
    __table_args__ = (
        UniqueConstraint('event_id', 'participant_id', 'reward_id', name='uq_event_participant_reward'),
    )

    # Relationships
    event = relationship("Event", back_populates="claims")
    participant = relationship("Participant", back_populates="claims")
    reward = relationship("Reward", back_populates="claims")
