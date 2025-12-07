# backend/app/api/feedback/main.py

import logging
import html
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from gotrue.types import User

from app.db.session import get_session
from app.db.models import Feedback, Summary, Quiz
from app.dependencies import get_current_user
from app.schemas.feedback import (
    FeedbackCreateRequest,
    FeedbackCreateResponse,
    FeedbackResponse,
    FeedbackListResponse,
    ContentType,
)

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def sanitize_input(text: Optional[str]) -> Optional[str]:
    """Sanitize user input to prevent XSS attacks."""
    if text is None:
        return None
    # Escape HTML entities
    return html.escape(text.strip())


@router.post(
    "/feedback",
    response_model=FeedbackCreateResponse,
    status_code=status.HTTP_201_CREATED
)
async def submit_feedback(
    request: FeedbackCreateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Submit feedback for a summary or quiz.
    
    Users can rate content from 1-5 stars and optionally leave a comment.
    Feedback is associated with the user if authenticated, otherwise anonymous.
    """
    effective_user_id: Optional[UUID] = None
    if current_user:
        effective_user_id = UUID(current_user.id)
    
    # Verify the content exists
    if request.content_type == ContentType.SUMMARY:
        content = await session.get(Summary, request.content_id)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Summary with id {request.content_id} not found"
            )
    elif request.content_type == ContentType.QUIZ:
        content = await session.get(Quiz, request.content_id)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Quiz with id {request.content_id} not found"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {request.content_type}"
        )
    
    # Check if user already submitted feedback for this content
    if effective_user_id:
        existing_query = select(Feedback).where(
            Feedback.content_id == request.content_id,
            Feedback.content_type == request.content_type.value,
            Feedback.user_id == effective_user_id
        )
        existing_result = await session.execute(existing_query)
        existing_feedback = existing_result.scalar_one_or_none()
        
        if existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already submitted feedback for this content"
            )
    
    try:
        # Sanitize the comment to prevent XSS
        sanitized_comment = sanitize_input(request.comment)
        
        # Create feedback record
        feedback = Feedback(
            content_id=request.content_id,
            content_type=request.content_type.value,
            user_id=effective_user_id,
            rating=request.rating,
            comment=sanitized_comment
        )
        
        session.add(feedback)
        await session.commit()
        await session.refresh(feedback)
        
        logger.info(
            f"Feedback submitted: content_id={request.content_id}, "
            f"content_type={request.content_type}, rating={request.rating}"
        )
        
        return FeedbackCreateResponse(
            data=FeedbackResponse(
                id=feedback.id,
                content_id=feedback.content_id,
                content_type=ContentType(feedback.content_type),
                rating=feedback.rating,
                comment=feedback.comment,
                created_at=feedback.created_at
            ),
            message="Feedback submitted successfully",
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while submitting feedback"
        )


@router.get(
    "/feedback/{content_type}/{content_id}",
    response_model=FeedbackListResponse
)
async def get_feedback_for_content(
    content_type: ContentType,
    content_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get all feedback for a specific piece of content.
    
    Returns feedback from the current user only (for privacy).
    """
    effective_user_id: Optional[UUID] = None
    if current_user:
        effective_user_id = UUID(current_user.id)
    
    try:
        # Query feedback for the content
        query = select(Feedback).where(
            Feedback.content_id == content_id,
            Feedback.content_type == content_type.value
        )
        
        # If user is authenticated, only show their feedback
        if effective_user_id:
            query = query.where(Feedback.user_id == effective_user_id)
        else:
            # For anonymous users, don't return any feedback (they can't be identified)
            return FeedbackListResponse(
                data=[],
                message="No feedback found",
                status="success"
            )
        
        result = await session.execute(query)
        feedback_list = result.scalars().all()
        
        return FeedbackListResponse(
            data=[
                FeedbackResponse(
                    id=f.id,
                    content_id=f.content_id,
                    content_type=ContentType(f.content_type),
                    rating=f.rating,
                    comment=f.comment,
                    created_at=f.created_at
                )
                for f in feedback_list
            ],
            message=f"Found {len(feedback_list)} feedback entries",
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error retrieving feedback: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving feedback"
        )
