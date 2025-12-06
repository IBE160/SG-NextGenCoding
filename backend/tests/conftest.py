import os
import pytest
from dotenv import load_dotenv

# Load environment variables before any imports
load_dotenv()

# Set test database URL if not already set
if not os.getenv("DATABASE_URL"):
    # Use a test database URL or the same as development
    # For now, we'll set a dummy URL to prevent import errors
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://test:test@localhost/test_db"

# Set other required environment variables for testing
if not os.getenv("SUPABASE_URL"):
    os.environ["SUPABASE_URL"] = "https://test.supabase.co"
if not os.getenv("SUPABASE_KEY"):
    os.environ["SUPABASE_KEY"] = "test_key"
if not os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test_service_key"

# Add pytest fixtures here if needed
