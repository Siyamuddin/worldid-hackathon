from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.config.database import Base


class RewardType(str, enum.Enum):
    ERC20 = "ERC20"
    ERC721 = "ERC721"
    ERC1155 = "ERC1155"


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    reward_type = Column(SQLEnum(RewardType), nullable=False)
    token_address = Column(String, nullable=False)  # ERC-20/721/1155 contract address
    amount = Column(Numeric(36, 18))  # For ERC-20 tokens
    token_id = Column(Integer)  # For ERC-721/1155 NFTs
    name = Column(String)
    description = Column(String)

    # Relationships
    event = relationship("Event", back_populates="rewards")
    claims = relationship("Claim", back_populates="reward", cascade="all, delete-orphan")
