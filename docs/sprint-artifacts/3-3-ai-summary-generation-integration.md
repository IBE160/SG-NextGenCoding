# Story 3.3: AI Summary Generation Integration

## Requirements Context Summary

This story, "AI Summary Generation Integration," is a core component of Epic 3: "Content Ingestion & AI Summarization." Its objective is to integrate the AI model (Gemini 2.5) to transform extracted text from lecture notes into concise summaries, enabling users to quickly grasp key concepts. This directly fulfills a primary value proposition of the application.

### User Story Statement:

As a user,
I want to receive a concise summary of my lecture notes,
So that I can quickly grasp the key concepts.

### Acceptance Criteria (from PRD/Epic):

*   **FR-CIP-2**: An AI model (Gemini 2.5) successfully generates a summary of the extracted text content.
*   **FR-CIP-2**: The generated summary accurately reflects the main concepts of the uploaded notes.
*   **FR-CIP-2**: The summary is generated and available within a specified performance threshold (e.g., under 30 seconds for typical files).
*   **FR-CIP-2**: Ethical AI guidelines are followed to minimize bias and ensure factual accuracy in summarization.
*   **FR-CIP-2**: The extracted text is available for subsequent AI processing (from Story 3.2).

### Relevant Technical Context & Constraints:

*   **Backend**: FastAPI (Python) will expose a new API endpoint for triggering summary generation.
*   **AI Integration**: Direct API calls to the Gemini 2.5 Pro/Flash API will be made for summarization.
*   **Asynchronous Processing**: Summary generation is a potentially long-running task; therefore, it must be handled asynchronously, likely using a queuing system or FastAPI BackgroundTasks, to maintain UI responsiveness.
*   **Prompt Engineering**: Careful design of the AI prompt for Gemini 2.5 is crucial to ensure concise, accurate, and unbiased summaries.
*   **Error Handling**: Robust error handling for AI service unavailability, rate limits, and unexpected API responses.
*   **Data Models**: The `summaries` table will store the generated summary text and related metadata. The `documents` table's status will be updated (e.g., 'summarized').
*   **Dependencies**: Relies on successful text extraction (Story 3.2) providing `raw_content`.
*   **Performance**: The AI integration and processing must align with the overall epic's performance target for summary generation.
## Project Structure Alignment

This story will primarily involve the following areas of the project structure:

*   **Backend API (`backend/app/api/summaries/`)**: A new API endpoint (e.g., `POST /api/v1/summaries/generate`) will be created to trigger the AI summary generation process for a given document. This endpoint might accept a `document_id`.
*   **Backend Services (`backend/app/services/ai_generation/`)**: This module will contain the core logic for interacting with the Gemini 2.5 API. A new function (e.g., `generate_summary(extracted_text: str)`) will be implemented, responsible for constructing the AI prompt, making the API call, and parsing the response.
*   **Background Tasks/Queuing System**: The integration of an asynchronous task handling mechanism (e.g., FastAPI BackgroundTasks for MVP, or a dedicated queuing system like Celery for scalability) to execute the potentially long-running `generate_summary` function without blocking the main API thread.
*   **Data Models (`backend/app/db/models.py`)**: The `Document` model will be updated to reflect its `status` (e.g., 'summarizing', 'summarized', 'summary-failed'). A new `Summary` model will be created to store the generated summary text, its associated `document_id`, `user_id`, AI model used, and generation timestamp.
*   **Backend Configuration (`backend/app/core/config.py`)**: Environment variables for the Gemini API key and any relevant AI model parameters will be configured here.

### Learnings from Previous Stories (Story 3.2 - Text Extraction from Uploaded Files):

Story 3.2 is currently in `drafted` status. This story builds directly on the output of Story 3.2:

*   **Extracted Text**: This story assumes that Story 3.2 successfully extracts text from uploaded files and makes it available (e.g., stored in `documents.raw_content` or accessible via a path). The `generate_summary` function will consume this extracted text.
*   **Document Status Updates**: Story 3.2 updates the `documents.status` field. This story will further update this field to reflect the summary generation lifecycle.
*   **Error Handling**: Consistent error handling, especially concerning issues with the upstream AI service, should follow the patterns established in previous backend stories.
*   **Supabase Data Models**: This story will introduce a new `Summary` data model and modify the `Document` data model, following the established conventions for Supabase data interaction.
## Acceptance Criteria

