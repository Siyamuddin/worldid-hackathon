from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.config.database import get_db
from app.models.organizer import Organizer
from app.schemas.organizer import OrganizerCreate, OrganizerLogin, OrganizerResponse, Token
from app.middleware.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_organizer,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


@router.post("/register", response_model=OrganizerResponse, status_code=status.HTTP_201_CREATED)
async def register_organizer(organizer_data: OrganizerCreate, db: Session = Depends(get_db)):
    """Register a new organizer"""
    # Check if email already exists
    existing = db.query(Organizer).filter(Organizer.email == organizer_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new organizer
    hashed_password = get_password_hash(organizer_data.password)
    organizer = Organizer(
        email=organizer_data.email,
        hashed_password=hashed_password,
        name=organizer_data.name
    )
    db.add(organizer)
    db.commit()
    db.refresh(organizer)
    
    return organizer


@router.post("/login", response_model=Token)
async def login_organizer(credentials: OrganizerLogin, db: Session = Depends(get_db)):
    """Login organizer and return JWT token"""
    organizer = db.query(Organizer).filter(Organizer.email == credentials.email).first()
    
    if not organizer or not verify_password(credentials.password, organizer.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not organizer.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer account is inactive"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": organizer.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=OrganizerResponse)
async def get_current_organizer_info(
    current_organizer: Organizer = Depends(get_current_organizer)
):
    """Get current organizer information"""
    return current_organizer
