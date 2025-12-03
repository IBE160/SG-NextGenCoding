from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
import logging

from app.supabase_client import get_supabase_client
from supabase import Client as SupabaseClient
from gotrue.errors import AuthApiError

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
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """
    Authenticates a user with email and password.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        return LoginResponse(
            access_token=response.session.access_token,
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
