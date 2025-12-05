from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse # Import JSONResponse
from pydantic import BaseModel, EmailStr
import logging

from app.supabase_client import get_supabase_client
from supabase import Client as SupabaseClient
from gotrue.errors import AuthApiError
from app.core.config import settings

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login")
def login_user(
    request_body: LoginRequest,
    fastapi_request: Request,
    supabase: SupabaseClient = Depends(get_supabase_client),
): # Removed response: Response from dependencies - will construct in function
    """
    Authenticates a user with email and password.
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request_body.email,
            "password": request_body.password,
        })

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login failed: No session returned.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = auth_response.session.access_token
        expires_in = auth_response.session.expires_in

        # Determine secure flag based on environment
        is_secure = settings.ENVIRONMENT == "production" and fastapi_request.url.scheme == "https"
        logging.info(f"Setting access_token cookie: token_length={len(access_token) if access_token else 0}, secure={is_secure}, environment={settings.ENVIRONMENT}, scheme={fastapi_request.url.scheme}")


        # Prepare the response data
        login_response_data = LoginResponse(
            access_token=access_token,
            token_type="bearer"
        )
        
        # Create a JSONResponse object
        fastapi_response = JSONResponse(
            content=login_response_data.model_dump(mode="json"), # Use model_dump for Pydantic v2 and convert to JSON
            status_code=status.HTTP_200_OK
        )

        # Manually set the cookie header (instead of using fastapi_response.set_cookie)
        # This gives full control over the header string
        cookie_value = f"{'access_token'}={access_token}; Path=/; Max-Age={expires_in}; HttpOnly; SameSite=Lax"
        if is_secure:
            cookie_value += "; Secure"
        
        fastapi_response.headers["Set-Cookie"] = cookie_value


        return fastapi_response
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
