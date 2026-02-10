from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.config.database import get_db
from app.models.organizer import Organizer
from app.schemas.organizer import OrganizerRegister, OrganizerLogin, OrganizerResponse, Token
from app.middleware.auth import (
    create_access_token,
    get_current_organizer,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.services.organizer_service import OrganizerService
from app.config.logging import logger

router = APIRouter()


@router.post("/register", response_model=OrganizerResponse, status_code=status.HTTP_201_CREATED)
async def register_organizer(organizer_data: OrganizerRegister, db: Session = Depends(get_db)):
    """Register a new organizer with WorldID"""
    # Verify WorldID proof and extract world_id_hash
    world_id_hash = OrganizerService.verify_and_extract_world_id(organizer_data.world_id_proof)
    
    if not world_id_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WorldID verification failed"
        )
    
    # Check if organizer already exists
    existing = db.query(Organizer).filter(Organizer.world_id_hash == world_id_hash).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organizer already registered with this WorldID"
        )
    
    # Create new organizer
    organizer = Organizer(
        world_id_hash=world_id_hash,
        name=organizer_data.name
    )
    db.add(organizer)
    db.commit()
    db.refresh(organizer)
    
    logger.info(f"Organizer registered: {organizer.id}")
    return organizer


@router.post("/login", response_model=Token)
async def login_organizer(credentials: OrganizerLogin, db: Session = Depends(get_db)):
    """Login organizer with WorldID and return JWT token"""
    # Verify WorldID proof and extract world_id_hash
    world_id_hash = OrganizerService.verify_and_extract_world_id(credentials.world_id_proof)
    
    if not world_id_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="WorldID verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Find organizer
    organizer = db.query(Organizer).filter(Organizer.world_id_hash == world_id_hash).first()
    
    if not organizer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organizer not found. Please register first.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not organizer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer account is inactive"
        )
    
    # Generate JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": world_id_hash},  # Use world_id_hash as subject
        expires_delta=access_token_expires
    )
    
    logger.info(f"Organizer logged in: {organizer.id}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=OrganizerResponse)
async def get_current_organizer_info(
    current_organizer: Organizer = Depends(get_current_organizer)
):
    """Get current organizer information"""
    return current_organizer
