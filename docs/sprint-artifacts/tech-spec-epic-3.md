# Epic Technical Specification: Content Ingestion & AI Summarization

Date: 2025-12-04
Author: BIP
Epic ID: epic-3
Status: Draft

---

## Overview

This epic focuses on the critical initial phase of the application: enabling users to upload lecture notes and transforming them into AI-generated summaries. Leveraging the core "magic" of the system, it shifts users from passive review to active, efficient learning by providing immediate, concise content transformations. This directly supports the project's goal of making learning more efficient and engaging as outlined in the Product Requirements Document (PRD).

## Objectives and Scope

**In-Scope:**
*   **User Management & Authentication (FR-UM-1, FR-UM-2)**: User Registration & Login, and Guest Access providing limited functionality for AI summary generation.
*   **Content Ingestion & Processing (FR-CIP-1, FR-CIP-2)**: Ability to upload lecture notes in PDF, TXT, and DOCX formats, and the automatic AI Summary Generation from these notes using Gemini 2.5.
*   **Data Management & History (FR-DM-1)**: Secure persistence of user data, uploaded notes, and generated summaries for logged-in users, adhering to GDPR, FERPA, and COPPA compliance.
*   **User Interface & Experience (FR-UI-1)**: Development of a responsive web interface for initiating file uploads, displaying summary generation progress, and presenting the generated summaries.

**Out-of-Scope (for this Epic):**
*   AI Quiz Generation (FR-ILA-1).
*   Content Feedback mechanism (FR-ILA-2).
*   Reviewing past quiz results (FR-DM-1 beyond summary history).
*   Advanced UI/UX features beyond the basic display and interaction for summary generation.
*   Real-time features for content processing updates.
*   Full WCAG 2.1 AA compliance audit and remediation (basic accessibility will be considered, but full audit is for Epic 5).

## System Architecture Alignment

This epic aligns directly with the core architectural decisions to separate frontend and backend concerns, leverage FastAPI for AI integration, and Supabase for data persistence. Specifically, it involves components in:
*   `frontend/src/app/upload/`: For the user interface of file uploads.
*   `frontend/src/services/`: For frontend service interactions with the backend.
*   `backend/app/api/summaries/`: API endpoints for summary generation.
*   `backend/app/services/ai_generation/`: Backend services interacting with Gemini 2.5 for AI processing.
*   `backend/app/db/` and `backend/app/schemas/`: For database models and data validation related to uploaded content and summaries.
The use of asynchronous processing and background jobs is critical here to manage the potentially long-running AI tasks, ensuring a responsive user experience.

## Detailed Design

### Services and Modules

This epic will involve the following key services and modules:

*   **Frontend Upload Component (`frontend/src/app/upload/`)**: Provides the user interface for file selection, drag-and-drop functionality, and visual feedback during the upload process. It will communicate with the `Frontend API Service`.
*   **Frontend API Service (`frontend/src/services/`)**: Handles HTTP requests to the FastAPI backend for file uploads and summary generation requests, including error handling and response parsing.
*   **Backend File Upload API (`backend/app/api/summaries/upload`)**: Receives uploaded files, validates them, stores them (e.g., in Supabase Storage), and initiates the AI summarization process.
*   **AI Generation Service (`backend/app/services/ai_generation/`)**: Orchestrates the interaction with the Gemini 2.5 API for text extraction (if needed), content summarization, and handling AI-specific errors or rate limits.
*   **Database Interaction Layer (`backend/app/db/`)**: Manages the persistence of file metadata, raw content, and generated summaries into the Supabase PostgreSQL database.
*   **Pydantic Schemas (`backend/app/schemas/`)**: Defines data models for request and response payloads, ensuring data integrity and validation across the API.

### Data Models and Contracts

Key data models to be managed in Supabase (PostgreSQL) include:

