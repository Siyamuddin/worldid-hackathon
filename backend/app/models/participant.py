from sqlalchemy import Column, Integer, String, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    world_id_hash = Column(String, unique=True, index=True, nullable=False)
    wallet_address = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Constraints
    __table_args__ = (
        UniqueConstraint('world_id_hash', name='uq_world_id_hash'),
        UniqueConstraint('wallet_address', name='uq_wallet_address'),
    )

    # Relationships
    event_participants = relationship("EventParticipant", back_populates="participant", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="participant", cascade="all, delete-orphan")
