# backend/app/db/session.py

import os
from typing import AsyncGenerator
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, unquote

load_dotenv()

from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine

# Database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Parse the DATABASE_URL to extract credentials for Supabase pooler
parsed = urlparse(DATABASE_URL)
username = unquote(parsed.username) if parsed.username else "postgres"
password = unquote(parsed.password) if parsed.password else ""
hostname = parsed.hostname
port = parsed.port or 5432
database = parsed.path.lstrip('/') if parsed.path else "postgres"

# Build connection URL without credentials for asyncpg
# Format: postgresql+asyncpg://host:port/database
DATABASE_URL_NO_CREDS = f"postgresql+asyncpg://{hostname}:{port}/{database}"

# Create an async engine for SQLModel with connection arguments
# Pass credentials separately to handle special characters in username
connect_args = {
    "user": username,
    "password": password,
    "ssl": "require",
    "server_settings": {"jit": "off"}
}

engine = AsyncEngine(create_engine(
    DATABASE_URL_NO_CREDS, 
    echo=True, 
    future=True,
    connect_args=connect_args
))

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session
