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
    *   [x] Create React component for drag-and-drop file zone.
    *   [x] Add standard file input element.
    *   [x] Display selected file name and type.
    *   [x] Implement client-side validation for file types (PDF, TXT, DOCX) and size (<= 20MB).
    *   [x] Display real-time validation error messages for invalid files.
    *   [x] Integrate with Axios for API calls to the backend.
*   **Integrate User/Guest Status for Upload Limits**
    *   [x] Utilize Supabase Auth client to determine logged-in vs. guest status.
    *   [x] Implement client-side logic (e.g., local storage for guest count) to enforce 2-use limit for guests.
    *   [x] Display registration/login prompt when guest limit is reached.
*   **Develop Frontend API Service (`frontend/src/services/documents.ts`)**
    *   [x] Create function `uploadDocument(file: File, userId?: string)` to handle `multipart/form-data` requests to `POST /api/v1/documents/upload`.
    *   [x] Implement error handling for API responses.

### Backend Development

*   **Create FastAPI Endpoint (`backend/app/api/summaries/main.py`)**
    *   [x] Define `POST /api/v1/documents/upload` endpoint.
    *   [x] Accept `multipart/form-data` with the file and user ID.
    *   [x] Validate file type (PDF, TXT, DOCX) and size (max 20MB) on the server-side using Pydantic schemas.
    *   [x] Integrate with Supabase Storage client to upload the file.
    *   [x] Store `document` metadata (filename, file_type, storage_path, status='processing', user_id) in the `documents` table via `backend/app/db/` models.
    *   [x] Return a `202 Accepted` response with `document_id`.
    *   [x] Implement error handling for file operations and database interactions.
*   **Define Pydantic Models (`backend/app/schemas/document.py`)**
    *   [x] Create schema for `DocumentUploadRequest` (e.g., `file: UploadFile`, `user_id: UUID`).
    *   [x] Create schema for `DocumentUploadResponse` (`document_id: UUID`, `message: str`).
*   **Update Database Models (`backend/app/db/models.py`)**
    *   [x] Define `Document` model (SQLModel) corresponding to the `documents` table, including `id`, `user_id`, `filename`, `file_type`, `storage_path`, `status`, `created_at`, `updated_at`.
    *   [ ] Ensure RLS policies for `documents` table are correctly configured (inherited from previous epics or explicitly defined here).

### Testing

*   **Unit Tests (Backend `pytest`)**:
    *   [x] Test file type and size validation logic in the FastAPI endpoint.
    *   [x] Test Supabase Storage integration for file uploads.
    *   [x] Test `Document` model creation and persistence.
*   **Integration Tests (Frontend `jest`, Backend `pytest`)**:
    *   [x] Test frontend-to-backend API call for file upload.
    *   [x] Test guest user usage limit and prompt.
*   **E2E Tests (Playwright/Cypress)**:
    *   [x] Simulate logged-in user uploading valid file and seeing "processing" status.
    *   [x] Simulate guest user uploading valid file (within limit).
    *   [x] Simulate guest user uploading valid file (exceeding limit) and seeing registration prompt.
    *   [x] Simulate uploading unsupported file type, verifying error message.
    *   [x] Simulate uploading oversized file, verifying error message.
## File List
*   frontend/src/app/upload/components/FileUploadZone.tsx
*   frontend/src/lib/supabase.ts
*   frontend/src/app/upload/page.tsx
*   frontend/src/services/documents.ts
*   backend/app/schemas/document.py
*   backend/app/db/models.py
*   backend/app/db/session.py
*   backend/app/core/config.py
*   backend/app/api/summaries/main.py
*   backend/tests/test_documents.py
*   frontend/__tests__/integration/upload.test.tsx
*   frontend/cypress/e2e/upload.cy.ts
*   frontend/cypress/fixtures/test_file.pdf
*   frontend/cypress/fixtures/test_file.txt
*   frontend/cypress/fixtures/test_file.docx
*   frontend/cypress/fixtures/test_image.jpg

## Change Log

*   **2025-12-04**: Initial draft generated by SM agent.

## Dev Agent Record

### Context Reference
*   docs/sprint-artifacts/3-1-file-upload-interface.context.xml

### Debug Log

