# backend/app/api/summaries/main.py

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from typing import Optional
from uuid import UUID, uuid4
import os

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.db.models import Document
from app.schemas.document import DocumentUploadRequestFields, DocumentUploadResponse
from app.core.config import settings # Assuming settings will contain Supabase client config
from app.supabase_client import get_supabase_client # Assuming a Supabase client setup

router = APIRouter()

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
    user_id: Optional[UUID] = Form(None), # Use Form for non-file fields in multipart
    session: AsyncSession = Depends(get_session),
    supabase = Depends(get_supabase_client)
):
    # Server-side validation for content type
    if file.content_type not in ALLOWED_FILE_TYPES:
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds limit. Max size is {MAX_FILE_SIZE_MB}MB."
            )

        # Upload file to Supabase Storage
        # The `upload` method expects bytes for the file content
        upload_response = await supabase.storage.from_("user_documents").upload(
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
            user_id=user_id,
            filename=file.filename,
            file_type=file.content_type,
            storage_path=storage_path,
            status="uploaded"
        )
        session.add(db_document)
        await session.commit()
        await session.refresh(db_document)

        return DocumentUploadResponse(
            document_id=db_document.id,
            message="File upload initiated successfully. Processing will begin shortly."
        )

    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the error for debugging
        print(f"Error during file upload: {e}") # This should be replaced by a proper logging solution
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
