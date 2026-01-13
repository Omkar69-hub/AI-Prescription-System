import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    # ----------------------------
    # Database
    # ----------------------------
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_prescription_db")

    # ----------------------------
    # JWT / Security
    # ----------------------------
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24))  # 1 day

    # ----------------------------
    # Other settings
    # ----------------------------
    DEBUG: bool = bool(os.getenv("DEBUG", True))

# Create a settings instance
settings = Settings()
