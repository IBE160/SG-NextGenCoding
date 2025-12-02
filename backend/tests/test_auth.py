import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.supabase_client import get_supabase_client

client = TestClient(app)

@pytest.fixture
def mock_supabase_client():
    mock_client = MagicMock()
    app.dependency_overrides[get_supabase_client] = lambda: mock_client
    return mock_client

def test_create_user_success(mock_supabase_client):
    mock_supabase_client.auth.sign_up.return_value = MagicMock(user=MagicMock(identities=[1]), error=None)

    response = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "password"})

    assert response.status_code == 201
    assert response.json() == {"message": "User created successfully. Please check your email for verification."}
    mock_supabase_client.auth.sign_up.assert_called_with({"email": "test@example.com", "password": "password"})

def test_create_user_already_exists(mock_supabase_client):
    # This is a bit tricky, the Python client doesn't raise an exception for existing users,
    # but the API response contains a user object with an empty identities list if unconfirmed.
    # If confirmed, it will raise an exception. Let's test the confirmed case.
    from gotrue.errors import GotrueApiError
    mock_supabase_client.auth.sign_up.side_effect = GotrueApiError("User already registered", status_code=400)


    response = client.post("/api/v1/auth/register", json={"email": "exists@example.com", "password": "password"})

    assert response.status_code == 409
    assert response.json() == {"detail": "A user with this email already exists."}

def test_create_user_weak_password(mock_supabase_client):
    from gotrue.errors import GotrueApiError
    mock_supabase_client.auth.sign_up.side_effect = GotrueApiError("Password should be at least 6 characters", status_code=422)

    response = client.post("/api/v1/auth/register", json={"email": "test@example.com", "password": "123"})

    assert response.status_code == 422
    assert "Password should be at least 6 characters" in response.json()["detail"]


def test_create_user_unconfirmed_user_exists(mock_supabase_client):
    # Simulate Supabase returning a user with no identities, which means they exist but are not confirmed
    mock_supabase_client.auth.sign_up.return_value = MagicMock(user=MagicMock(id='some-id', identities=[]), session=None, error=None)

    response = client.post("/api/v1/auth/register", json={"email": "unconfirmed@example.com", "password": "password"})

    assert response.status_code == 201 # The endpoint returns 201
    assert response.json() == {"message": "User already exists but is unconfirmed. A new confirmation email has been sent."}