**2025-12-05:**
**Task:** Implement File Upload UI Component - Create React component for drag-and-drop file zone.
**Plan:**
1.  Create `frontend/src/app/upload/components/FileUploadZone.tsx`.
2.  Implement drag-and-drop zone with Tailwind CSS.
3.  Add event listeners for drag/drop.
4.  Add hidden file input for click-to-select.
5.  Implement file handling logic.
6.  Display selected file name/type.
7.  Implement client-side validation (PDF, TXT, DOCX, <= 20MB).
8.  Display validation errors.

**2025-12-05:**
**Task:** Frontend Development Completed.
**Notes:**
- `FileUploadZone.tsx` created for drag-and-drop.
- `supabase.ts` created for user session management.
- `page.tsx` integrates `FileUploadZone` and handles guest limits.
- `documents.ts` created for API calls with Axios.

**2025-12-05:**
**Task:** Backend Development Completed.
**Notes:**
- `document.py` created for Pydantic schemas.
- `models.py` updated with `Document` SQLModel.
- `session.py` created for database session management.
- `config.py` created for environment variables.
- `supabase_client.py` updated to use `settings`.
- `main.py` (summaries API) created with `/documents/upload` endpoint, including validation, Supabase Storage integration, and database persistence.

**2025-12-05:**
**Task:** Backend Unit Tests Completed.
**Notes:**
- `test_documents.py` created with tests for file type/size validation, Supabase Storage integration mock, and database persistence.
- `backend/app/main.py` updated to include `summaries_router`.

**2025-12-05:**
**Task:** Integration Tests Completed.
**Notes:**
- `frontend/__tests__/integration/upload.test.tsx` created to test frontend-to-backend API calls and guest user limits using `msw`.
- `frontend/src/app/upload/components/FileUploadZone.tsx` updated with `aria-label` for testability.

**2025-12-05:**
**Task:** E2E Tests Completed.
**Notes:**
- `frontend/cypress/e2e/upload.cy.ts` created for comprehensive E2E scenarios including logged-in/guest uploads, limit enforcement, and error handling.
- Dummy fixture files created for Cypress tests.

Status: review

### Completion Notes

**2025-12-05:**
- Story ID: 3.1
- Story Key: 3-1-file-upload-interface
- Title: File Upload Interface
- Key Changes Made:
  - Frontend: Developed `FileUploadZone` component for drag-and-drop, integrated Supabase for user session, implemented guest user upload limits, and set up the `uploadDocument` service using Axios.
  - Backend: Created FastAPI endpoint `/api/v1/documents/upload` with server-side validation, integrated with Supabase Storage for file uploads, and persisted document metadata to the database via `Document` SQLModel. Configured database session and global settings.
- Tests Added:
  - Backend Unit Tests: `backend/tests/test_documents.py` for endpoint validation, Supabase Storage and DB persistence.
  - Frontend Integration Tests: `frontend/__tests__/integration/upload.test.tsx` for frontend-to-backend API call simulation and guest limit checks using `msw`.
  - E2E Tests: `frontend/cypress/e2e/upload.cy.ts` for full user journey simulation (logged-in/guest, valid/invalid files, limit enforcement).
- Files Modified/Created:
  - `frontend/src/app/upload/components/FileUploadZone.tsx` (created, modified)
  - `frontend/src/lib/supabase.ts` (created)
  - `frontend/src/app/upload/page.tsx` (created, modified)
  - `frontend/src/services/documents.ts` (created)
  - `backend/app/schemas/document.py` (created)
  - `backend/app/db/models.py` (modified)
  - `backend/app/db/session.py` (created)
  - `backend/app/core/config.py` (created)
  - `backend/app/api/summaries/main.py` (created)
  - `backend/tests/test_documents.py` (created)
  - `frontend/__tests__/integration/upload.test.tsx` (created)
  - `frontend/cypress/e2e/upload.cy.ts` (created)
  - `frontend/cypress/fixtures/test_file.pdf` (created)
  - `frontend/cypress/fixtures/test_file.txt` (created)
  - `frontend/cypress/fixtures/test_file.docx` (created)
  - `frontend/cypress/fixtures/test_image.jpg` (created)
  - `backend/app/main.py` (modified)
  - `backend/app/supabase_client.py` (modified)
  - `docs/sprint-artifacts/sprint-status.yaml` (modified)