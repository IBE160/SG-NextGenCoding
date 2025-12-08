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
