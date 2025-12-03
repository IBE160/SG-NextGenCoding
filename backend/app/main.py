from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, status
from .supabase_client import check_supabase_connection
from .api.auth import register as auth_register_router
from .api.auth import login as auth_login_router

app = FastAPI()

app.include_router(auth_register_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(auth_login_router.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/api/v1/health")
def health_check():
    connected, message = check_supabase_connection()
    if connected:
        return {"status": "ok", "database_connection": message}
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "error", "database_connection": message},
        )
