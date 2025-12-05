from fastapi import APIRouter, Depends, HTTPException, status, Response # Import Response
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
import logging

from app.supabase_client import get_supabase_client
from supabase import Client as SupabaseClient
from gotrue.errors import AuthApiError
from app.core.config import settings # Import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=LoginResponse)
def login_user(
    request: LoginRequest,
    supabase: SupabaseClient = Depends(get_supabase_client),
    response: Response = None
):
    """
    Authenticates a user with email and password.
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login failed: No session returned.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Determine secure flag based on environment
        is_secure = settings.ENVIRONMENT == "production" and request.url.scheme == "https"

        response.set_cookie(
            key="access_token",
            value=auth_response.session.access_token,
            httponly=True,
            max_age=auth_response.session.expires_in,
            path="/",
            samesite="lax",
            secure=is_secure, # Set conditionally
        )

        return LoginResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer"
        )
    except AuthApiError as e:
        logging.error(f"AuthApiError in login: {e}, type: {type(e)}")
        if "Invalid login credentials" in str(e) or "invalid_grant" in str(e):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected authentication error occurred: {e}",
        )
    except Exception as e:
        logging.error(f"Unexpected error in login: {e}, type: {type(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}",
        )
