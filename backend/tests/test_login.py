import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.supabase_client import get_supabase_client
from gotrue.errors import AuthApiError

client = TestClient(app)

@pytest.fixture
def mock_supabase_client():
    mock_client = MagicMock()
    app.dependency_overrides[get_supabase_client] = lambda: mock_client
    return mock_client

def test_login_invalid_credentials(mock_supabase_client):
    """
    Test that the login endpoint returns 401 for invalid credentials.
    """
    mock_supabase_client.auth.sign_in_with_password.side_effect = AuthApiError(
        "Invalid login credentials", status=400, code="invalid_grant"
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}

def test_login_valid_credentials(mock_supabase_client):
    """
    Test that the login endpoint returns 200 and a token for valid credentials.
    """
    mock_supabase_client.auth.sign_in_with_password.return_value = MagicMock(
        session=MagicMock(access_token="test_token")
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password"}
    )

    assert response.status_code == 200
    assert response.json() == {"access_token": "test_token", "token_type": "bearer"}