from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # ──────────────────────────────────────────
    # Database
    # ──────────────────────────────────────────
    MONGO_URI:     str
    DATABASE_NAME: str

    # ──────────────────────────────────────────
    # JWT / Security
    # ──────────────────────────────────────────
    SECRET_KEY:                  str
    ALGORITHM:                   str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # ──────────────────────────────────────────
    # App
    # ──────────────────────────────────────────
    DEBUG: bool = True

    # ──────────────────────────────────────────
    # Email Notifications (SMTP)
    # ──────────────────────────────────────────
    NOTIFY_EMAIL_ENABLED: bool        = False
    NOTIFY_SMTP_HOST:     str         = "smtp.gmail.com"
    NOTIFY_SMTP_PORT:     int         = 587
    NOTIFY_SMTP_USER:     str         = ""
    NOTIFY_SMTP_PASS:     str         = ""
    NOTIFY_FROM_NAME:     str         = "AI Prescription System"

    # ──────────────────────────────────────────
    # SMS Notifications (Twilio)
    # ──────────────────────────────────────────
    NOTIFY_SMS_ENABLED:  bool         = False
    TWILIO_ACCOUNT_SID:  str          = ""
    TWILIO_AUTH_TOKEN:   str          = ""
    TWILIO_FROM_NUMBER:  str          = ""

    # Load from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",          # ignore unknown keys gracefully
    )


settings = Settings()
