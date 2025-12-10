# backend/app/api/quizzes/main.py

import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from gotrue.types import User

from app.db.session import get_session
from app.db.models import Document, Quiz, Question
from app.dependencies import get_current_user
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizResponse,
    QuizWithQuestionsResponse,
    QuestionResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuestionType,
    QuizStatus,
)
from app.services.ai_generation.quiz_generator import generate_quiz, grade_quiz

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def run_quiz_generation(
    document_id: UUID,
    user_id: Optional[UUID],
    num_questions: int,
    question_types: Optional[List[QuestionType]],
    quiz_id: UUID,
    db_session: AsyncSession,
):
    """
    Background task to generate quiz using AI.
    """
    logger.info(f"Starting quiz generation for document_id: {document_id}, quiz_id: {quiz_id}")
    
    try:
        await generate_quiz(
            document_id=document_id,
            user_id=user_id,
            num_questions=num_questions,
            question_types=question_types,
            session=db_session
        )
        logger.info(f"Quiz generation completed for quiz_id: {quiz_id}")
    except Exception as e:
        logger.error(f"Quiz generation failed for quiz_id: {quiz_id}. Error: {e}", exc_info=True)
        # Update quiz status to failed
        try:
            quiz = await db_session.get(Quiz, quiz_id)
            if quiz:
                quiz.status = "failed"
                await db_session.commit()
        except Exception as db_error:
            logger.error(f"Failed to update quiz status to failed: {db_error}")


@router.post(
    "/quizzes/generate",
    response_model=QuizGenerateResponse,
    status_code=status.HTTP_202_ACCEPTED
)
async def generate_quiz_endpoint(
    request: QuizGenerateRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Generate a quiz from a document.
    
    This endpoint initiates quiz generation using AI and returns immediately.
    The quiz will be generated in the background.
    """
    effective_user_id: Optional[UUID] = None
    if current_user:
        effective_user_id = UUID(current_user.id)
    
    # Verify document exists
    document = await session.get(Document, request.document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {request.document_id} not found"
        )
    
    # Check if document has extracted text
    if not document.raw_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document text has not been extracted yet. Please wait for processing to complete."
        )
    
    # Check document ownership if user is authenticated
    if current_user and document.user_id and document.user_id != effective_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to generate a quiz for this document"
        )
    
    try:
        # Generate quiz directly (not in background for simplicity in MVP)
        quiz = await generate_quiz(
            document_id=request.document_id,
            user_id=effective_user_id,
            num_questions=request.num_questions or 5,
            question_types=request.question_types,
            session=session
        )
        
        logger.info(f"Quiz {quiz.id} generation initiated for document {request.document_id}")
        
        return QuizGenerateResponse(
            data=QuizResponse(
                id=quiz.id,
                document_id=quiz.document_id,
                title=quiz.title,
                status=QuizStatus(quiz.status),
                total_questions=quiz.total_questions,
                created_at=quiz.created_at
            ),
            message="Quiz generated successfully.",
            status="success"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error generating quiz: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the quiz"
        )


@router.get(
    "/quizzes/{quiz_id}",
    response_model=QuizWithQuestionsResponse
)
async def get_quiz(
    quiz_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get a quiz with its questions (without answers for taking the quiz).
    """
    quiz = await session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with id {quiz_id} not found"
        )
    
    # Check ownership if user is authenticated
    effective_user_id = UUID(current_user.id) if current_user else None
    if current_user and quiz.user_id and quiz.user_id != effective_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this quiz"
        )
    
    # Fetch questions
    result = await session.execute(
        select(Question).where(Question.quiz_id == quiz_id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    
    # Convert questions to response format (without correct answers)
    question_responses = []
    for q in questions:
        options = json.loads(q.options) if q.options else None
        question_responses.append(QuestionResponse(
            id=q.id,
            question_type=QuestionType(q.question_type),
            question_text=q.question_text,
            options=options,
            order_index=q.order_index
        ))
    
    return QuizWithQuestionsResponse(
        id=quiz.id,
        document_id=quiz.document_id,
        title=quiz.title,
        status=QuizStatus(quiz.status),
        total_questions=quiz.total_questions,
        created_at=quiz.created_at,
        questions=question_responses
    )


@router.post(
    "/quizzes/{quiz_id}/submit",
    response_model=QuizSubmitResponse
)
async def submit_quiz(
    quiz_id: UUID,
    request: QuizSubmitRequest,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Submit answers for a quiz and get results.
    """
    quiz = await session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with id {quiz_id} not found"
        )
    
    if quiz.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz is not ready to be submitted"
        )
    
    effective_user_id = UUID(current_user.id) if current_user else None
    
    # Check ownership if user is authenticated
    if current_user and quiz.user_id and quiz.user_id != effective_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to submit answers for this quiz"
        )
    
    try:
        # Convert answers to dict format
        answers = [{"question_id": a.question_id, "user_answer": a.user_answer} for a in request.answers]
        
        # Grade the quiz
        results = await grade_quiz(
            quiz_id=quiz_id,
            answers=answers,
            user_id=effective_user_id,
            session=session
        )
        
        return QuizSubmitResponse(
            data=results,
            message="Quiz submitted successfully.",
            status="success"
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while grading the quiz"
        )


@router.get(
    "/documents/{document_id}/quizzes",
    response_model=List[QuizResponse]
)
async def get_quizzes_for_document(
    document_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get all quizzes for a document.
    """
    document = await session.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with id {document_id} not found"
        )
    
    effective_user_id = UUID(current_user.id) if current_user else None
    
    # Check ownership if user is authenticated
    if current_user and document.user_id and document.user_id != effective_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access quizzes for this document"
        )
    
    # Fetch quizzes
    result = await session.execute(
        select(Quiz).where(Quiz.document_id == document_id).order_by(Quiz.created_at.desc())
    )
    quizzes = result.scalars().all()
    
    return [
        QuizResponse(
            id=q.id,
            document_id=q.document_id,
            title=q.title,
            status=QuizStatus(q.status),
            total_questions=q.total_questions,
            created_at=q.created_at
        )
        for q in quizzes
    ]
