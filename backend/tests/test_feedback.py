# backend/tests/test_feedback.py

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel, Field
from typing import AsyncGenerator
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import UUID, uuid4
from datetime import datetime

from app.main import app as fastapi_app
from app.db.session import get_session
from app.db.models import Summary, Quiz, Feedback
from app.dependencies import get_current_user


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


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    fastapi_app.dependency_overrides[get_session] = override_get_session
    # Override to return None (anonymous user)
    fastapi_app.dependency_overrides[get_current_user] = lambda: None

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_summary(db_session: AsyncSession) -> tuple[Summary, UUID]:
    """Create a sample summary for testing. Returns (summary, summary_id)."""
    summary_id = uuid4()
    summary = Summary(
        id=summary_id,
        document_id=uuid4(),
        user_id=None,
        summary_text="This is a test summary.",
        ai_model="gemini-1.5-flash"
    )
    db_session.add(summary)
    await db_session.commit()
    return summary, summary_id


@pytest_asyncio.fixture
async def sample_quiz(db_session: AsyncSession) -> tuple[Quiz, UUID]:
    """Create a sample quiz for testing. Returns (quiz, quiz_id)."""
    quiz_id = uuid4()
    quiz = Quiz(
        id=quiz_id,
        document_id=uuid4(),
        user_id=None,
        title="Test Quiz",
        status="ready",
        total_questions=5,
        ai_model="gemini-2.5-flash"
    )
    db_session.add(quiz)
    await db_session.commit()
    return quiz, quiz_id


class TestFeedbackSubmission:
    """Tests for feedback submission endpoint."""

    @pytest.mark.asyncio
    async def test_submit_feedback_for_summary_success(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test successfully submitting feedback for a summary."""
        _, summary_id = sample_summary
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 5,
                "comment": "Great summary!"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["rating"] == 5
        assert data["data"]["comment"] == "Great summary!"
        assert data["data"]["content_type"] == "summary"

    @pytest.mark.asyncio
    async def test_submit_feedback_for_quiz_success(
        self, client: AsyncClient, sample_quiz: tuple[Quiz, UUID]
    ):
        """Test successfully submitting feedback for a quiz."""
        _, quiz_id = sample_quiz
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(quiz_id),
                "content_type": "quiz",
                "rating": 4,
                "comment": "Good quiz but a bit easy."
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["data"]["rating"] == 4
        assert data["data"]["content_type"] == "quiz"

    @pytest.mark.asyncio
    async def test_submit_feedback_without_comment(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test submitting feedback without a comment."""
        _, summary_id = sample_summary
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 3
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["data"]["rating"] == 3
        assert data["data"]["comment"] is None

    @pytest.mark.asyncio
    async def test_submit_feedback_invalid_rating_too_low(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test that rating below 1 is rejected."""
        _, summary_id = sample_summary
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 0
            }
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_submit_feedback_invalid_rating_too_high(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test that rating above 5 is rejected."""
        _, summary_id = sample_summary
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 6
            }
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_submit_feedback_content_not_found(self, client: AsyncClient):
        """Test submitting feedback for non-existent content."""
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(uuid4()),
                "content_type": "summary",
                "rating": 5
            }
        )
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_submit_feedback_invalid_content_type(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test submitting feedback with invalid content type."""
        _, summary_id = sample_summary
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "invalid",
                "rating": 5
            }
        )
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_submit_feedback_sanitizes_xss(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test that XSS in comments is sanitized."""
        _, summary_id = sample_summary
        xss_comment = "<script>alert('XSS')</script>"
        
        response = await client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 3,
                "comment": xss_comment
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        # Check that script tags are escaped
        assert "<script>" not in data["data"]["comment"]
        assert "&lt;script&gt;" in data["data"]["comment"]


class TestFeedbackRetrieval:
    """Tests for feedback retrieval endpoint."""

    @pytest.mark.asyncio
    async def test_get_feedback_anonymous_returns_empty(
        self, client: AsyncClient, sample_summary: tuple[Summary, UUID], db_session: AsyncSession
    ):
        """Test that anonymous users get empty feedback list."""
        _, summary_id = sample_summary
        # Create some feedback
        feedback = Feedback(
            content_id=summary_id,
            content_type="summary",
            user_id=None,
            rating=5,
            comment="Test"
        )
        db_session.add(feedback)
        await db_session.commit()
        
        response = await client.get(
            f"/api/v1/feedback/summary/{summary_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        # Anonymous users should get empty list
        assert data["data"] == []


class TestFeedbackWithAuthenticatedUser:
    """Tests for feedback with authenticated users."""

    @pytest_asyncio.fixture
    async def auth_client(self, db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
        """Create a client with mocked authenticated user."""
        test_user_id = uuid4()
        
        # Create a mock user object
        mock_user = MagicMock()
        mock_user.id = str(test_user_id)
        
        async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
            yield db_session
        
        fastapi_app.dependency_overrides[get_session] = override_get_session
        fastapi_app.dependency_overrides[get_current_user] = lambda: mock_user
        
        transport = ASGITransport(app=fastapi_app)
        async with AsyncClient(transport=transport, base_url="http://test") as c:
            yield c
        
        fastapi_app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_authenticated_user_can_submit_feedback(
        self, auth_client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test authenticated user can submit feedback."""
        _, summary_id = sample_summary
        response = await auth_client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 5,
                "comment": "Excellent!"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.asyncio
    async def test_duplicate_feedback_rejected(
        self, auth_client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test that duplicate feedback from same user is rejected."""
        _, summary_id = sample_summary
        # First submission
        response1 = await auth_client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 5
            }
        )
        assert response1.status_code == 201
        
        # Second submission should fail
        response2 = await auth_client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 3
            }
        )
        assert response2.status_code == 409  # Conflict

    @pytest.mark.asyncio
    async def test_authenticated_user_can_view_own_feedback(
        self, auth_client: AsyncClient, sample_summary: tuple[Summary, UUID]
    ):
        """Test authenticated user can view their own feedback."""
        _, summary_id = sample_summary
        # Submit feedback
        await auth_client.post(
            "/api/v1/feedback",
            json={
                "content_id": str(summary_id),
                "content_type": "summary",
                "rating": 4,
                "comment": "Nice!"
            }
        )
        
        # Retrieve feedback
        response = await auth_client.get(
            f"/api/v1/feedback/summary/{summary_id}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 1
        assert data["data"][0]["rating"] == 4
        assert data["data"][0]["comment"] == "Nice!"
