from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

class MockGotrueResponse:
    def __init__(self, user, session):
        self.user = user
        self.session = session

class MockUser:
    def __init__(self, id):
        self.id = id

@patch("app.supabase_client.get_supabase_client")
def test_register_success(mock_get_supabase_client):
    mock_supabase = MagicMock()
    mock_user = MockUser(id="123")
    mock_response = MockGotrueResponse(user=mock_user, session=None)
    mock_supabase.auth.sign_up.return_value = mock_response
    mock_get_supabase_client.return_value = mock_supabase

    response = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "password"})
    assert response.status_code == 200
    assert response.json()["user"]["user"]["id"] == "123"
    mock_supabase.auth.sign_up.assert_called_with({"email": "test@example.com", "password": "password"})

@patch("app.supabase_client.get_supabase_client")
def test_register_failure(mock_get_supabase_client):
    mock_supabase = MagicMock()
    mock_supabase.auth.sign_up.side_effect = Exception("User already exists")
    mock_get_supabase_client.return_value = mock_supabase

    response = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "password"})
    assert response.status_code == 400
    assert response.json() == {"detail": "User already exists"}
