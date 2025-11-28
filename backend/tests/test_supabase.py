import pytest
from fastapi.testclient import TestClient
from app.main import app

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