*   **`profiles` table**: (already defined in Architecture)
    *   `id` (UUID, primary key)
    *   `created_at` (timestamp with timezone, default now)
    *   `user_id` (UUID, foreign key referencing `auth.users.id`, unique, not null)
*   **`documents` table**: Stores metadata and content of uploaded lecture notes.
    *   `id` (UUID, primary key)
    *   `user_id` (UUID, foreign key referencing `profiles.user_id`, not null)
    *   `filename` (TEXT, not null)
    *   `file_type` (TEXT, e.g., 'pdf', 'txt', 'docx', not null)
    *   `raw_content` (TEXT, extracted text from document, null allowed if stored externally)
    *   `storage_path` (TEXT, path to file in Supabase Storage, not null)
    *   `status` (TEXT, e.g., 'uploaded', 'processing', 'summarized', 'failed', not null)
    *   `created_at` (timestamp with timezone, default now)
    *   `updated_at` (timestamp with timezone, default now)
*   **`summaries` table**: Stores AI-generated summaries.
    *   `id` (UUID, primary key)
    *   `document_id` (UUID, foreign key referencing `documents.id`, not null)
    *   `user_id` (UUID, foreign key referencing `profiles.user_id`, not null)
    *   `summary_text` (TEXT, not null)
    *   `generated_at` (timestamp with timezone, default now)
    *   `ai_model` (TEXT, e.g., 'gemini-2.5-flash', not null)
    *   `feedback` (JSONB, optional user feedback on summary quality)

### APIs and Interfaces

The FastAPI backend will expose the following key API endpoints:

*   **`POST /api/v1/documents/upload`**:
    *   **Description**: Allows users to upload lecture notes.
    *   **Request**: `multipart/form-data` containing the file and `user_id`.
    *   **Response (202 Accepted)**: `{"message": "File upload initiated", "document_id": "uuid"}`
    *   **Error Codes**: 400 (Invalid file type/size), 401 (Unauthorized), 500 (Server error).
*   **`GET /api/v1/documents/{document_id}/status`**:
    *   **Description**: Retrieves the processing status of an uploaded document.
    *   **Request**: `document_id` (UUID).
    *   **Response (200 OK)**: `{"document_id": "uuid", "status": "processing"|"summarized"|"failed"}`
    *   **Error Codes**: 404 (Document not found), 401 (Unauthorized).
*   **`GET /api/v1/documents/{document_id}/summary`**:
    *   **Description**: Retrieves the generated summary for a document.
    *   **Request**: `document_id` (UUID).
    *   **Response (200 OK)**: `{"document_id": "uuid", "summary_text": "...", "generated_at": "timestamp"}`
    *   **Error Codes**: 404 (Summary not found or not yet generated), 401 (Unauthorized).
*   **`GET /api/v1/users/{user_id}/documents`**:
    *   **Description**: Retrieves a list of all documents uploaded by a user.
    *   **Request**: `user_id` (UUID).
    *   **Response (200 OK)**: `[{"document_id": "uuid", "filename": "...", "status": "..."}]`
    *   **Error Codes**: 401 (Unauthorized).

### Workflows and Sequencing

The primary workflow for this epic involves the following sequence:

1.  **User Authentication/Guest Access**: User logs in or proceeds as a guest.
2.  **File Upload (Frontend)**: User navigates to the upload interface, selects or drags-and-drops a lecture note file (PDF, TXT, DOCX).
3.  **File Upload (Backend API)**: Frontend sends the file via `POST /api/v1/documents/upload`.
4.  **Backend Processing**:
    *   File is validated (type, size).
    *   File is stored in Supabase Storage.
    *   Document metadata is saved to the `documents` table (status: 'processing').
    *   A background job is initiated for AI summarization.
5.  **AI Summarization (Background Job)**:
    *   The `ai_generation` service reads the file from storage.
    *   Text is extracted from the document.
    *   Gemini 2.5 API is called to generate a summary.
    *   Generated summary is saved to the `summaries` table, linked to the `document_id`.
    *   Document status in the `documents` table is updated to 'summarized' or 'failed'.
