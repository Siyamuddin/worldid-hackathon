from pydantic_settings import BaseSettings
from typing import Optional


class GoogleAuthSettings(BaseSettings):
    """Google OAuth configuration"""
    
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = "http://localhost:8000/api/auth/google/callback"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


google_auth_settings = GoogleAuthSettings()
