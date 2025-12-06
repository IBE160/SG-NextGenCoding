# backend/app/services/ai_generation/summary_generator.py

import logging
from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Document, Summary
from app.services.ai_generation.gemini_client import call_gemini_summarize

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_summary(
    document_id: UUID,
    user_id: UUID,
    extracted_text: str,
    session: AsyncSession
):
    """
    Generates a summary for a given document, updates its status,
    and stores the summary in the database.
    """
    logger.info(f"Starting summary generation for document_id: {document_id}")

    # 1. Update document status to 'summarizing'
    try:
        statement = select(Document).where(Document.id == document_id)
        results = await session.exec(statement)
        document = results.one_or_none()

        if not document:
            logger.error(f"Document with id {document_id} not found.")
            return

        document.status = "summarizing"
        session.add(document)
        await session.commit()
        await session.refresh(document)
        logger.info(f"Document {document_id} status updated to 'summarizing'.")

    except Exception as e:
        logger.error(f"Error updating document status to 'summarizing': {e}")
        # Decide if we should proceed or return
        return

    # 2. Construct prompt and call Gemini client
    try:
        # A simple, effective prompt for summarization
        prompt = (
            "You are an expert in creating concise and informative summaries. "
            "Please summarize the following text, focusing on the key concepts and main points. "
            "The summary should be easy to understand for someone new to the topic."
        )

        summary_text = await call_gemini_summarize(prompt=prompt, text=extracted_text)

        if not summary_text:
            raise ValueError("Gemini API returned an empty summary.")

        # 3. Store the generated summary
        new_summary = Summary(
            document_id=document_id,
            user_id=user_id,
            summary_text=summary_text,
            ai_model="gemini-1.5-flash" # or get from config
        )
        session.add(new_summary)

        # 4. Update document status to 'summarized'
        document.status = "summarized"
        session.add(document)

        await session.commit()
        logger.info(f"Successfully generated and stored summary for document {document_id}.")

    except Exception as e:
        logger.error(f"An error occurred during summary generation or storage: {e}")
        # 5. Update document status to 'summary-failed' on error
        try:
            # We need to ensure 'document' is available or re-fetch it
            if not document:
                statement = select(Document).where(Document.id == document_id)
                results = await session.exec(statement)
                document = results.one_or_none()

            if document:
                document.status = "summary-failed"
                session.add(document)
                await session.commit()
                logger.warning(f"Document {document_id} status updated to 'summary-failed'.")

        except Exception as db_error:
            logger.error(f"CRITICAL: Failed to update document status to 'summary-failed' after an error: {db_error}")
            # The session might be in a bad state, so we might need to rollback
            await session.rollback()