6.  **Status Polling (Frontend)**: Frontend periodically queries `GET /api/v1/documents/{document_id}/status` to check the summarization progress.
7.  **Summary Display (Frontend)**: Once the document status is 'summarized', the frontend fetches the summary via `GET /api/v1/documents/{document_id}/summary` and displays it to the user.

## Non-Functional Requirements

### Performance

Performance considerations for Epic 3 are critical, especially given the asynchronous nature of AI summarization:

*   **Scalability**: The system must be designed to handle a 10x increase in user load over a 24-hour period without crashing.
*   **Responsiveness**: The UI should remain responsive while AI tasks are in progress, leveraging asynchronous operations (FastAPI's async capabilities) and background jobs for AI generation.
*   **AI Task Management**: A queuing system for AI tasks will be implemented to manage load and provide users with expected wait times.
*   **Cost Control**: Strict cost-control measures, including rate limiting and budget alerts for AI API usage, will be implemented.

### Security

Security is paramount for handling user data and academic content:

*   **Authentication**: Supabase Auth will provide robust JWT-based authentication, including email/password login, email verification, and password reset flows.
*   **Authorization**: Supabase Row Level Security (RLS) will be rigorously applied to all relevant tables (`profiles`, `documents`, `summaries`) to ensure users can only access their own data. Backend API routes will also have appropriate protection.
*   **Data Protection**: All sensitive data will be encrypted at rest and in transit (managed by Supabase and Vercel).
*   **Input Validation**: Pydantic models will enforce strict input validation on the backend to prevent common vulnerabilities.
*   **File Security**: Strict file size limits (e.g., 20MB) and type validation will be enforced. Uploaded files must be scanned for malware.
*   **Content Sanitization**: All user-generated content and extracted text will be sanitized before rendering to prevent cross-site scripting (XSS) attacks.
*   **CORS**: Cross-Origin Resource Sharing will be properly configured in FastAPI.

### Reliability/Availability

The system should be resilient to failures and provide graceful degradation:

*   **AI Service Unavailability**: If the AI service (Gemini 2.5) is unavailable or returns an error, the user should be notified with a user-friendly message, and the system should not crash.
*   **Error Handling**: Robust error handling will be implemented across frontend and backend to manage unexpected issues during file processing or AI interaction.
*   **Data Integrity**: Database transactions and appropriate error recovery mechanisms will ensure data integrity during document and summary creation.

### Observability

Observability will focus on understanding system behavior and diagnosing issues:

*   **Logging**: Clear, concise, and contextual logging will be implemented across both frontend and backend components (basic console logging for MVP). This includes logging of file uploads, AI service calls, and critical status updates.
*   **Metrics**: Basic metrics will be considered for tracking successful uploads, summary generation times, and error rates to monitor system health and performance.

## Dependencies and Integrations

Key dependencies and integration points for Epic 3 include:

*   **Frontend Technologies**:
    *   Next.js 16.0.3 (App Router)
    *   TypeScript
    *   React
    *   Tailwind CSS
    *   Shadcn UI
    *   Axios 1.13.2 (for API communication)
    *   Zustand 5.0.8 (for state management)
*   **Backend Technologies**:
    *   FastAPI 0.122.0 (Python)
    *   Pydantic 2.12.4 (for data validation)
    *   SQLModel 0.0.27 (ORM)
    *   Supabase-py 2.24.0 (Python client for Supabase)
    *   AI Integration: Gemini 2.5 Pro/Flash API
*   **Database & Authentication**:
    *   Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
    *   Supabase-js 2.84.0 (Frontend interaction with Supabase)
*   **Deployment**: Local development environment (Vercel for future production deployment, GitHub Actions for CI/CD).

## Acceptance Criteria (Authoritative)

The following acceptance criteria must be met to consider Epic 3 complete:

1.  **FR-UM-1 (Partial)**: As a logged-in user, I can successfully upload a lecture note file.
2.  **FR-UM-2**: As a guest user, I can upload a lecture note file and generate a summary for up to 2 free uses.
3.  **FR-UM-2**: As a guest user who has exceeded the free use limit, I am prompted to register or log in to continue using the service.
4.  **FR-CIP-1**: The system accepts lecture notes in PDF, TXT, and DOCX formats.
5.  **FR-CIP-1**: The system validates uploaded files for format and size, providing clear error messages for invalid files.
6.  **FR-CIP-1**: The system accurately extracts text content from uploaded PDF, TXT, and DOCX files for AI processing.
7.  **FR-CIP-2**: The system generates a concise summary reflecting the main concepts of the uploaded notes within 30 seconds for a typical file.
8.  **FR-CIP-2**: As a user, I can view the generated summary in a clear and readable format on the UI.
9.  **FR-DM-1**: As a logged-in user, my uploaded lecture notes and generated summaries are securely stored and accessible across sessions.
10. **FR-DM-1**: All user-sensitive data and uploaded content are encrypted at rest and in transit.

## Traceability Mapping

| AC # | Spec Section(s)                                   | Component(s)/API(s)                                                                                                                                                                                                                                                                                                                                | Test Idea                                                                                                     |
| :--- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| 1    | FR-UM-1, Workflows & Sequencing (1)               | `frontend/src/app/(auth)/`, `frontend/src/lib/supabase.ts`, Supabase Auth                                                                                                                                                                                                                                                                          | Unit/Integration test: Successful user login.                                                                 |
| 2    | FR-UM-2, Workflows & Sequencing (1)               | `frontend/src/app/(auth)/`, `frontend/src/lib/supabase.ts`, Supabase Auth                                                                                                                                                                                                                                                                          | E2E test: Guest user uploads file, generates summary, verifies free use count decrements.                     |
| 3    | FR-UM-2, Workflows & Sequencing (1)               | `frontend/src/app/(auth)/`, `frontend/src/lib/supabase.ts`, Supabase Auth                                                                                                                                                                                                                                                                          | E2E test: Guest user hits free use limit, is presented with registration/login prompt.                        |
| 4    | FR-CIP-1, Workflows & Sequencing (2,3)            | `frontend/src/app/upload/`, `frontend/src/services/`, `POST /api/v1/documents/upload`                                                                                                                                                                                                                                                              | Integration test: Upload PDF, TXT, DOCX files successfully.                                                   |
| 5    | FR-CIP-1, Workflows & Sequencing (4)              | `backend/app/api/summaries/upload`, `Pydantic Schemas`                                                                                                                                                                                                                                                                                             | Unit/Integration test: Upload unsupported file type/oversized file, verify error.                             |
| 6    | FR-CIP-1, Workflows & Sequencing (5)              | `backend/app/services/ai_generation/` (text extraction logic)                                                                                                                                                                                                                                                                                      | Unit test: Verify text extraction from sample PDF/TXT/DOCX.                                                   |
| 7    | FR-CIP-2, Workflows & Sequencing (5)              | `backend/app/services/ai_generation/`, Gemini 2.5 API                                                                                                                                                                                                                                                                                              | Integration test: Upload file, verify summary generated within 30s, content relevance check (manual/AI-assist). |
| 8    | FR-CIP-2, Workflows & Sequencing (7)              | `frontend/src/app/summaries/` (or similar display component), `GET /api/v1/documents/{document_id}/summary`                                                                                                                                                                                                                                          | E2E test: Upload file, verify summary appears on UI.                                                          |
| 9    | FR-DM-1, Data Models & Contracts, Security (RLS) | `Supabase (PostgreSQL)`, `backend/app/db/`, `profiles`, `documents`, `summaries` tables, Supabase RLS                                                                                                                                                                                                                                             | Integration test: Logged-in user uploads, logs out, logs in, verifies access to their documents and summaries. |
| 10   | FR-DM-1, Data Models & Contracts, Security        | `Supabase (PostgreSQL)`, `backend/app/db/`, `profiles`, `documents`, `summaries` tables, Supabase configuration for encryption (at rest), HTTPS for in-transit                                                                                                                                                                                         | Security audit/Configuration review: Verify encryption settings for Supabase and deployment.                  |

## Risks, Assumptions, Open Questions

### Risks:

*   **AI Performance at Scale (Risk)**: The performance and cost implications of Gemini 2.5 at high user volumes are unknown.
    *   **Mitigation**: Requires continuous monitoring and potential optimization post-launch. Implement rate limiting and cost alerts.
*   **OCR Accuracy for Diverse PDFs (Risk)**: Accuracy of text extraction from image-based PDFs varies.
    *   **Mitigation**: Research and test methods for detecting poor OCR quality and providing user warnings.
*   **Security Vulnerabilities in File Upload (Risk)**: Malicious file uploads or attacks.
    *   **Mitigation**: Implement file type/size validation, malware scanning, and content sanitization.
*   **Supabase Vendor Lock-in (Risk)**: Reliance on Supabase for database, auth, and storage.
    *   **Mitigation**: Document Supabase-specific implementations for potential future migration.

### Assumptions:

*   **Gemini 2.5 API Stability**: Assume the Gemini 2.5 API will be stable and performant for summarization tasks.
*   **Supabase Service Availability**: Assume Supabase services (DB, Auth, Storage) will maintain high availability and reliability.
*   **File Format Compatibility**: Assume the chosen libraries/methods for PDF, TXT, and DOCX processing will effectively extract content from a wide range of real-world lecture notes.

### Open Questions:

*   **Specific AI Prompt Engineering**: What is the optimal prompt structure for Gemini 2.5 to generate concise and accurate summaries for various lecture note styles?
*   **Text Extraction Library Choice**: Which specific Python library is most effective and reliable for extracting text from PDF, TXT, and DOCX files, considering both content and formatting?
*   **Background Job Implementation**: What is the chosen framework/service for implementing background jobs in FastAPI (e.g., Celery, FastAPI BackgroundTasks, or a simpler approach for MVP)?

## Test Strategy Summary

The test strategy for Epic 3 will encompass the following:

*   **Unit Tests**:
    *   **Scope**: Individual functions/methods in both frontend (React components, utility functions) and backend (API endpoints, AI processing logic, DB interactions).
    *   **Frameworks**: Jest (frontend), Pytest (backend).
*   **Integration Tests**:
    *   **Scope**: Interactions between frontend and backend APIs, backend and Supabase services (Auth, DB, Storage), and backend with the Gemini 2.5 API.
    *   **Focus**: Verify data flow, API contracts, and correct handling of responses/errors across service boundaries.
*   **End-to-End (E2E) Tests**:
    *   **Scope**: Simulate user journeys for file upload, AI summary generation, and display of results, covering both logged-in and guest user flows.
    *   **Frameworks**: Playwright or Cypress (frontend E2E).
    *   **Coverage**: Ensure all Acceptance Criteria (ACs 1-10) are met through E2E scenarios.
*   **Edge Case Testing**: Specifically test scenarios identified in the PRD, such as large file uploads, empty/short files, unsupported file types, and AI service unavailability.
*   **Performance Testing**: Basic load testing on the file upload and summary generation endpoints to identify bottlenecks and validate NFRs.
*   **Security Testing**: Manual and automated checks for common vulnerabilities (e.g., input sanitization, RLS enforcement).
*   **Manual/Exploratory Testing**: Essential for evaluating the quality and relevance of AI-generated summaries, as automated checks alone are insufficient for subjective content quality.
