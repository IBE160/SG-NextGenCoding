# backend/tests/test_history.py

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel
from typing import AsyncGenerator
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import uuid4
from datetime import datetime, timedelta

from app.main import app as fastapi_app
from app.db.session import get_session
from app.db.models import Document, Summary, Quiz, Question, UserAnswer
from app.supabase_client import get_supabase_admin_client
from app.dependencies import get_current_user


DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False)


# Test user ID
TEST_USER_ID = uuid4()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture
def mock_supabase_admin() -> MagicMock:
    mock = MagicMock()
    mock.storage.from_.return_value.upload = AsyncMock(return_value={"Key": "mock_path"})
    mock.storage.from_.return_value.download = AsyncMock(return_value=b"simple text")
    return mock


@pytest.fixture
def mock_authenticated_user():
    """Mock an authenticated Supabase user."""
    mock_user = MagicMock()
    mock_user.id = str(TEST_USER_ID)
    return mock_user


@pytest_asyncio.fixture
async def authenticated_client(
    db_session: AsyncSession, 
    mock_supabase_admin: MagicMock,
    mock_authenticated_user
) -> AsyncGenerator[AsyncClient, None]:
    """Client with authenticated user."""
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_supabase_admin_client] = lambda: mock_supabase_admin
    fastapi_app.dependency_overrides[get_current_user] = lambda: mock_authenticated_user

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def guest_client(
    db_session: AsyncSession, 
    mock_supabase_admin: MagicMock
) -> AsyncGenerator[AsyncClient, None]:
    """Client without authentication (guest user)."""
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_supabase_admin_client] = lambda: mock_supabase_admin
    fastapi_app.dependency_overrides[get_current_user] = lambda: None

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_documents(db_session: AsyncSession) -> list[Document]:
    """Create sample documents for testing."""
    documents = []
    for i in range(3):
        doc = Document(
            id=uuid4(),
            user_id=TEST_USER_ID,
            filename=f"test_document_{i}.pdf",
            file_type="application/pdf",
            storage_path=f"user_uploads/test_{i}.pdf",
            raw_content=f"Test content for document {i}",
            status="text-extracted",
            created_at=datetime.utcnow() - timedelta(days=i)
        )
        db_session.add(doc)
        documents.append(doc)
    await db_session.commit()
    for doc in documents:
        await db_session.refresh(doc)
    return documents


@pytest_asyncio.fixture
async def sample_summaries(db_session: AsyncSession, sample_documents: list[Document]) -> list[Summary]:
    """Create sample summaries for testing."""
    summaries = []
    for i, doc in enumerate(sample_documents):
        summary = Summary(
            id=uuid4(),
            document_id=doc.id,
            user_id=TEST_USER_ID,
            summary_text=f"This is a test summary for document {i}. It contains important information about the topic discussed in the document.",
            generated_at=datetime.utcnow() - timedelta(days=i),
            ai_model="gemini-1.5-flash"
        )
        db_session.add(summary)
        summaries.append(summary)
    await db_session.commit()
    for summary in summaries:
        await db_session.refresh(summary)
    return summaries


@pytest_asyncio.fixture
async def sample_quizzes(db_session: AsyncSession, sample_documents: list[Document]) -> list[Quiz]:
    """Create sample quizzes for testing."""
    quizzes = []
    for i, doc in enumerate(sample_documents):
        quiz = Quiz(
            id=uuid4(),
            document_id=doc.id,
            user_id=TEST_USER_ID,
            title=f"Quiz for Document {i}",
            status="ready",
            total_questions=5,
            ai_model="gemini-2.5-flash",
            created_at=datetime.utcnow() - timedelta(days=i, hours=1)
        )
        db_session.add(quiz)
        quizzes.append(quiz)
    await db_session.commit()
    for quiz in quizzes:
        await db_session.refresh(quiz)
    return quizzes


