import pytest
import os
from fastapi.testclient import TestClient
from app.main import app
from app.supabase_client import get_supabase_client # Import the client directly
from uuid import uuid4

@pytest.fixture(scope="module")
def client():
    # Use a test client for the FastAPI application
    return TestClient(app)

def test_supabase_health_endpoint(client):
    """
    Test the /api/v1/health endpoint to ensure Supabase connection is successful.
    This is an integration test as it relies on the actual Supabase connection
    details provided via environment variables.
    """
    response = client.get("/api/v1/health")
    # Assert that the status code is 200 OK
    assert response.status_code == 200
    # Assert that the response body indicates a successful Supabase connection
    assert response.json() == {"status": "ok", "database_connection": "Supabase connection successful."}

def test_profiles_rls_enforcement():
    """
    Test that Row Level Security (RLS) on the 'profiles' table is enforced
    for unauthenticated access attempts.

    This test assumes RLS policies are set up on the 'profiles' table
    to restrict INSERT and SELECT operations to authenticated users matching auth.uid().
    Using an anonymous client (get_supabase_client() with SUPABASE_ANON_KEY),
    these operations should be denied by RLS.
    """
    supabase_client = get_supabase_client()
    test_user_id = uuid4() # A random UUID for testing purposes

    # --- Test INSERT RLS policy enforcement ---
    # Attempt to insert a profile for test_user_id without proper authentication.
    # This should be prevented by RLS (auth.uid() will be null for anon client).
    with pytest.raises(Exception) as excinfo:
        supabase_client.table("profiles").insert({"user_id": str(test_user_id)}).execute()
    assert "new row violates row-level security policy" in str(excinfo.value)

    # --- Test SELECT RLS policy enforcement ---
    # Attempt to select a profile for test_user_id without proper authentication.
    # This should return no data if RLS prevents selection by anon client.
    response = supabase_client.table("profiles").select("*").eq("user_id", str(test_user_id)).execute()
    assert len(response.data) == 0

