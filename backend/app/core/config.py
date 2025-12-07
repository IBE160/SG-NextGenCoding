# backend/app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Supabase credentials
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str  # Required for admin operations on storage
    SUPABASE_JWT_SECRET: str # Needed for validating JWTs from Supabase Auth

    # Gemini API Key
    GEMINI_API_KEY: str

    # Database URL
    DATABASE_URL: str

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