class TestSummaryHistory:
    """Tests for GET /api/v1/history/summaries endpoint."""

    @pytest.mark.asyncio
    async def test_get_summary_history_authenticated(
        self, authenticated_client: AsyncClient, sample_summaries: list[Summary]
    ):
        """Test that authenticated user can retrieve their summary history."""
        response = await authenticated_client.get("/api/v1/history/summaries")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        assert len(data["data"]) == 3
        assert data["total"] == 3
        
        # Check that items are sorted by generated_at descending (newest first)
        for i in range(len(data["data"]) - 1):
            assert data["data"][i]["generated_at"] >= data["data"][i + 1]["generated_at"]

    @pytest.mark.asyncio
    async def test_get_summary_history_contains_required_fields(
        self, authenticated_client: AsyncClient, sample_summaries: list[Summary]
    ):
        """Test that summary history items contain all required fields."""
        response = await authenticated_client.get("/api/v1/history/summaries")
        
        assert response.status_code == 200
        data = response.json()
        
        for item in data["data"]:
            assert "id" in item
            assert "document_id" in item
            assert "document_title" in item
            assert "summary_preview" in item
            assert "generated_at" in item
            assert "ai_model" in item
            assert item["type"] == "summary"

    @pytest.mark.asyncio
    async def test_get_summary_history_unauthenticated(self, guest_client: AsyncClient):
        """Test that unauthenticated user cannot access summary history."""
        response = await guest_client.get("/api/v1/history/summaries")
        
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_summary_history_empty(self, authenticated_client: AsyncClient):
        """Test that empty history returns empty list."""
        response = await authenticated_client.get("/api/v1/history/summaries")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert data["data"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_get_summary_history_pagination(
        self, authenticated_client: AsyncClient, sample_summaries: list[Summary]
    ):
        """Test pagination parameters work correctly."""
        response = await authenticated_client.get("/api/v1/history/summaries?limit=2&offset=0")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["data"]) == 2
        assert data["total"] == 3


class TestQuizHistory:
    """Tests for GET /api/v1/history/quizzes endpoint."""

    @pytest.mark.asyncio
    async def test_get_quiz_history_authenticated(
        self, authenticated_client: AsyncClient, sample_quizzes: list[Quiz]
    ):
        """Test that authenticated user can retrieve their quiz history."""
        response = await authenticated_client.get("/api/v1/history/quizzes")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        assert len(data["data"]) == 3
        assert data["total"] == 3
        
        # Check that items are sorted by created_at descending (newest first)
        for i in range(len(data["data"]) - 1):
            assert data["data"][i]["created_at"] >= data["data"][i + 1]["created_at"]

    @pytest.mark.asyncio
    async def test_get_quiz_history_contains_required_fields(
        self, authenticated_client: AsyncClient, sample_quizzes: list[Quiz]
    ):
        """Test that quiz history items contain all required fields."""
        response = await authenticated_client.get("/api/v1/history/quizzes")
        
        assert response.status_code == 200
        data = response.json()
        
        for item in data["data"]:
            assert "id" in item
            assert "document_id" in item
            assert "document_title" in item
            assert "title" in item
            assert "status" in item
            assert "total_questions" in item
            assert "created_at" in item
            assert "ai_model" in item
            assert item["type"] == "quiz"

    @pytest.mark.asyncio
    async def test_get_quiz_history_unauthenticated(self, guest_client: AsyncClient):
        """Test that unauthenticated user cannot access quiz history."""
        response = await guest_client.get("/api/v1/history/quizzes")
        
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_quiz_history_empty(self, authenticated_client: AsyncClient):
        """Test that empty history returns empty list."""
        response = await authenticated_client.get("/api/v1/history/quizzes")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert data["data"] == []
        assert data["total"] == 0


