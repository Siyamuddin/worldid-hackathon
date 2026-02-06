from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class Organizer(Base):
    __tablename__ = "organizers"

    id = Column(Integer, primary_key=True, index=True)
    world_id_hash = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)  # Optional organizer name
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # Note: Events now use participant_id instead of organizer_id
    # This relationship is disabled during migration
    # events = relationship("Event", back_populates="organizer", cascade="all, delete-orphan")
