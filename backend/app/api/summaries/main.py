# backend/app/api/summaries/main.py

import logging
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status, BackgroundTasks
from typing import Optional
from uuid import UUID, uuid4
import os

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from gotrue.types import User # Import Supabase User type

from app.db.session import get_session
from app.db.models import Document
from app.schemas.document import DocumentUploadRequestFields, DocumentUploadResponse
from app.core.config import settings
from app.supabase_client import get_supabase_admin_client
from app.dependencies import get_current_user
from app.services.ai_generation.text_extractor import extract_text_from_file
from app.services.ai_generation.summary_generator import generate_summary

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


async def run_text_extraction(
    document_id: UUID,
    storage_path: str,
    filename: str,
    user_id: Optional[UUID],
    supabase_admin,
    db_session: AsyncSession,
):
    """
    Background task to extract text from an uploaded file and then trigger summary generation.
    """
    logger.info(f"Starting text extraction for document_id: {document_id}")
    extracted_text = None
    document = None
    
    try:
        # 1. Download the file from Supabase Storage (synchronous operation)
        file_content = supabase_admin.storage.from_("user_documents").download(storage_path)

        # 2. Extract text from the file content
        extracted_text = extract_text_from_file(file_content, filename)

        # 3. Update the document in the database with the existing session
        document = await db_session.get(Document, document_id)
        if document:
            document.raw_content = extracted_text
            document.status = "text-extracted"
            await db_session.commit()
            await db_session.refresh(document)
            logger.info(f"Successfully extracted text and updated status for document_id: {document_id}")
            
            # 4. If text extraction is successful, trigger summary generation
            if extracted_text:
                logger.info(f"Triggering summary generation for document_id: {document_id}")
                # Use user_id if available, otherwise use a placeholder for guest uploads
                summary_user_id = user_id if user_id else document_id  # Use document_id as fallback for guest users
                await generate_summary(
                    document_id=document.id,
                    user_id=summary_user_id,
                    extracted_text=extracted_text,
                    session=db_session # pass the existing session
                )
        else:
            logger.error(f"Document with id {document_id} not found for updating after text extraction.")

    except Exception as e:
        logger.error(f"Error during text extraction for document_id: {document_id}. Error: {e}", exc_info=True)
        try:
            document = await db_session.get(Document, document_id)
            if document:
                document.status = "extraction-failed"
                await db_session.commit()
        except Exception as db_error:
            logger.error(f"Failed to update document status to extraction-failed: {db_error}")

@router.post(
    "/documents/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_202_ACCEPTED
)
async def upload_document_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[UUID] = Form(None), # User ID from frontend (can be None for guest)
    session: AsyncSession = Depends(get_session),
    supabase_admin = Depends(get_supabase_admin_client),  # Use admin client for storage operations
    current_user: Optional[User] = Depends(get_current_user) # Authenticated user from token
):
    # --- Security: Validate user_id ---
    effective_user_id: Optional[UUID] = None
    if current_user:
        if user_id and user_id != UUID(current_user.id):
            logger.warning(f"Authenticated user {current_user.id} attempted to upload for user_id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot upload documents for another authenticated user."
            )
        effective_user_id = current_user.id
    elif user_id:
        logger.warning(f"Unauthenticated user attempted to upload with user_id {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot provide user ID if not authenticated."
        )

    # Server-side validation
    if file.content_type not in ALLOWED_FILE_TYPES:
        logger.warning(f"Upload attempt with unsupported file type: {file.content_type} by user_id: {effective_user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed types are: {', '.join(ALLOWED_FILE_TYPES)}"
        )

    try:
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE_BYTES:
            logger.warning(f"Upload attempt with oversized file by user_id: {effective_user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds limit. Max size is {MAX_FILE_SIZE_MB}MB."
            )

        document_id = uuid4()
        file_extension = os.path.splitext(file.filename)[1] if os.path.splitext(file.filename)[1] else ""
        storage_path = f"user_uploads/{document_id}{file_extension}"

        # Upload to Supabase (synchronous call, no await needed)
        supabase_admin.storage.from_("user_documents").upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )

        # Store metadata in DB
        # For now, set user_id to None to avoid FK constraints until profile system is fully set up
        # TODO: Implement automatic profile creation on user registration
        db_document = Document(
            id=document_id,
            user_id=effective_user_id,
            filename=file.filename,
            file_type=file.content_type,
            storage_path=storage_path,
            status="uploaded"
        )
        session.add(db_document)
        
        document_saved = False
        try:
            await session.commit()
            await session.refresh(db_document)
            document_saved = True
            logger.info(f"Document {document_id} metadata saved to database successfully")
        except Exception as db_error:
            logger.error(f"Could not save document metadata to database: {db_error}. File upload succeeded.", exc_info=True)
            # File is already uploaded to storage, so we'll still return success
            # The document record can be created later or manually
            pass

        # Only add text extraction if document was saved to database
        if document_saved:
            background_tasks.add_task(
                run_text_extraction,
                document_id=db_document.id,
                storage_path=db_document.storage_path,
                filename=db_document.filename,
                user_id=effective_user_id,
                supabase_admin=supabase_admin,
                db_session=session
            )
        else:
            logger.warning(f"Skipping text extraction for document {document_id} - not saved to database")

        logger.info(f"Document {document_id} upload accepted from user_id: {effective_user_id}. Text extraction scheduled.")
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

@router.get("/documents/{document_id}/status")
async def get_document_status(
    document_id: UUID,
    session: AsyncSession = Depends(get_session)
):
    """
    Retrieves the status of a document.
    """
    logger.info(f"Fetching status for document_id: {document_id}")
    
    try:
        statement = select(Document).where(Document.id == document_id)
        results = await session.exec(statement)
        document = results.one_or_none()

        if not document:
            logger.warning(f"Status query for non-existent document_id: {document_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found."
            )
        
        logger.info(f"Status for document {document_id} is '{document.status}'")
        return {"document_id": document_id, "status": document.status}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching status for document_id: {document_id}. Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching document status."
        )
