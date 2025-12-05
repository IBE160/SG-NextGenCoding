from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    # Use settings from config.py
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_ANON_KEY
    
    if not url or not key:
        # This check is redundant if settings are properly loaded via Pydantic,
        # but kept as a safeguard. Pydantic's BaseSettings would raise an error
        # during initialization if these were missing.
        raise ValueError("Supabase credentials not found in environment variables.")
        
    return create_client(url, key)


def get_supabase_admin_client() -> Client:
    """
    Get a Supabase client with admin (service role) credentials.
    Used for operations that require elevated privileges (like file uploads to storage).
    
    Note: This returns a synchronous client which is fine for FastAPI dependencies.
    The Supabase Python SDK's storage operations will work with async endpoints.
    """
    url: str = settings.SUPABASE_URL
    # Use JWT_SECRET as the service role key for admin operations
    key: str = settings.SUPABASE_JWT_SECRET.strip()  # Strip whitespace that might be in .env
    
    if not url or not key:
        raise ValueError("Supabase admin credentials not found in environment variables.")
    
    return create_client(url, key)


def check_supabase_connection():
    try:
        client = get_supabase_client()
        # The client is created, but to truly check the connection,
        # we need to make a request. We can try to list tables.
        # This will fail if the credentials are wrong.
        # Note: 'users' table is typically 'auth.users' in Supabase.
        # Accessing an arbitrary table for connection check.
        # For a proper health check, ensure a table you expect to exist is queried.
        # For now, let's assume `profiles` table exists from previous epic.
        # This is a synchronous call, might not be suitable for async FastAPI app.
        # Consider making this an async function if used within FastAPI endpoint.
        client.table("profiles").select("*").limit(1).execute()
        return True, "Supabase connection successful."
    except Exception as e:
        return False, f"Supabase connection failed: {e}"

if __name__ == "__main__":
    # This allows running the script directly to test the connection.
    # The environment variables must be set.
    # Note: When run as __main__, settings might not be fully initialized from .env.
    # For testing, ensure environment variables are loaded.
    from dotenv import load_dotenv
    load_dotenv() # Load .env file for local testing
    connected, message = check_supabase_connection()
    print(message)