class TestCombinedHistory:
    """Tests for GET /api/v1/history endpoint."""

    @pytest.mark.asyncio
    async def test_get_combined_history_authenticated(
        self, 
        authenticated_client: AsyncClient, 
        sample_summaries: list[Summary],
        sample_quizzes: list[Quiz]
    ):
        """Test that authenticated user can retrieve combined history."""
        response = await authenticated_client.get("/api/v1/history")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        assert len(data["data"]) == 6  # 3 summaries + 3 quizzes
        assert data["total"] == 6

    @pytest.mark.asyncio
    async def test_get_combined_history_sorted_by_date(
        self, 
        authenticated_client: AsyncClient, 
        sample_summaries: list[Summary],
        sample_quizzes: list[Quiz]
    ):
        """Test that combined history is sorted by created_at descending."""
        response = await authenticated_client.get("/api/v1/history")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check that items are sorted by created_at descending
        for i in range(len(data["data"]) - 1):
            assert data["data"][i]["created_at"] >= data["data"][i + 1]["created_at"]

    @pytest.mark.asyncio
    async def test_get_combined_history_unauthenticated(self, guest_client: AsyncClient):
        """Test that unauthenticated user cannot access combined history."""
        response = await guest_client.get("/api/v1/history")
        
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_combined_history_pagination(
        self, 
        authenticated_client: AsyncClient, 
        sample_summaries: list[Summary],
        sample_quizzes: list[Quiz]
    ):
        """Test pagination in combined history."""
        response = await authenticated_client.get("/api/v1/history?limit=3&offset=0")
        
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["data"]) == 3
        assert data["total"] == 6


