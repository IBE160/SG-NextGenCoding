# backend/app/schemas/quiz.py

from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"


class QuizStatus(str, Enum):
    GENERATING = "generating"
    READY = "ready"
    FAILED = "failed"


# Request schemas
class QuizGenerateRequest(BaseModel):
    document_id: UUID = Field(..., description="ID of the document to generate quiz from")
    num_questions: Optional[int] = Field(5, ge=1, le=20, description="Number of questions to generate")
    question_types: Optional[List[QuestionType]] = Field(
        default=None,
        description="Types of questions to include. If not specified, all types will be included."
    )


# Response schemas for individual question
class QuestionResponse(BaseModel):
    id: UUID
    question_type: QuestionType
    question_text: str
    options: Optional[List[str]] = None  # For multiple choice
    order_index: int

    class Config:
        from_attributes = True


class QuestionWithAnswerResponse(QuestionResponse):
    """Question response that includes the correct answer (for results)"""
    correct_answer: str
    explanation: Optional[str] = None


# Response schemas for quiz
class QuizResponse(BaseModel):
    id: UUID
    document_id: UUID
    title: str
    status: QuizStatus
    total_questions: int
    created_at: datetime

    class Config:
        from_attributes = True


class QuizWithQuestionsResponse(QuizResponse):
    """Quiz response with all questions (without answers)"""
    questions: List[QuestionResponse]


class QuizGenerateResponse(BaseModel):
    """Response for quiz generation request"""
    data: QuizResponse
    message: str
    status: str = "success"


# Answer submission schemas
class AnswerSubmission(BaseModel):
    question_id: UUID
    user_answer: str


class QuizSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]


class AnswerResult(BaseModel):
    question_id: UUID
    is_correct: bool
    user_answer: str
    correct_answer: str
    explanation: Optional[str] = None


class QuizSubmitResponse(BaseModel):
    data: dict  # Contains quiz_id, score, total, percentage, results
    message: str
    status: str = "success"


class QuizResultsResponse(BaseModel):
    quiz_id: UUID
    score: int
    total: int
    percentage: float
    results: List[AnswerResult]
