# backend/app/schemas/history.py
"""
Pydantic schemas for history API endpoints.
These schemas define the structure of history items returned by the API.
"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class HistoryItemType(str, Enum):
    """Type of history item."""
    SUMMARY = "summary"
    QUIZ = "quiz"


class SummaryHistoryItem(BaseModel):
    """Schema for a summary item in history list."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    document_id: UUID
    document_title: str = Field(..., description="Title/filename of the source document")
    summary_preview: Optional[str] = Field(None, description="First 200 characters of summary")
    generated_at: datetime
    ai_model: str
    type: HistoryItemType = HistoryItemType.SUMMARY


class QuizHistoryItem(BaseModel):
    """Schema for a quiz item in history list."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    document_id: UUID
    document_title: str = Field(..., description="Title/filename of the source document")
    title: str = Field(..., description="Quiz title")
    status: str
    total_questions: int
    created_at: datetime
    ai_model: str
    type: HistoryItemType = HistoryItemType.QUIZ


class SummaryHistoryResponse(BaseModel):
    """Response wrapper for summary history list."""
    data: List[SummaryHistoryItem]
    message: str = "Summaries retrieved successfully"
    status: str = "success"
    total: int = Field(..., description="Total number of summaries")


class QuizHistoryResponse(BaseModel):
    """Response wrapper for quiz history list."""
    data: List[QuizHistoryItem]
    message: str = "Quizzes retrieved successfully"
    status: str = "success"
    total: int = Field(..., description="Total number of quizzes")


class CombinedHistoryItem(BaseModel):
    """Schema for a combined history item (either summary or quiz)."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    document_id: UUID
    document_title: str
    title: Optional[str] = None  # For quizzes
    preview: Optional[str] = None  # For summaries (first 200 chars)
    type: HistoryItemType
    status: Optional[str] = None  # For quizzes
    total_questions: Optional[int] = None  # For quizzes
    created_at: datetime
    ai_model: str


class CombinedHistoryResponse(BaseModel):
    """Response wrapper for combined history list."""
    data: List[CombinedHistoryItem]
    message: str = "History retrieved successfully"
    status: str = "success"
    total: int = Field(..., description="Total number of history items")


# ============================================================================
# Detailed Quiz Review Schemas (Story 5.2)
# ============================================================================

class QuestionReviewItem(BaseModel):
    """Schema for a question in quiz review, including user's answer."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID = Field(..., description="Question ID")
    question_text: str = Field(..., description="The question text")
    question_type: str = Field(..., description="Type: multiple_choice, true_false, short_answer")
    options: Optional[List[str]] = Field(None, description="Answer options for multiple choice")
    correct_answer: str = Field(..., description="The correct answer")
    explanation: Optional[str] = Field(None, description="Explanation for the answer")
    user_answer: Optional[str] = Field(None, description="User's submitted answer")
    is_correct: Optional[bool] = Field(None, description="Whether user's answer was correct")
    order_index: int = Field(default=0, description="Question order in quiz")


class QuizReviewDetail(BaseModel):
    """Schema for detailed quiz review response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID = Field(..., description="Quiz ID")
    document_id: UUID = Field(..., description="Source document ID")
    document_title: str = Field(..., description="Source document filename")
    title: str = Field(..., description="Quiz title")
    status: str = Field(..., description="Quiz status")
    total_questions: int = Field(..., description="Total number of questions")
    score: int = Field(..., description="Number of correct answers")
    score_percentage: float = Field(..., description="Score as percentage (0-100)")
    ai_model: str = Field(..., description="AI model used to generate quiz")
    created_at: datetime = Field(..., description="When the quiz was created")
    questions: List[QuestionReviewItem] = Field(..., description="Questions with user answers")


class QuizReviewResponse(BaseModel):
    """Response wrapper for detailed quiz review."""
    data: QuizReviewDetail
    message: str = "Quiz review retrieved successfully"
    status: str = "success"
