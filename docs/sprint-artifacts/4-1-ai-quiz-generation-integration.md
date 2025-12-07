# Story 4.1: AI Quiz Generation Integration

Status: ready-for-dev

## Story

As a user,
I want to receive relevant quiz questions based on my lecture notes or summary,
so that I can actively test my understanding.

### Requirements & Context Summary for Story 4.1: AI Quiz Generation Integration

**User Story Statement:**
As a user, I want to receive relevant quiz questions based on my lecture notes or summary, so that I can actively test my understanding.

**From Epic 4: Interactive Quiz Generation & Feedback**
*   **Goal:** Provide users with interactive AI-generated quizzes and a mechanism to provide feedback on the content.

**Acceptance Criteria (Story 4.1):**
*   **Given** I have uploaded a file and its text has been extracted,
*   **When** I request a quiz,
*   **Then** an AI model (Gemini 2.5) generates a set of quiz questions (e.g., multiple-choice, true/false, short answer) with correct answers based on the content.
*   **And** the quiz is generated within a specified performance threshold (e.g., under 30 seconds).
*   **And** ethical AI guidelines are followed to minimize bias and ensure factual accuracy.

**Relevant Architectural Components & Decisions:**
*   **Frontend Paths:** `frontend/src/app/quizzes/`, `frontend/src/services/`
*   **Backend Paths:** `backend/app/api/quizzes/`, `backend/app/services/ai_generation/`, `backend/app/db/`, `backend/app/schemas/`
*   **AI Model:** Gemini 2.5 Pro/Flash
*   **Backend Framework:** FastAPI (Python)
*   **Integration Points:** Backend to Gemini API (Direct API calls).
*   **Performance:** Asynchronous Processing with Background Jobs for AI generation.
*   **Implementation Patterns:**
    *   **Naming Conventions:** API Endpoints (plural nouns for resources, kebab-case), Database Tables (plural, snake_case), Frontend Components (PascalCase), Backend Organization (by domain/feature).
    *   **Structure Patterns:** Tests co-located with code, Backend organized by domain/feature.
    *   **Test Strategy:** Unit Tests, Integration Tests, E2E Tests (will include quiz generation).

### Project Structure Alignment Summary

This is the first story in Epic 4, so there are no previous story learnings to integrate.

**Expected New Components for Story 4.1:**
*   **Frontend:** New React components within `frontend/src/app/quizzes/` for quiz UI.
*   **Backend:** New API endpoints in `backend/app/api/quizzes/`, business logic in `backend/app/services/ai_generation/`, database models in `backend/app/db/`, and Pydantic schemas in `backend/app/schemas/` related to quiz generation.
*   **Shared:** Potential shared types or models in `shared/` if applicable.

**Considerations:**
*   Adhere to established project structure as outlined in `architecture.md`.
*   Follow naming conventions for files, components, API endpoints, and database entities.
*   Ensure proper testing practices with unit, integration, and E2E tests co-located with code.

## Acceptance Criteria

**Given** I have uploaded a file and its text has been extracted,
**When** I request a quiz,
**Then** an AI model (Gemini 2.5) generates a set of quiz questions (e.g., multiple-choice, true/false, short answer) with correct answers based on the content.
*   **Verification:** Integration test for AI quiz generation.
**And** the quiz is generated within a specified performance threshold (e.g., under 30 seconds).
*   **Verification:** Performance testing of the quiz generation endpoint.
**And** ethical AI guidelines are followed to minimize bias and ensure factual accuracy.
*   **Verification:** Manual review of generated quizzes, and automated checks for content safety (if applicable).

## Tasks & Subtasks

**Backend Development:**
*   **Task:** Design and implement database schema for quizzes and questions. (AC: 1)
    *   [ ] Define `Quiz` and `Question` models in `backend/app/db/` (using SQLModel).
    *   [ ] Create Alembic migrations for the new tables.
*   **Task:** Implement FastAPI endpoint for quiz requests. (AC: 1, 2)
    *   [ ] Create `POST /api/v1/quizzes/generate` endpoint in `backend/app/api/quizzes/`.
    *   [ ] Implement Pydantic schemas for request/response validation in `backend/app/schemas/`.
*   **Task:** Integrate with Gemini 2.5 for quiz generation. (AC: 1, 2, 3)
    *   [ ] Develop service layer in `backend/app/services/ai_generation/` to handle prompt engineering and API calls to Gemini.
    *   [ ] Implement asynchronous processing for quiz generation using background jobs.
    *   [ ] Handle potential AI service errors gracefully.
*   **Task:** Implement basic quiz grading logic (initially just comparing answers). (AC: 1)
    *   [ ] Develop logic to compare user answers with correct answers.
*   **Testing (Backend):** (AC: 1, 2)
    *   [ ] Write unit tests for database models and CRUD operations.
    *   [ ] Write integration tests for the `/api/v1/quizzes/generate` endpoint, including AI model interaction.

**Frontend Development:**
*   **Task:** Create UI for requesting quiz generation. (AC: 1, 2)
    *   [ ] Add a "Generate Quiz" button on the file view page.
    *   [ ] Implement loading states/indicators for quiz generation.
*   **Task:** Implement interactive quiz interface. (AC: 1)
    *   [ ] Design and develop React components for displaying quiz questions one at a time (`frontend/src/app/quizzes/`).
    *   [ ] Implement state management (Zustand) for quiz flow and user answers.
    *   [ ] Implement navigation between questions (next/previous).
*   **Task:** Display quiz results. (AC: 1)
    *   [ ] Create UI for displaying the quiz score and review correct/incorrect answers.
*   **Testing (Frontend):** (AC: 1, 2)
    *   [ ] Write unit tests for React components.
    *   [ ] Write integration tests for user interaction with the quiz UI.
    *   [ ] Write E2E tests for the entire quiz generation and taking flow using Cypress.

**General:**
*   [ ] Ensure compliance with ethical AI guidelines in prompt engineering and content filtering. (AC: 3)
*   [ ] Document API endpoints and data models.

## Dev Notes

### Project Structure Notes

- Adhere to the project structure defined in `architecture.md`.
- New backend services related to AI quiz generation should reside in `backend/app/services/ai_generation/`.
- Frontend components for the quiz UI should be placed in `frontend/src/app/quizzes/`.
- Database models for quizzes and questions should be defined in `backend/app/db/`.
- API endpoints for quizzes should be in `backend/app/api/quizzes/`.

### References

- [Source: docs/PRD.md]
- [Source: docs/epics.md#Epic-4:-Interactive-Quiz-Generation-&-Feedback]
- [Source: docs/architecture.md#Epic-to-Architecture-Mapping]
- [Source: docs/architecture.md#Technology-Stack-Details]
- [Source: docs/architecture.md#Implementation-Patterns]
- [Source: docs/architecture.md#Test-Strategy]

### Change Log

- **søndag 7. desember 2025**: Story drafted by SM agent.
- **søndag 7. desember 2025**: Validation report generated and referenced.
- **søndag 7. desember 2025**: Story context XML generated and story status updated to ready-for-dev.

## Dev Agent Record

### Context Reference
- [Story Context XML](4-1-ai-quiz-generation-integration.context.xml)

### Agent Model Used

Gemini 2.5 Pro/Flash

### Validation Report

[Validation Report - 4-1-ai-quiz-generation-integration](validation-report-4-1-ai-quiz-generation-integration-20251207.md)

### Debug Log References

### Completion Notes List

### File List