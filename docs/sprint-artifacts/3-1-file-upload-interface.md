# Story 3.1: File Upload Interface

## Requirements Context Summary

This story, "File Upload Interface," is the first step within Epic 3: "Content Ingestion & AI Summarization." The primary goal of this epic is to enable users to upload lecture notes and transform them into AI-generated summaries, directly supporting the project's aim for more efficient and engaging learning.

### User Story Statement:

As a user,
I want to easily upload my lecture notes in PDF, TXT, or DOCX format,
So that the system can process them.

### Acceptance Criteria (from PRD/Epic):

*   **FR-CIP-1**: The system accepts lecture notes in PDF, TXT, and DOCX formats.
*   **FR-CIP-1**: The system validates uploaded files for format and size, providing clear error messages for invalid files.
*   **FR-CIP-1**: The system accurately extracts text content from uploaded PDF, TXT, and DOCX files for AI processing.
*   **FR-UM-1 (Partial)**: As a logged-in user, I can successfully upload a lecture note file.
*   **FR-UM-2**: As a guest user, I can upload a lecture note file and generate a summary for up to 2 free uses.

### Relevant Technical Context & Constraints:

*   **Frontend**: Built with Next.js, TypeScript, React, Tailwind CSS, and Shadcn UI. The `frontend/src/app/upload/` directory will house the UI components for file selection and drag-and-drop functionality.
*   **Backend**: FastAPI (Python) will expose API endpoints. The `POST /api/v1/documents/upload` API endpoint is central to this story.
*   **File Handling**: Client-side validation for file type (PDF, TXT, DOCX) and size (max 20MB) will be implemented.
*   **API Communication**: Frontend will use Axios for interaction with the backend API.
*   **Authentication**: Users will be either logged in (via Supabase Auth) or guest users, affecting the tracking of file uploads.
*   **Storage**: Uploaded files will be stored in Supabase Storage.
*   **Error Handling**: Clear error messages should be provided for invalid file types, sizes, or upload failures.
## Project Structure Alignment

This story will primarily involve the following areas of the project structure:

*   **Frontend UI (`frontend/src/app/upload/`)**: Creation of new React components for the file upload interface, including drag-and-drop zones, file input elements, and visual feedback for selected files and validation errors.
*   **Frontend Services (`frontend/src/services/`)**: Implementation of a new service function to handle the API call to the backend for file uploads, including managing `multipart/form-data` and handling API responses/errors.
*   **Backend API (`backend/app/api/summaries/`)**: Development of a new FastAPI endpoint (`POST /api/v1/documents/upload`) to receive, validate, and process uploaded files. This will involve integrating with Supabase Storage for file storage.
*   **Backend Schemas (`backend/app/schemas/`)**: Definition of Pydantic models for request validation of the uploaded file metadata.
*   **Data Models (`backend/app/db/`)**: Updates to existing or creation of new SQLAlchemy/SQLModel models for tracking uploaded `documents` (e.g., file metadata, status).

### Learnings from Previous Stories:

As this is the first development story for Epic 3, there are no prior story learnings to incorporate. The foundational work from Epic 1 (project setup, Supabase integration, basic UI theming) and Epic 2 (user authentication, guest access) will serve as prerequisites. Developers should ensure adherence to the established coding standards, architectural patterns, and security principles defined in those epics. Specifically, ensure Supabase Auth and RLS are correctly applied for user context.
## Acceptance Criteria

