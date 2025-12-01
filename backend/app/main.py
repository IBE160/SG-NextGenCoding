from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, status
from .supabase_client import check_supabase_connection
from .api.auth import register

app = FastAPI()

app.include_router(register.router, prefix="/api/v1/auth")

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