# Additional fixtures for quiz review tests
@pytest_asyncio.fixture
async def quiz_with_questions(db_session: AsyncSession, sample_documents: list[Document]) -> Quiz:
    """Create a quiz with questions for testing quiz review."""
    import json
    
    doc = sample_documents[0]
    quiz = Quiz(
        id=uuid4(),
        document_id=doc.id,
        user_id=TEST_USER_ID,
        title="Test Quiz with Questions",
        status="ready",
        total_questions=3,
        ai_model="gemini-2.5-flash",
        created_at=datetime.utcnow()
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    
    # Add questions
    questions_data = [
        {
            "question_text": "What is the capital of France?",
            "question_type": "multiple_choice",
            "options": json.dumps(["London", "Paris", "Berlin", "Madrid"]),
            "correct_answer": "Paris",
            "explanation": "Paris is the capital and largest city of France.",
            "order_index": 0,
        },
        {
            "question_text": "Is the Earth flat?",
            "question_type": "true_false",
            "options": json.dumps(["True", "False"]),
            "correct_answer": "False",
            "explanation": "The Earth is an oblate spheroid.",
            "order_index": 1,
        },
        {
            "question_text": "What is 2 + 2?",
            "question_type": "short_answer",
            "options": None,
            "correct_answer": "4",
            "explanation": "Basic arithmetic.",
            "order_index": 2,
        },
    ]
    
    for q_data in questions_data:
        question = Question(
            id=uuid4(),
            quiz_id=quiz.id,
            **q_data,
            created_at=datetime.utcnow()
        )
        db_session.add(question)
    
    await db_session.commit()
    await db_session.refresh(quiz)
    return quiz


@pytest_asyncio.fixture
async def quiz_with_answers(db_session: AsyncSession, quiz_with_questions: Quiz) -> Quiz:
    """Create user answers for the quiz."""
    from sqlmodel import select
    
    # Get questions for the quiz
    result = await db_session.execute(
        select(Question).where(Question.quiz_id == quiz_with_questions.id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    
    # Add user answers (2 correct, 1 wrong)
    answers_data = [
        {"user_answer": "Paris", "is_correct": True},  # Correct
        {"user_answer": "True", "is_correct": False},   # Wrong
        {"user_answer": "4", "is_correct": True},       # Correct
    ]
    
    for question, answer_data in zip(questions, answers_data):
        user_answer = UserAnswer(
            id=uuid4(),
            quiz_id=quiz_with_questions.id,
            question_id=question.id,
            user_id=TEST_USER_ID,
            user_answer=answer_data["user_answer"],
            is_correct=answer_data["is_correct"],
            answered_at=datetime.utcnow()
        )
        db_session.add(user_answer)
    
    await db_session.commit()
    return quiz_with_questions


@pytest_asyncio.fixture
async def other_user_quiz(db_session: AsyncSession, sample_documents: list[Document]) -> Quiz:
    """Create a quiz owned by a different user."""
    other_user_id = uuid4()  # Different user
    doc = sample_documents[0]
    
    quiz = Quiz(
        id=uuid4(),
        document_id=doc.id,
        user_id=other_user_id,
        title="Other User's Quiz",
        status="ready",
        total_questions=2,
        ai_model="gemini-2.5-flash",
        created_at=datetime.utcnow()
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    return quiz


class TestQuizReview:
    """Tests for GET /api/v1/history/quizzes/{quiz_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_quiz_review_success(
        self, authenticated_client: AsyncClient, quiz_with_answers: Quiz
    ):
        """Test successful quiz review retrieval."""
        response = await authenticated_client.get(f"/api/v1/history/quizzes/{quiz_with_answers.id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "success"
        assert "data" in data
        
        quiz_data = data["data"]
        assert quiz_data["id"] == str(quiz_with_answers.id)
        assert quiz_data["title"] == "Test Quiz with Questions"
        assert quiz_data["total_questions"] == 3
        assert quiz_data["score"] == 2  # 2 correct answers
        assert quiz_data["score_percentage"] == pytest.approx(66.7, 0.1)
        
        # Check questions
        questions = quiz_data["questions"]
        assert len(questions) == 3
        
        # First question should be correct
        assert questions[0]["question_text"] == "What is the capital of France?"
        assert questions[0]["user_answer"] == "Paris"
        assert questions[0]["is_correct"] is True
        assert questions[0]["correct_answer"] == "Paris"
        assert questions[0]["options"] == ["London", "Paris", "Berlin", "Madrid"]
        
        # Second question should be incorrect
        assert questions[1]["is_correct"] is False

    @pytest.mark.asyncio
    async def test_get_quiz_review_not_found(
        self, authenticated_client: AsyncClient
    ):
        """Test quiz review returns 404 for non-existent quiz."""
        fake_id = uuid4()
        response = await authenticated_client.get(f"/api/v1/history/quizzes/{fake_id}")
        
        assert response.status_code == 404
        assert "Quiz not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_quiz_review_unauthorized(
        self, guest_client: AsyncClient, quiz_with_answers: Quiz
    ):
        """Test quiz review requires authentication."""
        response = await guest_client.get(f"/api/v1/history/quizzes/{quiz_with_answers.id}")
        
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_quiz_review_forbidden(
        self, authenticated_client: AsyncClient, other_user_quiz: Quiz
    ):
        """Test quiz review returns 403 for another user's quiz."""
        response = await authenticated_client.get(f"/api/v1/history/quizzes/{other_user_quiz.id}")
        
        assert response.status_code == 403
        assert "permission" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_get_quiz_review_without_answers(
        self, authenticated_client: AsyncClient, quiz_with_questions: Quiz
    ):
        """Test quiz review works when user hasn't answered yet."""
        response = await authenticated_client.get(f"/api/v1/history/quizzes/{quiz_with_questions.id}")
        
        assert response.status_code == 200
        data = response.json()
        
        quiz_data = data["data"]
        assert quiz_data["score"] == 0
        assert quiz_data["score_percentage"] == 0.0
        
        # Questions should have no user answers
        for question in quiz_data["questions"]:
            assert question["user_answer"] is None
            assert question["is_correct"] is None

    @pytest.mark.asyncio
    async def test_get_quiz_review_includes_explanation(
        self, authenticated_client: AsyncClient, quiz_with_answers: Quiz
    ):
        """Test quiz review includes explanations for questions."""
        response = await authenticated_client.get(f"/api/v1/history/quizzes/{quiz_with_answers.id}")
        
        assert response.status_code == 200
        data = response.json()
        
        questions = data["data"]["questions"]
        assert questions[0]["explanation"] == "Paris is the capital and largest city of France."
        assert questions[1]["explanation"] == "The Earth is an oblate spheroid."
