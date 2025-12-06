# backend/tests/services/test_ai_generation.py

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from app.services.ai_generation.gemini_client import call_gemini_summarize
from app.core.config import settings

# Mark all tests in this file as async
pytestmark = pytest.mark.asyncio

@patch('app.services.ai_generation.gemini_client.genai')
async def test_call_gemini_summarize_success(mock_genai):
    """
    Test successful call to Gemini API.
    """
    # Arrange
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is a summary."
    
    # Configure the mock to return an awaitable
    mock_model.generate_content = MagicMock(return_value=mock_response)
    
    mock_genai.GenerativeModel.return_value = mock_model
    
    # Act
    summary = await call_gemini_summarize("prompt", "text")
    
    # Assert
    assert summary == "This is a summary."
    mock_genai.GenerativeModel.assert_called_once_with('gemini-1.5-flash')
    mock_model.generate_content.assert_called_once_with("prompt\n\ntext")

@patch('app.services.ai_generation.gemini_client.genai')
async def test_call_gemini_summarize_api_error(mock_genai):
    """
    Test that the retry mechanism is triggered on API error.
    """
    # Arrange
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("API Error")
    
    mock_genai.GenerativeModel.return_value = mock_model
    
    # Act & Assert
    with pytest.raises(Exception, match="API Error"):
        await call_gemini_summarize("prompt", "text")
    
    # Check that it was called multiple times due to retry
    assert mock_model.generate_content.call_count > 1

@patch('app.services.ai_generation.gemini_client.genai', None)
async def test_call_gemini_summarize_no_client():
    """
    Test behavior when Gemini client is not configured.
    """
    # Act & Assert
    with pytest.raises(ConnectionError, match="Gemini API client is not configured."):
        await call_gemini_summarize("prompt", "text")

from uuid import uuid4
from app.db.models import Document, Summary
from app.services.ai_generation.summary_generator import generate_summary

@patch('app.services.ai_generation.summary_generator.call_gemini_summarize', new_callable=AsyncMock)
async def test_generate_summary_success(mock_call_gemini):
    """
    Test the success case for generate_summary.
    """
    # Arrange
    mock_call_gemini.return_value = "This is a summary."
    
    mock_session = AsyncMock()
    doc_id = uuid4()
    user_id = uuid4()
    
    mock_doc = Document(id=doc_id, user_id=user_id, filename="test.txt", file_type="text/plain", storage_path="/test.txt", status="text-extracted")
    
    # Setup the mock session to return the mock document
    mock_session.exec.return_value.one_or_none.return_value = mock_doc
    
    # Act
    await generate_summary(doc_id, user_id, "some text", mock_session)
    
    # Assert
    assert mock_doc.status == "summarized"
    mock_session.add.call_count == 2 # one for the doc, one for the summary
    mock_session.commit.call_count == 2 # one for summarizing, one for summarized
    
@patch('app.services.ai_generation.summary_generator.call_gemini_summarize', new_callable=AsyncMock)
async def test_generate_summary_gemini_fails(mock_call_gemini):
    """
    Test the failure case for generate_summary when Gemini fails.
    """
    # Arrange
    mock_call_gemini.side_effect = Exception("Gemini API Error")
    
    mock_session = AsyncMock()
    doc_id = uuid4()
    user_id = uuid4()
    
    mock_doc = Document(id=doc_id, user_id=user_id, filename="test.txt", file_type="text/plain", storage_path="/test.txt", status="text-extracted")
    
    # Setup the mock session to return the mock document
    mock_session.exec.return_value.one_or_none.return_value = mock_doc
    
    # Act
    await generate_summary(doc_id, user_id, "some text", mock_session)
    
    # Assert
    assert mock_doc.status == "summary-failed"
    mock_session.add.call_count == 2 # one for summarizing, one for summary-failed