1.  **FR-CIP-2**: When text content from an uploaded document is available (from Story 3.2), the system allows a user to initiate summary generation.
2.  **FR-CIP-2**: Upon initiation, the backend makes an API call to Gemini 2.5 with the extracted text and an optimized prompt for summarization.
3.  **FR-CIP-2**: Gemini 2.5 returns a concise summary that accurately reflects the main concepts of the provided text.
4.  **FR-CIP-2**: The summary generation process (from initiation to completion of the API call) is completed within 30 seconds for typical document sizes.
5.  **FR-CIP-2**: The generated summary text is securely stored in the newly created `summaries` table, associated with the original `document_id` and `user_id`.
6.  **FR-CIP-2**: The `status` field of the corresponding `documents` table entry is updated to 'summarized' upon successful summary generation.
7.  **FR-CIP-2**: If the Gemini 2.5 API call fails, or returns an empty/invalid summary, the `documents` table `status` is updated to 'summary-failed', and relevant error logs are recorded.
8.  **FR-CIP-2**: The system handles Gemini 2.5 API rate limits and potential service unavailability gracefully, providing appropriate feedback/retries.
9.  **FR-CIP-2**: The AI prompt used for summarization adheres to ethical AI guidelines, aiming to minimize bias and ensure factual accuracy.
10. **FR-CIP-2**: Frontend can query the status of summary generation for a given `document_id` and receive 'processing', 'summarized', or 'summary-failed'.

## Tasks & Subtasks

### Backend Development

*   **Implement Gemini API Client (`backend/app/services/ai_generation/gemini_client.py`)**
    *   Create a module for interacting with the Gemini 2.5 API.
    *   Implement function `call_gemini_summarize(prompt: str, text: str)` to send requests and handle responses.
    *   Configure API key retrieval securely (e.g., from environment variables via `backend/app/core/config.py`).
    *   Implement retry logic with exponential backoff for transient API errors/rate limits.
*   **Develop AI Summary Generation Service (`backend/app/services/ai_generation/summary_generator.py`)**
    *   Create `generate_summary(document_id: UUID, user_id: UUID, extracted_text: str)` function.
    *   Construct an optimized prompt for Gemini 2.5 based on the extracted text.
    *   Call the `gemini_client` to get the summary.
    *   Store the generated summary in the `summaries` table (`backend/app/db/models.py`).
    *   Update the `documents` table `status` (`summarizing`, `summarized`, `summary-failed`).
    *   Implement robust error handling for AI-related failures.
*   **Integrate Summary Generation into Document Processing Flow**
    *   Modify the backend's document processing logic (e.g., extend the background task from Story 3.2) to trigger `summary_generator.generate_summary` after successful text extraction.
    *   Ensure the `raw_content` from the `documents` table (or external storage) is passed to the summary generator.
*   **Update Backend API (`backend/app/api/summaries/main.py`)**
    *   Add a new endpoint `POST /api/v1/summaries/generate` (or modify `documents/upload` response to initiate) to allow the frontend to request summary generation for a specific document.
    *   Add an endpoint `GET /api/v1/documents/{document_id}/status` to allow the frontend to query the current status of summary generation.
*   **Update Database Models (`backend/app/db/models.py`)**
    *   Create a new `Summary` model (SQLModel) with fields: `id`, `document_id`, `user_id`, `summary_text`, `generated_at`, `ai_model`, `feedback`.
    *   Update the `Document` model's `status` field to include new states ('summarizing', 'summarized', 'summary-failed').
*   **Configure Environment Variables (`.env` for backend)**
    *   Add `GEMINI_API_KEY` and any other relevant AI configuration.

### Testing

*   **Unit Tests (Backend `pytest`)**:
    *   Test `gemini_client` functions for successful API calls and error handling.
    *   Test prompt construction in `summary_generator`.
    *   Test `Summary` model creation and persistence.
    *   Test `Document` status updates.
*   **Integration Tests (Backend `pytest`)**:
    *   Test end-to-end flow from text extraction (mocking Story 3.2 output) to summary generation via Gemini API.
    *   Verify status updates in the `documents` table and `summaries` table population.
    *   Test API rate limit handling and recovery.
*   **Performance Testing**:
    *   Measure the time taken for summary generation (API call + processing) for various text lengths to ensure it meets the 30-second threshold.
*   **Manual/AI-Assisted Content Review**:
    *   Manually review generated summaries for accuracy, conciseness, and adherence to ethical AI guidelines. This will require human judgment or sophisticated AI-assisted review tools.