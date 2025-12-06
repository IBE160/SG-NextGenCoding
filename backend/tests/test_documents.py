import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel, Field, Session
from typing import AsyncGenerator
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import UUID, uuid4
from datetime import datetime

from app.main import app as fastapi_app
from app.db.session import get_session
from app.db.models import Document
from app.supabase_client import get_supabase_admin_client
from app.api.summaries.main import run_text_extraction
from app.dependencies import get_current_user

# Define local User model for testing to avoid circular dependencies with auth schema
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)


DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False)

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
def mock_supabase_admin() -> MagicMock:
    mock = MagicMock()
    mock.storage.from_.return_value.upload = AsyncMock(return_value={"Key": "mock_path"})
    mock.storage.from_.return_value.download = AsyncMock(return_value=b"simple text")
    return mock

@pytest_asyncio.fixture
async def client(db_session: AsyncSession, mock_supabase_admin: MagicMock) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_supabase_admin_client] = lambda: mock_supabase_admin

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    fastapi_app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_upload_document_unsupported_file_type(client: AsyncClient):
    response = await client.post("/api/v1/documents/upload", files={"file": ("test.jpg", b"content", "image/jpeg")})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_upload_document_oversized_file(client: AsyncClient):
    response = await client.post("/api/v1/documents/upload", files={"file": ("large.txt", b"a" * (21 * 1024 * 1024), "text/plain")})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_upload_document_success(client: AsyncClient, db_session: AsyncSession):
    response = await client.post("/api/v1/documents/upload", files={"file": ("test.txt", b"content", "text/plain")})
    assert response.status_code == 202
    data = response.json()
    assert "document_id" in data
    doc_id = UUID(data["document_id"])
    doc = await db_session.get(Document, doc_id)
    assert doc is not None
    assert doc.filename == "test.txt"
    assert doc.status == "uploaded"

    @pytest.mark.asyncio
    @patch('app.api.summaries.main.get_supabase_admin_client')
    async def test_upload_and_extract_text_success(
        mock_supabase_admin: MagicMock,
        client: AsyncClient, 
        db_session: AsyncSession
    ):
        # Mock the return value of supabase_admin.storage.from_().download()
        mock_supabase_admin.return_value.storage.from_.return_value.download.return_value = AsyncMock(return_value=b"simple text content")
        response = await client.post(
            "/api/v1/documents/upload",
            files={"file": ("test.txt", b"simple text", "text/plain")}
        )
        assert response.status_code == 202
        data = response.json()
        assert "document_id" in data
        doc_id = UUID(data["document_id"])
    
        # Simulate the background task execution
        doc_from_db = await db_session.get(Document, doc_id)
        user_id = doc_from_db.user_id # Get the user_id from the document saved to DB
    
        await run_text_extraction(
            document_id=doc_id,
            storage_path="some/path",
            filename="test.txt",
            user_id=user_id, # Pass the user_id
            supabase_admin=mock_supabase_admin.return_value,
        )
    
        updated_doc = await db_session.get(Document, doc_id)
        assert updated_doc is not None
        assert updated_doc.status == "summarized" # Should be summarized now
        assert updated_doc.raw_content == "simple text content"

@pytest.mark.asyncio
async def test_upload_document_guest_user(client: AsyncClient, db_session: AsyncSession):
    response = await client.post("/api/v1/documents/upload", files={"file": ("guest.txt", b"content", "text/plain")})
    assert response.status_code == 202
    data = response.json()
    assert "document_id" in data
    assert "message" in data
    doc_id = UUID(data["document_id"])
    doc = await db_session.get(Document, doc_id)
    assert doc is not None
    assert doc.user_id is None


@pytest.mark.asyncio
async def test_upload_document_authenticated_user(client: AsyncClient, db_session: AsyncSession):
    user_id = uuid4()
    mock_user = MagicMock()
    mock_user.id = user_id

    async def override_get_current_user() -> MagicMock:
        return mock_user

    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user

    response = await client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.txt", b"content", "text/plain")},
        headers={"Authorization": "Bearer fake-token"}
    )
    assert response.status_code == 202
    data = response.json()
    assert "document_id" in data
    doc_id = UUID(data["document_id"])
    doc = await db_session.get(Document, doc_id)
    assert doc is not None
    assert doc.user_id == user_id

    fastapi_app.dependency_overrides.clear()

