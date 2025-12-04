# Story 3.2: Text Extraction from Uploaded Files

## Requirements Context Summary

This story, "Text Extraction from Uploaded Files," is a key part of Epic 3: "Content Ingestion & AI Summarization." Its goal is to accurately extract text from uploaded lecture notes so that the AI can process this content for generating summaries and quizzes, forming a crucial bridge between file upload and AI processing.

### User Story Statement:

As a user,
I want the system to accurately extract text from my uploaded lecture notes,
So that the AI can process the content for summaries and quizzes.

### Acceptance Criteria (from PRD/Epic):

*   **FR-CIP-2**: The text content is successfully extracted from the uploaded file (PDF, TXT, DOCX).
*   **FR-CIP-2**: The extracted text is available for subsequent AI processing (e.g., summarization).
*   **FR-CIP-1**: The system validates uploaded files for format and size.
*   **FR-UM-1 (Partial)**: As a logged-in user, I can successfully upload a lecture note file.

### Relevant Technical Context & Constraints:

*   **Backend**: FastAPI (Python) will host the logic for text extraction.
*   **Libraries**: Backend libraries will be used for parsing PDF (`PyPDF2`), DOCX (`python-docx`), and TXT files.
*   **Error Handling**: Robust error handling is required for corrupted or unparsable files.
*   **Integration**: The extracted text will be passed to the `backend/app/services/ai_generation/` module.
*   **Data Models**: The `documents` table will store the raw extracted text (or a reference to it).
*   **Performance**: Extraction should be efficient, especially for larger files, to contribute to the overall summary generation performance threshold (e.g., under 30 seconds for the entire process).
## Project Structure Alignment

This story will primarily involve the following areas of the project structure:

*   **Backend Services (`backend/app/services/ai_generation/`)**: This module will be extended or modified to include functions responsible for text extraction from various file formats. It will encapsulate the logic for interacting with third-party parsing libraries.
*   **Backend API (`backend/app/api/summaries/`)**: The existing `POST /api/v1/documents/upload` endpoint (from Story 3.1) will be modified or extended to trigger the text extraction process after a successful file upload.
*   **Data Models (`backend/app/db/models.py`)**: The `Document` model will be updated to store the extracted `raw_content` (or a reference to it) and update the `status` to reflect successful text extraction.
*   **Backend Utilities**: Potentially new utility files within `backend/app/core/` or `backend/app/utils/` for file parsing helpers.

### Learnings from Previous Stories (Story 3.1 - File Upload Interface):

Although Story 3.1 is currently in `drafted` status, we will consider its outputs as our "previous learnings" for continuity.

*   **File Handling**: Story 3.1 established the file upload mechanism and basic client-side/server-side validation (type, size). This story will build upon the successful receipt of files by the backend.
*   **Supabase Storage**: Files are expected to be stored in Supabase Storage. This story will need to retrieve files from this storage for text extraction.
*   **Error Handling**: Maintain consistent error handling practices for file processing, building on the framework established in Story 3.1.
*   **Data Model**: The `Document` model introduced in Story 3.1 will be the central entity for tracking the file and its extracted content.
## Acceptance Criteria

1.  **FR-CIP-2**: When a supported file (PDF, TXT, DOCX) is uploaded and successfully stored (from Story 3.1), the system automatically initiates text extraction.
2.  **FR-CIP-2**: The text content from TXT files is extracted accurately and completely.
3.  **FR-CIP-2**: The text content from PDF files is extracted accurately, preserving paragraph breaks and basic formatting where applicable.
4.  **FR-CIP-2**: The text content from DOCX files is extracted accurately, preserving paragraph breaks and basic formatting where applicable.
5.  **FR-CIP-2**: The extracted text is securely stored in the `raw_content` field of the corresponding `documents` table entry, or referenced if stored externally.
6.  **FR-CIP-2**: Upon successful text extraction, the `status` of the `documents` table entry is updated to 'text-extracted' or similar, making the content available for AI processing.
7.  **FR-CIP-2**: If text extraction fails for any reason (e.g., corrupted file, parsing error), the `status` of the `documents` table entry is updated to 'extraction-failed', and relevant error logs are recorded.
8.  **FR-CIP-2**: The text extraction process is efficient and does not significantly impact the overall 30-second performance threshold for summary generation for typical file sizes.

## Tasks & Subtasks

### Backend Development

*   **Research & Select Text Extraction Libraries**
    *   Evaluate Python libraries for PDF parsing (e.g., `PyPDF2`, `pdfminer.six`, `pypdf`).
    *   Evaluate Python libraries for DOCX parsing (e.g., `python-docx`).
    *   Select optimal libraries based on accuracy, performance, and ease of integration.
*   **Implement Text Extraction Service (`backend/app/services/ai_generation/text_extractor.py`)**
    *   Create a module `text_extractor.py` containing functions for:
        *   `extract_text_from_pdf(file_path)`
        *   `extract_text_from_docx(file_path)`
        *   `extract_text_from_txt(file_path)`
    *   Handle different file types dynamically.
    *   Implement error handling for parsing failures (e.g., corrupted files).
*   **Integrate Text Extraction into Document Processing Flow**
    *   Modify the backend's document processing logic (e.g., in `backend/app/api/summaries/main.py` or a dedicated background task handler) to call the `text_extractor` service after a file upload.
    *   Retrieve the uploaded file from Supabase Storage for extraction.
    *   Store the extracted text in the `documents` table's `raw_content` field or as a reference.
    *   Update the `documents` table `status` to 'text-extracted' on success or 'extraction-failed' on failure.
*   **Update Database Models (`backend/app/db/models.py`)**
    *   Ensure the `Document` model has a `raw_content` field (TEXT type, potentially nullable if external storage is used for large texts) and a `status` field (TEXT).

### Testing

*   **Unit Tests (Backend `pytest`)**:
    *   Test `extract_text_from_pdf` with various PDF files (simple text, mixed content, image-only).
    *   Test `extract_text_from_docx` with various DOCX files (simple text, basic formatting).
    *   Test `extract_text_from_txt` with sample TXT files.
    *   Test error handling for corrupted or invalid files in each extraction function.
*   **Integration Tests (Backend `pytest`)**:
    *   Simulate file upload and verify that text extraction is initiated.
    *   Verify that `raw_content` is correctly populated and `status` is updated in the `documents` table after extraction.
    *   Test end-to-end flow from file upload to text extraction for different file types.
*   **Performance Testing**:
    *   Measure text extraction time for typical and large files to ensure it contributes minimally to the overall summarization threshold.
## Change Log

*   **2025-12-04**: Initial draft generated by SM agent.

## Dev Agent Record

### Context Reference
*   docs/sprint-artifacts/3-2-text-extraction-from-uploaded-files.context.xml

Status: ready-for-dev