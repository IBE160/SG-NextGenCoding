from fastapi import Depends, HTTPException, status, Header
from supabase import Client
from app.supabase_client import get_supabase_client
from typing import Optional

async def get_current_user(
    supabase: Client = Depends(get_supabase_client),
    authorization: Optional[str] = Header(None)
):
    if not authorization:
        # Allow unauthenticated (guest) users
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None  # Invalid scheme, treat as guest
        
        # Verify the JWT token with Supabase
        user_response = supabase.auth.get_user(token)
        if user_response.user:
            return user_response.user
        else:
            # Invalid token, treat as guest
            return None
    except Exception as e:
        # For any token verification errors, treat as guest user
        # This allows guest uploads even if token verification fails
        return None
