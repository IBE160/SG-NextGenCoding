from fastapi import Depends, HTTPException, status, Header
from supabase import Client
from app.supabase_client import get_supabase_client
from typing import Optional

async def get_current_user(
    supabase: Client = Depends(get_supabase_client),
    authorization: Optional[str] = Header(None)
):
    if not authorization:
        # Allow unauthenticated (guest) users for now as per story ACs
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
        
        # Verify the JWT token with Supabase
        user_response = supabase.auth.get_user(token)
        if user_response.user:
            return user_response.user
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except Exception as e:
        # For any token verification errors, treat as unauthenticated
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {e}",
        )
