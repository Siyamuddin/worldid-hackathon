from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional
from app.config.database import get_db
from app.services.google_auth_service import GoogleAuthService
from app.middleware.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.config.logging import logger
from app.config.google_auth import google_auth_settings

router = APIRouter()


class GoogleTokenRequest(BaseModel):
    token: str  # Google ID token


class GoogleTokenResponse(BaseModel):
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
