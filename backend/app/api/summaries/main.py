# backend/app/api/summaries/main.py

import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import Optional
from uuid import UUID, uuid4
import os

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from gotrue.types import User # Import Supabase User type

from app.db.session import get_session
from app.db.models import Document
from app.schemas.document import DocumentUploadRequestFields, DocumentUploadResponse
from app.core.config import settings # Assuming settings will contain Supabase client config
from app.supabase_client import get_supabase_admin_client # Import admin client for storage operations
from app.dependencies import get_current_user # Import the new dependency

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Allowed file types and max size from requirements
ALLOWED_FILE_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", # .docx
]
MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

@router.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_202_ACCEPTED
)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    user_id: Optional[UUID] = Form(None), # User ID from frontend (can be None for guest)
    session: AsyncSession = Depends(get_session),
    supabase_admin = Depends(get_supabase_admin_client),  # Use admin client for storage operations
    current_user: Optional[User] = Depends(get_current_user) # Authenticated user from token
):
    # --- Security: Validate user_id ---
    effective_user_id: Optional[UUID] = None
    if current_user:
        # If authenticated, the user_id for the document MUST be the authenticated user's ID
        if user_id and user_id != UUID(current_user.id):
            logger.warning(f"Authenticated user {current_user.id} attempted to upload for user_id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot upload documents for another authenticated user."
            )
        effective_user_id = UUID(current_user.id)
    elif user_id:
        # If not authenticated, but a user_id is provided, reject it (attempt to spoof)
        logger.warning(f"Unauthenticated user attempted to upload with user_id {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot provide user ID if not authenticated."
        )
    # If no current_user and no user_id in form, effective_user_id remains None (guest user)

    # Server-side validation for content type
    if file.content_type not in ALLOWED_FILE_TYPES:
        logger.warning(f"Upload attempt with unsupported file type: {file.content_type} by user_id: {effective_user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed types are: {', '.join(ALLOWED_FILE_TYPES)}"
        )

    try:
        # Generate a unique path for Supabase Storage
        # Extract original file extension, handling cases where filename might not have one
        file_extension = os.path.splitext(file.filename)[1] if os.path.splitext(file.filename)[1] else ".bin"
        document_id = uuid4()
        storage_path = f"user_uploads/{document_id}{file_extension}"

        # Read file content for size validation and upload
        file_content = await file.read()

        if len(file_content) > MAX_FILE_SIZE_BYTES:
            logger.warning(f"Upload attempt with oversized file (actual: {len(file_content)} bytes) by user_id: {effective_user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds limit. Max size is {MAX_FILE_SIZE_MB}MB."
            )

        # Upload file to Supabase Storage
        # The `upload` method expects bytes for the file content
        upload_response = await supabase_admin.storage.from_("user_documents").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Supabase Python client's upload method does not return a status_code on success
        # It typically raises an exception on failure.
        # If no exception, assume success.
        
        # Store document metadata in the database
        db_document = Document(
            id=document_id,
            user_id=effective_user_id, # Use the validated effective_user_id
            filename=file.filename,
            file_type=file.content_type,
            storage_path=storage_path,
            status="uploaded"
        )
        session.add(db_document)
        await session.commit()
        await session.refresh(db_document)

        logger.info(f"Document {document_id} uploaded successfully by user_id: {effective_user_id}")
        return DocumentUploadResponse(
            document_id=db_document.id,
            message="File upload initiated successfully. Processing will begin shortly."
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error during file upload for user_id: {effective_user_id}. Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
