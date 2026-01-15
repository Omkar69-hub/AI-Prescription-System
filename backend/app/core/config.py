from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ----------------------------
    # Database
    # ----------------------------
    MONGO_URI: str
    DATABASE_NAME: str

    # ----------------------------
    # JWT / Security
    # ----------------------------
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # ----------------------------
    # App
    # ----------------------------
    DEBUG: bool = True

    # Load from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


# Create settings instance
settings = Settings()
