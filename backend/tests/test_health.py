import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.supabase_client import check_supabase_connection

# Mock check_supabase_connection for testing purposes
class MockSupabaseClient:
    def __init__(self, is_connected: bool, message: str):
        self.is_connected = is_connected
        self.message = message

    def select(self, *args, **kwargs):
        if not self.is_connected:
            raise Exception(self.message)
        return self

    def execute(self):
        pass

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check_db_connected(monkeypatch, client):
    def mock_check_supabase_connection():
        return True, "Supabase connection successful."
    
    monkeypatch.setattr("app.main.check_supabase_connection", mock_check_supabase_connection)
    
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database_connection": "Supabase connection successful."}

def test_health_check_db_disconnected(monkeypatch, client):
    def mock_check_supabase_connection():
        return False, "Supabase connection failed: Some error."
        
    monkeypatch.setattr("app.main.check_supabase_connection", mock_check_supabase_connection)

    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "error", "database_connection": "Supabase connection failed: Some error."}
