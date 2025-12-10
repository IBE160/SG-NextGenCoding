# backend/tests/test_quizzes.py

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel
from typing import AsyncGenerator
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import uuid4
import json

from app.main import app as fastapi_app
from app.db.session import get_session
from app.db.models import Document, Quiz, Question
from app.supabase_client import get_supabase_admin_client
from app.dependencies import get_current_user


DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(DATABASE_URL, echo=False)


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


@pytest_asyncio.fixture
async def client(db_session: AsyncSession, mock_supabase_admin: MagicMock) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    fastapi_app.dependency_overrides[get_session] = override_get_session
    fastapi_app.dependency_overrides[get_supabase_admin_client] = lambda: mock_supabase_admin
    # Allow guest access (no authenticated user)
    fastapi_app.dependency_overrides[get_current_user] = lambda: None

    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    fastapi_app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_document(db_session: AsyncSession) -> Document:
    """Create a sample document with extracted text for testing."""
    document = Document(
        id=uuid4(),
        filename="test_notes.txt",
        file_type="text/plain",
        storage_path="user_uploads/test.txt",
        raw_content="This is a test document about Python programming. Python is a high-level programming language. It supports multiple programming paradigms.",
        status="text-extracted"
    )
    db_session.add(document)
    await db_session.commit()
    await db_session.refresh(document)
    return document


