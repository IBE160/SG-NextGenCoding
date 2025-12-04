from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.supabase_client import get_supabase_client

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, supabase=Depends(get_supabase_client)):
    try:
        response = supabase.auth.reset_password_for_email(
            email=request.email,
            options={
                "redirect_to": "http://localhost:3000/reset-password"
            }
        )
        return {"message": "Password reset email sent."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