1.  **FR-UM-1 (Partial)**: As a logged-in user, I can successfully upload a lecture note file.
2.  **FR-UM-2**: As a guest user, I can upload a lecture note file for up to 2 free uses, with the system tracking my usage.
3.  **FR-UM-2**: As a guest user who has exceeded the free use limit, I am presented with a clear prompt to register or log in to continue using the file upload feature.
4.  **FR-CIP-1**: The file upload interface clearly indicates supported file types (PDF, TXT, DOCX) and maximum file size (20MB).
5.  **FR-CIP-1**: When I select or drag-and-drop a supported file, its name and type are immediately displayed in the UI.
6.  **FR-CIP-1**: When I attempt to upload an unsupported file type, the UI displays an immediate, user-friendly error message, and the upload is prevented.
7.  **FR-CIP-1**: When I attempt to upload a file exceeding 20MB, the UI displays an immediate, user-friendly error message, and the upload is prevented.
8.  **FR-CIP-1**: The frontend sends the uploaded file to the backend via the `POST /api/v1/documents/upload` API endpoint using `multipart/form-data`.
9.  **FR-CIP-1**: The backend successfully receives the uploaded file, validates its format and size, and stores it securely in Supabase Storage.
10. **FR-CIP-1**: Upon successful backend receipt and storage, the frontend receives a confirmation with a `document_id`, and the UI indicates the file is being processed.

## Tasks & Subtasks

### Frontend Development

*   **Implement File Upload UI Component (`frontend/src/app/upload/`)**
    *   Create React component for drag-and-drop file zone.
    *   Add standard file input element.
    *   Display selected file name and type.
    *   Implement client-side validation for file types (PDF, TXT, DOCX) and size (<= 20MB).
    *   Display real-time validation error messages for invalid files.
    *   Integrate with Axios for API calls to the backend.
*   **Integrate User/Guest Status for Upload Limits**
    *   Utilize Supabase Auth client to determine logged-in vs. guest status.
    *   Implement client-side logic (e.g., local storage for guest count) to enforce 2-use limit for guests.
    *   Display registration/login prompt when guest limit is reached.
*   **Develop Frontend API Service (`frontend/src/services/documents.ts`)**
    *   Create function `uploadDocument(file: File, userId?: string)` to handle `multipart/form-data` requests to `POST /api/v1/documents/upload`.
    *   Implement error handling for API responses.

### Backend Development

*   **Create FastAPI Endpoint (`backend/app/api/summaries/main.py`)**
    *   Define `POST /api/v1/documents/upload` endpoint.
    *   Accept `multipart/form-data` with the file and user ID.
    *   Validate file type (PDF, TXT, DOCX) and size (max 20MB) on the server-side using Pydantic schemas.
    *   Integrate with Supabase Storage client to upload the file.
    *   Store `document` metadata (filename, file_type, storage_path, status='processing', user_id) in the `documents` table via `backend/app/db/` models.
    *   Return a `202 Accepted` response with `document_id`.
    *   Implement error handling for file operations and database interactions.
*   **Define Pydantic Models (`backend/app/schemas/document.py`)**
    *   Create schema for `DocumentUploadRequest` (e.g., `file: UploadFile`, `user_id: UUID`).
    *   Create schema for `DocumentUploadResponse` (`document_id: UUID`, `message: str`).
*   **Update Database Models (`backend/app/db/models.py`)**
    *   Define `Document` model (SQLModel) corresponding to the `documents` table, including `id`, `user_id`, `filename`, `file_type`, `storage_path`, `status`, `created_at`, `updated_at`.
    *   Ensure RLS policies for `documents` table are correctly configured (inherited from previous epics or explicitly defined here).

### Testing

*   **Unit Tests (Backend `pytest`)**:
    *   Test file type and size validation logic in the FastAPI endpoint.
    *   Test Supabase Storage integration for file uploads.
    *   Test `Document` model creation and persistence.
*   **Integration Tests (Frontend `jest`, Backend `pytest`)**:
    *   Test frontend-to-backend API call for file upload.
    *   Test guest user usage limit and prompt.
*   **E2E Tests (Playwright/Cypress)**:
    *   Simulate logged-in user uploading valid file and seeing "processing" status.
    *   Simulate guest user uploading valid file (within limit).
    *   Simulate guest user uploading valid file (exceeding limit) and seeing registration prompt.
    *   Simulate uploading unsupported file type, verifying error message.
    *   Simulate uploading oversized file, verifying error message.
## Change Log

*   **2025-12-04**: Initial draft generated by SM agent.

## Dev Agent Record

### Context Reference
*   docs/sprint-artifacts/3-1-file-upload-interface.context.xml

Status: ready-for-dev