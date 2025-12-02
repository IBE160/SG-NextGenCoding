from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.schemas.user import UserCreate
from app.supabase_client import get_supabase_client
from gotrue.errors import GotrueApiError

router = APIRouter()

@router.post("/register", status_code=201)
def create_user(user: UserCreate, supabase: Client = Depends(get_supabase_client)):
    """
    Create a new user.
    """
    try:
        response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        if response.user and response.user.identities == []:
             return {"message": "User already exists but is unconfirmed. A new confirmation email has been sent."}
        if not response.user:
             raise HTTPException(status_code=400, detail="Could not create user for an unknown reason.")

    except GotrueApiError as e:
        if "User already registered" in e.message:
            raise HTTPException(status_code=409, detail="A user with this email already exists.")
        if "Password should be at least 6 characters" in e.message:
            raise HTTPException(status_code=422, detail="Password should be at least 6 characters.")
        raise HTTPException(status_code=500, detail=f"An unexpected authentication error occurred: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "User created successfully. Please check your email for verification."}
