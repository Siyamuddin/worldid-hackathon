from typing import Dict, Optional
from google.auth.transport import requests
from google.oauth2 import id_token
from app.config.google_auth import google_auth_settings
from app.models.participant import Participant
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.config.logging import logger


class GoogleAuthService:
    """Service for Google OAuth authentication"""
    
    @staticmethod
    def verify_google_token(token: str) -> Optional[Dict]:
        """
        Verify Google ID token and extract user information
        
        Args:
            token: Google ID token
            
        Returns:
            Dict with user info (google_id, email, name) if valid, None otherwise
        """
        try:
            if not google_auth_settings.GOOGLE_CLIENT_ID:
                logger.warning("Google Client ID not configured")
                return None
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                google_auth_settings.GOOGLE_CLIENT_ID
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                logger.warning(f"Invalid token issuer: {idinfo['iss']}")
                return None
            
            # Extract user information
            return {
                'google_id': idinfo['sub'],
                'email': idinfo.get('email'),
                'name': idinfo.get('name'),
                'picture': idinfo.get('picture')
            }
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error verifying Google token: {str(e)}")
            return None
    
    @staticmethod
    def find_or_create_participant(
        google_id: str,
        email: Optional[str],
        name: Optional[str],
        db: Session
    ) -> Participant:
        """
        Find existing participant by google_id or create new one
        
        Args:
            google_id: Google user ID
            email: User email (optional)
            name: User name (optional)
            db: Database session
            
        Returns:
            Participant instance
        """
        try:
            participant = db.query(Participant).filter(
                Participant.google_id == google_id
            ).first()
            
            if not participant:
                # Create new participant
                participant = Participant(
                    google_id=google_id,
                    world_id_hash=None,  # Will be set when they participate
                    wallet_address=None  # Will be set when they connect wallet
                )
                db.add(participant)
                try:
                    db.commit()
                    db.refresh(participant)
                    logger.info(f"New participant created: {participant.id} (Google ID: {google_id})")
                except IntegrityError as e:
                    db.rollback()
                    # Participant might have been created by another request, try to fetch again
                    logger.warning(f"Integrity error creating participant (possibly race condition): {str(e)}")
                    participant = db.query(Participant).filter(
                        Participant.google_id == google_id
                    ).first()
                    if not participant:
                        logger.error(f"Failed to create or find participant with google_id: {google_id}")
                        raise
                except SQLAlchemyError as e:
                    db.rollback()
                    logger.error(f"Database error creating participant: {str(e)}")
                    raise
            
            return participant
        except SQLAlchemyError as e:
            logger.error(f"Database error in find_or_create_participant: {str(e)}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Unexpected error in find_or_create_participant: {str(e)}", exc_info=True)
            raise
