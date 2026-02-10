from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.config.database import get_db
from app.models.participant import Participant
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

participant_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/google/verify")


def get_current_participant(
    token: str = Depends(participant_oauth2_scheme),
    db: Session = Depends(get_db)
) -> Participant:
    """Get the current authenticated participant"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        participant_id: int = int(payload.get("sub"))
        token_type: str = payload.get("type")
        
        if participant_id is None or token_type != "participant":
            raise credentials_exception
    except (JWTError, ValueError, TypeError):
        raise credentials_exception
    
    participant = db.query(Participant).filter(Participant.id == participant_id).first()
    if participant is None:
        raise credentials_exception
    
    return participant
