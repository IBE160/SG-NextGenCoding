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
    yield mock_client
    # Clean up the override after the test
    app.dependency_overrides = {}


def test_forgot_password_success(mock_supabase_client):
    """
    Test that the forgot password endpoint returns 200 on success.
    """
    mock_supabase_client.auth.reset_password_for_email.return_value = (None, None)

    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Password reset email sent."}

def test_forgot_password_failure(mock_supabase_client):
    """
    Test that the forgot password endpoint returns 500 on failure.
    """
    mock_supabase_client.auth.reset_password_for_email.side_effect = Exception("Something went wrong")

    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    assert response.status_code == 500


def test_reset_password_success(mock_supabase_client):
    """
    Test that the reset password endpoint returns 200 on success.
    """
    mock_session_response = MagicMock()
    mock_session_response.user = MagicMock()
    mock_supabase_client.auth.set_session.return_value = mock_session_response
    mock_supabase_client.auth.update_user.return_value = (None, None)

    response = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "test_token", "password": "new_password"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Password has been reset successfully."}


def test_reset_password_invalid_token(mock_supabase_client):
    """
    Test that the reset password endpoint returns 401 for an invalid token.
    """
    mock_supabase_client.auth.set_session.side_effect = Exception("Invalid token")

    response = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid_token", "password": "new_password"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid or expired password reset token."}
