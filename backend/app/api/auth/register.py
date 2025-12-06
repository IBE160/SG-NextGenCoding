from fastapi import APIRouter, Depends, HTTPException, status, Response
from supabase import Client
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate
from app.supabase_client import get_supabase_client
from app.db.session import get_session
from app.db.models import Profile
from gotrue.errors import AuthApiError
from uuid import UUID
import logging

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate, 
    response: Response, 
    supabase: Client = Depends(get_supabase_client),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new user and their profile.
    """
    try:
        res = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        if res.user and res.user.identities == []:
            response.status_code = status.HTTP_200_OK
            return {"message": "User already exists but is unconfirmed. A new confirmation email has been sent."}
        if not res.user:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not create user for an unknown reason.")

        # Create profile for the new user
        try:
            user_id = UUID(res.user.id)
            profile = Profile(user_id=user_id)
            session.add(profile)
            await session.commit()
            logging.info(f"Created profile for user {user_id}")
        except Exception as profile_error:
            logging.error(f"Failed to create profile for user {res.user.id}: {profile_error}")
            # Don't fail registration if profile creation fails
            pass

    except AuthApiError as e:
        if "User already registered" in str(e):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.")
        if "Password should be at least 8 characters" in str(e) or "Password should be at least 6 characters" in str(e):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password must be at least 8 characters.")
        logging.error(f"Auth API Error during user registration: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected authentication error occurred.")
    except Exception as e:
        logging.error(f"Unexpected error during user registration: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred.")

    return {"message": "User created successfully. Please check your email for verification."}

