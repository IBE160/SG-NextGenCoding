from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse # Import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from uuid import UUID
import logging

from app.supabase_client import get_supabase_client
from supabase import Client as SupabaseClient
from gotrue.errors import AuthApiError
from app.core.config import settings
from app.db.session import get_session
from app.db.models import Profile

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

@router.post("/login")
async def login_user(
    request_body: LoginRequest,
    fastapi_request: Request,
    supabase: SupabaseClient = Depends(get_supabase_client),
    session: AsyncSession = Depends(get_session)
): # Removed response: Response from dependencies - will construct in function
    """
    Authenticates a user with email and password.
    """
    logging.info(f"Login attempt for email: {request_body.email}")
    try:
        logging.info("Calling Supabase auth.sign_in_with_password...")
        auth_response = supabase.auth.sign_in_with_password({
            "email": request_body.email,
            "password": request_body.password,
        })
        logging.info(f"Auth response received. Session: {bool(auth_response.session)}, User: {bool(auth_response.user)}")

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login failed: No session returned.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Ensure user has a profile (create if missing)
        logging.info("Checking for user profile...")
        try:
            user_id = UUID(auth_response.user.id)
            logging.info(f"User ID: {user_id}")
            result = await session.execute(select(Profile).where(Profile.user_id == user_id))
            existing_profile = result.first()
            
            if not existing_profile:
                logging.info(f"Creating missing profile for user {user_id}")
                profile = Profile(user_id=user_id)
                session.add(profile)
                await session.commit()
                logging.info(f"Profile created for user {user_id}")
            else:
                logging.info(f"Profile already exists for user {user_id}")
        except Exception as profile_error:
            logging.error(f"Failed to ensure profile for user {auth_response.user.id}: {profile_error}", exc_info=True)
            # Continue with login even if profile check/creation fails
            pass

        logging.info("Preparing response tokens...")
        access_token = auth_response.session.access_token
        refresh_token = auth_response.session.refresh_token
        expires_in = auth_response.session.expires_in

        # Determine secure flag based on environment
        is_secure = settings.ENVIRONMENT == "production" and fastapi_request.url.scheme == "https"
        logging.info(f"Setting access_token cookie: token_length={len(access_token) if access_token else 0}, secure={is_secure}, environment={settings.ENVIRONMENT}, scheme={fastapi_request.url.scheme}")


        # Prepare the response data
        login_response_data = LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
        logging.info("Creating JSON response...")
        # Create a JSONResponse object
        fastapi_response = JSONResponse(
            content=login_response_data.model_dump(mode="json"), # Use model_dump for Pydantic v2 and convert to JSON
            status_code=status.HTTP_200_OK
        )

        logging.info("Login successful, returning response")
        return fastapi_response
    except AuthApiError as e:
        logging.error(f"AuthApiError in login: {e}, type: {type(e)}")
        if "Invalid login credentials" in str(e) or "invalid_grant" in str(e):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if "Email not confirmed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not confirmed. Please check your email and verify your account.",
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
