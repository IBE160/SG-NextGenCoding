# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Supabase credentials
    SUPABASE_URL: str
    SUPABASE_KEY: str
    # SUPABASE_SERVICE_ROLE_KEY: str # Only if needed for specific backend admin operations
    SUPABASE_JWT_SECRET: str # Needed for validating JWTs from Supabase Auth

    # Database URL
    DATABASE_URL: str

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
