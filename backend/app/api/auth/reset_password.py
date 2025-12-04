from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.supabase_client import get_supabase_client
from gotrue.errors import AuthApiError

router = APIRouter()

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, supabase=Depends(get_supabase_client)):
    try:
        # The token from the URL is the access_token for a temporary session
        # We need to set the session for the client before we can update the user
        
        # 1. Set the session on the Supabase client instance
        session_response = supabase.auth.set_session(access_token=request.token, refresh_token=request.token)

        if not session_response or not session_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate password reset token.",
            )

        # 2. Update the user's password
        updated_user_response = supabase.auth.update_user(attributes={"password": request.password})

        # 3. Invalidate the session
        supabase.auth.sign_out()

        return {"message": "Password has been reset successfully."}

    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message or "An error occurred while resetting the password.",
        )
    except Exception as e:
        # Any other exception likely indicates an invalid token or an issue with Supabase
        if "token" in str(e).lower():
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired password reset token.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}",
        )