@pytest_asyncio.fixture
async def sample_quiz_with_questions(db_session: AsyncSession, sample_document: Document) -> Quiz:
    """Create a sample quiz with questions for testing."""
    quiz = Quiz(
        id=uuid4(),
        document_id=sample_document.id,
        title=f"Quiz for {sample_document.filename}",
        status="ready",
        total_questions=2,
        ai_model="gemini-2.5-flash"
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    
    # Add questions
    q1 = Question(
        id=uuid4(),
        quiz_id=quiz.id,
        question_type="multiple_choice",
        question_text="What is Python?",
        options=json.dumps(["A. A snake", "B. A programming language", "C. A database", "D. An OS"]),
        correct_answer="B",
        explanation="Python is a high-level programming language.",
        order_index=0
    )
    q2 = Question(
        id=uuid4(),
        quiz_id=quiz.id,
        question_type="true_false",
        question_text="Python supports multiple programming paradigms.",
        options=json.dumps(["True", "False"]),
        correct_answer="True",
        explanation="Python supports procedural, object-oriented, and functional programming.",
        order_index=1
    )
    db_session.add(q1)
    db_session.add(q2)
    await db_session.commit()
    
    return quiz


# --- Unit Tests for Quiz Models ---

@pytest.mark.asyncio
async def test_quiz_model_creation(db_session: AsyncSession, sample_document: Document):
    """Test that Quiz model can be created correctly."""
    quiz = Quiz(
        document_id=sample_document.id,
        title="Test Quiz",
        status="generating",
        total_questions=0
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)
    
    assert quiz.id is not None
    assert quiz.document_id == sample_document.id
    assert quiz.status == "generating"
    assert quiz.ai_model == "gemini-2.5-flash"


@pytest.mark.asyncio
async def test_question_model_creation(db_session: AsyncSession, sample_quiz_with_questions: Quiz):
    """Test that Question models were created correctly."""
    from sqlmodel import select
    result = await db_session.execute(
        select(Question).where(Question.quiz_id == sample_quiz_with_questions.id)
    )
    questions = result.scalars().all()
    
    assert len(questions) == 2
    assert questions[0].question_type == "multiple_choice"
    assert questions[1].question_type == "true_false"


# --- Integration Tests for Quiz API ---

@pytest.mark.asyncio
async def test_generate_quiz_document_not_found(client: AsyncClient):
    """Test quiz generation fails when document doesn't exist."""
    response = await client.post(
        "/api/v1/quizzes/generate",
        json={"document_id": str(uuid4())}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_generate_quiz_no_text_extracted(client: AsyncClient, db_session: AsyncSession):
    """Test quiz generation fails when document has no extracted text."""
    # Create document without raw_content
    document = Document(
        id=uuid4(),
        filename="empty.txt",
        file_type="text/plain",
        storage_path="user_uploads/empty.txt",
        status="uploaded"
    )
    db_session.add(document)
    await db_session.commit()
    
    response = await client.post(
        "/api/v1/quizzes/generate",
        json={"document_id": str(document.id)}
    )
    assert response.status_code == 400
    assert "not been extracted" in response.json()["detail"]


@pytest.mark.asyncio
@patch('app.services.ai_generation.quiz_generator.call_gemini_quiz')
async def test_generate_quiz_success(
    mock_gemini: AsyncMock,
    client: AsyncClient,
    sample_document: Document
):
    """Test successful quiz generation."""
    # Mock Gemini response
    mock_gemini.return_value = json.dumps([
        {
            "question_type": "multiple_choice",
            "question_text": "What is Python?",
            "options": ["A. A snake", "B. A language", "C. A database", "D. An OS"],
            "correct_answer": "B",
            "explanation": "Python is a programming language."
        }
    ])
    
    response = await client.post(
        "/api/v1/quizzes/generate",
        json={"document_id": str(sample_document.id), "num_questions": 1}
    )
    
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["status"] == "ready"
    assert data["data"]["total_questions"] == 1


@pytest.mark.asyncio
async def test_get_quiz_success(client: AsyncClient, sample_quiz_with_questions: Quiz):
    """Test getting a quiz with questions."""
    response = await client.get(f"/api/v1/quizzes/{sample_quiz_with_questions.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_quiz_with_questions.id)
    assert len(data["questions"]) == 2
    # Ensure correct answers are NOT included in questions
    for q in data["questions"]:
        assert "correct_answer" not in q


@pytest.mark.asyncio
async def test_get_quiz_not_found(client: AsyncClient):
    """Test getting a non-existent quiz."""
    response = await client.get(f"/api/v1/quizzes/{uuid4()}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_submit_quiz_success(client: AsyncClient, sample_quiz_with_questions: Quiz, db_session: AsyncSession):
    """Test submitting quiz answers."""
    # Get the questions to get their IDs
    from sqlmodel import select
    result = await db_session.execute(
        select(Question).where(Question.quiz_id == sample_quiz_with_questions.id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    
    response = await client.post(
        f"/api/v1/quizzes/{sample_quiz_with_questions.id}/submit",
        json={
            "answers": [
                {"question_id": str(questions[0].id), "user_answer": "B"},  # Correct
                {"question_id": str(questions[1].id), "user_answer": "False"}  # Incorrect
            ]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["score"] == 1
    assert data["data"]["total"] == 2
    assert data["data"]["percentage"] == 50.0


@pytest.mark.asyncio
async def test_submit_quiz_all_correct(client: AsyncClient, sample_quiz_with_questions: Quiz, db_session: AsyncSession):
    """Test submitting quiz with all correct answers."""
    from sqlmodel import select
    result = await db_session.execute(
        select(Question).where(Question.quiz_id == sample_quiz_with_questions.id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    
    response = await client.post(
        f"/api/v1/quizzes/{sample_quiz_with_questions.id}/submit",
        json={
            "answers": [
                {"question_id": str(questions[0].id), "user_answer": "B"},  # Correct
                {"question_id": str(questions[1].id), "user_answer": "True"}  # Correct
            ]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["score"] == 2
    assert data["data"]["percentage"] == 100.0


@pytest.mark.asyncio
async def test_get_quizzes_for_document(client: AsyncClient, sample_quiz_with_questions: Quiz, sample_document: Document):
    """Test getting all quizzes for a document."""
    response = await client.get(f"/api/v1/documents/{sample_document.id}/quizzes")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(sample_quiz_with_questions.id)


@pytest.mark.asyncio
async def test_get_quizzes_for_nonexistent_document(client: AsyncClient):
    """Test getting quizzes for a non-existent document."""
    response = await client.get(f"/api/v1/documents/{uuid4()}/quizzes")
    assert response.status_code == 404


# --- Tests for Quiz Generator Service ---

@pytest.mark.asyncio
async def test_parse_quiz_response_valid():
    """Test parsing a valid JSON quiz response."""
    from app.services.ai_generation.quiz_generator import parse_quiz_response
    
    response = json.dumps([
        {
            "question_type": "multiple_choice",
            "question_text": "Test question?",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Because A"
        }
    ])
    
    result = parse_quiz_response(response)
    assert len(result) == 1
    assert result[0]["question_type"] == "multiple_choice"


@pytest.mark.asyncio
async def test_parse_quiz_response_with_markdown():
    """Test parsing a quiz response wrapped in markdown code blocks."""
    from app.services.ai_generation.quiz_generator import parse_quiz_response
    
    response = """```json
[
    {
        "question_type": "true_false",
        "question_text": "Is this a test?",
        "options": ["True", "False"],
        "correct_answer": "True",
        "explanation": "Yes it is"
    }
]
```"""
    
    result = parse_quiz_response(response)
    assert len(result) == 1
    assert result[0]["question_type"] == "true_false"


@pytest.mark.asyncio
async def test_parse_quiz_response_invalid_json():
    """Test parsing an invalid JSON response raises error."""
    from app.services.ai_generation.quiz_generator import parse_quiz_response
    
    with pytest.raises(ValueError):
        parse_quiz_response("not valid json")
