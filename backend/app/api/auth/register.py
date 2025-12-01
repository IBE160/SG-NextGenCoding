from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from supabase import Client
from app.supabase_client import get_supabase_client

router = APIRouter()

class RegisterData(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(data: RegisterData, supabase: Client = Depends(get_supabase_client)):
    try:
        user = supabase.auth.sign_up({"email": data.email, "password": data.password})
        return {"user": user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
