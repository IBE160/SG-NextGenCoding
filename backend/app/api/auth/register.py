from fastapi import APIRouter, Depends, HTTPException, status, Response
from supabase import Client
from app.schemas.user import UserCreate
from app.supabase_client import get_supabase_client
from gotrue.errors import AuthApiError
import logging

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, response: Response, supabase: Client = Depends(get_supabase_client)):
    """
    Create a new user.
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

