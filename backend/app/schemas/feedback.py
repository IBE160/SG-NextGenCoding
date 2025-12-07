# backend/app/schemas/feedback.py

from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class ContentType(str, Enum):
    """Type of content being rated."""
    SUMMARY = "summary"
    QUIZ = "quiz"


# Request schemas
class FeedbackCreateRequest(BaseModel):
    """Request schema for submitting feedback."""
    content_id: UUID = Field(..., description="ID of the content (summary or quiz) being rated")
    content_type: ContentType = Field(..., description="Type of content: 'summary' or 'quiz'")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, max_length=1000, description="Optional feedback comment")


# Response schemas
class FeedbackResponse(BaseModel):
    """Response schema for feedback."""
    id: UUID
    content_id: UUID
    content_type: ContentType
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackCreateResponse(BaseModel):
    """Response for feedback creation."""
    data: FeedbackResponse
    message: str
    status: str = "success"


class FeedbackListResponse(BaseModel):
    """Response for listing feedback."""
    data: list[FeedbackResponse]
    message: str
    status: str = "success"
