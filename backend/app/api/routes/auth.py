from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.config.database import get_db
from app.services.google_auth_service import GoogleAuthService
from app.middleware.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_password_hash, verify_password
from app.models.participant import Participant
from app.config.logging import logger
from app.config.google_auth import google_auth_settings

router = APIRouter()


class GoogleTokenRequest(BaseModel):
    token: str  # Google ID token


class GoogleTokenResponse(BaseModel):
    access_token: str
    token_type: str
    participant_id: int


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    participant_id: int


@router.post("/google/verify", response_model=GoogleTokenResponse)
async def verify_google_token(
    request: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Verify Google ID token and create/update participant
    Returns JWT token for participant authentication
    """
    try:
        # Verify Google token
        user_info = GoogleAuthService.verify_google_token(request.token)
        
        if not user_info:
            logger.warning("Google token verification failed or returned None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        # Find or create participant
        try:
            participant = GoogleAuthService.find_or_create_participant(
                google_id=user_info['google_id'],
                email=user_info.get('email'),
                name=user_info.get('name'),
                db=db
            )
        except SQLAlchemyError as db_error:
            logger.error(f"Database error creating/finding participant: {str(db_error)}", exc_info=True)
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error while processing authentication"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating/finding participant: {str(e)}", exc_info=True)
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing authentication"
            )
        
        # Generate JWT token
        try:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES * 24)  # 24 hours for participants
            access_token = create_access_token(
                data={"sub": str(participant.id), "type": "participant"},  # Use participant ID as subject
                expires_delta=access_token_expires
            )
        except Exception as token_error:
            logger.error(f"Error generating access token: {str(token_error)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error generating authentication token"
            )
        
        logger.info(f"Participant authenticated: {participant.id} (Google ID: {user_info['google_id']})")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "participant_id": participant.id
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in verify_google_token: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )


@router.get("/google/login")
async def google_login():
    """
    Initiate Google OAuth flow
    Returns OAuth URL for frontend to redirect to
    """
    if not google_auth_settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )
    
    # For frontend OAuth flow, we'll use the frontend library
    # This endpoint can return the client ID if needed
    return {
        "client_id": google_auth_settings.GOOGLE_CLIENT_ID,
        "redirect_uri": google_auth_settings.GOOGLE_REDIRECT_URI
    }


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new participant with email and password"""
    try:
        # Check if email already exists
        existing = db.query(Participant).filter(Participant.email == request.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password
        if len(request.password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters"
            )
        
        # Create new participant
        participant = Participant(
            email=request.email,
            password_hash=get_password_hash(request.password),
            google_id=None,  # Not using Google auth
            world_id_hash=None,  # Will be set when they participate
            wallet_address=None  # Will be set when they connect wallet
        )
        db.add(participant)
        try:
            db.commit()
            db.refresh(participant)
            logger.info(f"New participant registered: {participant.id} (Email: {request.email})")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Integrity error registering participant: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES * 24)  # 24 hours
        access_token = create_access_token(
            data={"sub": str(participant.id), "type": "participant"},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "participant_id": participant.id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error registering participant: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering participant"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    try:
        # Find participant by email
        participant = db.query(Participant).filter(Participant.email == request.email).first()
        
        if not participant:
            logger.warning(f"Login attempt with non-existent email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not participant.password_hash or not verify_password(request.password, participant.password_hash):
            logger.warning(f"Invalid password attempt for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES * 24)  # 24 hours
        access_token = create_access_token(
            data={"sub": str(participant.id), "type": "participant"},
            expires_delta=access_token_expires
        )
        
        logger.info(f"Participant logged in: {participant.id} (Email: {request.email})")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "participant_id": participant.id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during login"
        )
