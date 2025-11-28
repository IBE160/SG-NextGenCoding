import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("Supabase credentials not found in environment variables.")
    return create_client(url, key)

def check_supabase_connection():
    try:
        client = get_supabase_client()
        # The client is created, but to truly check the connection,
        # we need to make a request. We can try to list tables.
        # This will fail if the credentials are wrong.
        client.table("users").select("*").limit(1).execute()
        return True, "Supabase connection successful."
    except Exception as e:
        return False, f"Supabase connection failed: {e}"

if __name__ == "__main__":
    # This allows running the script directly to test the connection.
    # The environment variables must be set.
    connected, message = check_supabase_connection()
    print(message)
