from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from .supabase_client import check_supabase_connection
from .api.auth import register as auth_register_router
from .api.auth import login as auth_login_router
from .api.auth import forgot_password as auth_forgot_password_router
from .api.auth import reset_password as auth_reset_password_router
from .api.summaries.main import router as summaries_router
from .api.quizzes.main import router as quizzes_router
from .db.session import get_session, create_db_and_tables
from .core.config import settings
import os

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    await create_db_and_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_register_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(auth_login_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(auth_forgot_password_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(auth_reset_password_router.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(summaries_router, prefix="/api/v1", tags=["summaries"])
app.include_router(quizzes_router, prefix="/api/v1", tags=["quizzes"])

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

@app.get("/api/v1/db-test")
async def test_database_connection(session: AsyncSession = Depends(get_session)):
    """Test database connectivity and configuration."""
    try:
        # Test basic database query
        from sqlalchemy import text
        result = await session.execute(text("SELECT 1 as test"))
        test_value = result.scalar()
        
        # Get database URL (masked)
        db_url = os.getenv("DATABASE_URL", "NOT_SET")
        masked_url = db_url[:20] + "***" + db_url[-20:] if len(db_url) > 40 else "***"
        
        # Check if tables exist
        tables_query = text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('documents', 'profile')
            ORDER BY table_name
        """)
        tables_result = await session.execute(tables_query)
        tables = [row[0] for row in tables_result.fetchall()]
        
        return {
            "status": "success",
            "database_url": masked_url,
            "connection_test": "passed" if test_value == 1 else "failed",
            "tables_found": tables,
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        import traceback
        db_url = os.getenv("DATABASE_URL", "NOT_SET")
        
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__,
            "database_url_set": db_url != "NOT_SET",
            "database_url_preview": db_url[:60] if db_url != "NOT_SET" else "NOT_SET",
            "hint": "Make sure DATABASE_URL is correctly configured and the database is accessible",
            "full_traceback": traceback.format_exc()
        }