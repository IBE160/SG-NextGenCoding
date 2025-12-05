import pytest
from httpx import AsyncClient
from fastapi import FastAPI, Depends, status, HTTPException
from sqlmodel import create_engine, SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession, AsyncEngine
from typing import AsyncGenerator
from unittest.mock import MagicMock, AsyncMock

# Adjust imports as per your project structure
from backend.app.main import app as fastapi_app # Assuming your main app is named 'app'
from backend.app.db.session import get_session
from backend.app.db.models import Document
from backend.app.supabase_client import get_supabase_client
from backend.app.api.summaries.main import router as summaries_router


# --- Test Database Setup ---
# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = AsyncEngine(create_engine(DATABASE_URL, echo=False, future=True))

@pytest.fixture(name="test_session")
async def test_session_fixture():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    async with AsyncSession(engine) as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture(name="override_get_session")
def override_get_session_fixture(test_session: AsyncSession):
    async def _override_get_session():
        yield test_session
    return _override_get_session

# --- Mock Supabase Client Setup ---
@pytest.fixture(name="mock_supabase_client")
def mock_supabase_client_fixture():
    mock_client = MagicMock()
    mock_client.storage.from_.return_value.upload = AsyncMock(return_value={"Key": "mock_path", "status_code": 200})
    return mock_client

@pytest.fixture(name="override_get_supabase_client")
def override_get_supabase_client_fixture(mock_supabase_client: MagicMock):
    def _override_get_supabase_client():
        return mock_supabase_client
    return _override_get_supabase_client

# --- Test FastAPI App Setup ---
# Create a test app instance that includes the summaries router
test_app = FastAPI()
test_app.include_router(summaries_router, prefix="/api/v1")

# Override dependencies for the test app
test_app.dependency_overrides[get_session] = override_get_session_fixture
test_app.dependency_overrides[get_supabase_client] = override_get_supabase_client_fixture

@pytest.fixture(name="client")
async def client_fixture():
    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client

# --- Test Cases ---

@pytest.mark.asyncio
async def test_upload_document_unsupported_file_type(client: AsyncClient):
    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.jpg", b"fake image content", "image/jpeg")},
        data={"user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Unsupported file type" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_document_oversized_file(client: AsyncClient):
    # Create a file larger than 20MB (20 * 1024 * 1024 bytes)
    oversized_content = b"a" * (21 * 1024 * 1024) # 21 MB
    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("large_doc.pdf", oversized_content, "application/pdf")},
        data={"user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "File size exceeds limit" in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_document_success(
    client: AsyncClient, test_session: AsyncSession, mock_supabase_client: MagicMock
):
    user_id_str = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("lecture_notes.pdf", b"this is pdf content", "application/pdf")},
        data={"user_id": user_id_str}
    )

    assert response.status_code == status.HTTP_202_ACCEPTED
    json_response = response.json()
    assert "document_id" in json_response
    assert "message" in json_response
    assert json_response["message"] == "File upload initiated successfully. Processing will begin shortly."

    # Verify Supabase storage upload was called
    mock_supabase_client.storage.from_.return_value.upload.assert_called_once()
    args, kwargs = mock_supabase_client.storage.from_.return_value.upload.call_args
    assert kwargs["file"] == b"this is pdf content"
    assert kwargs["file_options"]["content-type"] == "application/pdf"
    assert f"user_uploads/{json_response['document_id']}.pdf" in kwargs["path"]

    # Verify document was saved to DB
    result = await test_session.exec(
        select(Document).where(Document.id == json_response["document_id"])
    )
    document = result.first()

    assert document is not None
    assert str(document.user_id) == user_id_str
    assert document.filename == "lecture_notes.pdf"
    assert document.file_type == "application/pdf"
    assert document.status == "uploaded"
    assert document.storage_path == kwargs["path"]

@pytest.mark.asyncio
async def test_upload_document_success_guest_user(
    client: AsyncClient, test_session: AsyncSession, mock_supabase_client: MagicMock
):
    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("guest_notes.txt", b"guest user content", "text/plain")},
        # No user_id provided for guest user
    )

    assert response.status_code == status.HTTP_202_ACCEPTED
    json_response = response.json()
    assert "document_id" in json_response
    assert "message" in json_response

    # Verify Supabase storage upload was called
    mock_supabase_client.storage.from_.return_value.upload.assert_called_once()
    args, kwargs = mock_supabase_client.storage.from_.return_value.upload.call_args
    assert kwargs["file"] == b"guest user content"
    assert kwargs["file_options"]["content-type"] == "text/plain"
    assert f"user_uploads/{json_response['document_id']}.txt" in kwargs["path"]

    # Verify document was saved to DB with user_id=None
    result = await test_session.exec(
        select(Document).where(Document.id == json_response["document_id"])
    )
    document = result.first()

    assert document is not None
    assert document.user_id is None
    assert document.filename == "guest_notes.txt"
    assert document.file_type == "text/plain"
    assert document.status == "uploaded"
    assert document.storage_path == kwargs["path"]