from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class WorldIDSettings(BaseSettings):
    WORLDID_APP_ID: str = os.getenv("WORLDID_APP_ID", "")
    WORLDID_ACTION: str = os.getenv("WORLDID_ACTION", "worldid-reward-claim")
    WORLDID_VERIFY_URL: str = os.getenv(
        "WORLDID_VERIFY_URL",
        "https://developer.worldcoin.org/api/v1/verify"
    )
    
    class Config:
        env_file = ".env"

worldid_settings = WorldIDSettings()
