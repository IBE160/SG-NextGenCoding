from fastapi import FastAPI
from .supabase_client import check_supabase_connection

app = FastAPI()

@app.get("/api/v1/health")
def health_check():
    connected, message = check_supabase_connection()
    if connected:
        return {"status": "ok", "database_connection": message}
    else:
        return {"status": "error", "database_connection": message}
