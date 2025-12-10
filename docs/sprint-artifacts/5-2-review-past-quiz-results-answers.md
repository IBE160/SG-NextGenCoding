# Story 5.2: Review Past Quiz Results and Answers
Status: ready-for-dev

## Story

As a logged-in user,
I want to review my past quiz attempts, including my answers and the correct answers,
so that I can identify areas where I need to improve.

## Acceptance Criteria

1.  **Given** I am viewing a past quiz from my history,
    **When** I select a quiz attempt,
    **Then** I see the questions, my submitted answers, and the correct answers.
2.  **Given** I am viewing a past quiz from my history,
    **When** I select a quiz attempt,
    **Then** my score for that attempt is clearly visible.

## Tasks / Subtasks

- [ ] **Task 1: Backend - Create Endpoint for Detailed Quiz Results** (AC: #1, #2)
    - [ ] Subtask 1.1: In `backend/app/schemas/history.py`, define Pydantic models for the detailed quiz review response, including quiz info, questions, user's answers from `user_answers` table, and correct answers.
    - [ ] Subtask 1.2: In `backend/app/api/history.py`, create a new GET endpoint `/api/v1/history/quizzes/{quiz_id}` for detailed quiz results.
    - [ ] Subtask 1.3: Query the `quizzes`, `questions`, and `user_answers` tables to fetch the quiz details with user's past answers, ensuring it's filtered by the authenticated `user_id`.
    - [ ] Subtask 1.4: Write `pytest` unit tests for the new endpoint, covering success cases, not found errors, and authorization failures.

- [ ] **Task 2: Frontend - Develop Quiz Review UI** (AC: #1, #2)
    - [ ] Subtask 2.1: Create a new page component `frontend/src/app/history/quiz/[quiz_id]/page.tsx` to display the detailed quiz review.
    - [ ] Subtask 2.2: In `frontend/src/services/history.ts`, add an API call function to fetch data from the new `/api/v1/history/quizzes/{quiz_id}` endpoint.
    - [ ] Subtask 2.3: Design and build UI components using Shadcn UI to clearly display the quiz score, each question, the user's answer, and the correct answer. Indicate visually which answers were correct and incorrect.
    - [ ] Subtask 2.4: Add loading and error states to the UI for the API call.
    - [ ] Subtask 2.5: Write Jest/React Testing Library tests for the quiz review components.

- [ ] **Task 3: Integration and Verification**
    - [ ] Subtask 3.1: Verify the RLS policy on the `user_answers` table correctly prevents users from accessing answers that are not their own.
    - [ ] Subtask 3.2: Create an E2E test that simulates a user logging in, navigating to the history page, clicking on a past quiz, and verifying the detailed results are displayed correctly.

## Dev Notes

- **Relevant architecture patterns and constraints**:
    - The backend API should be a RESTful service using FastAPI and Pydantic for data validation. [Source: docs/architecture.md#API-Pattern]
    - The database is Supabase (PostgreSQL). Direct data access from the backend should use the `supabase-py` client library. [Source: docs/architecture.md#Data-Architecture]
    - The frontend will be a Next.js application using TypeScript, with API calls handled by an Axios client. [Source: docs/architecture.md#Technology-Stack-Details]
    - All data access must be protected by Supabase Row Level Security (RLS) to ensure users can only view their own data. [Source: docs/architecture.md#Security-Architecture]
- **Source tree components to touch**:
    - `backend/app/api/history/`: To add the new endpoint for detailed quiz results.
    - `backend/app/db/`: For the database query logic.
    - `backend/app/schemas/`: To define the response model for detailed quiz results.
    - `frontend/src/app/history/`: For the UI to display the quiz review.
    - `frontend/src/components/`: For any new reusable components for the quiz review.
- **Testing standards summary**:
    - Unit tests are required for the new backend endpoint (`pytest`).
    - Unit tests are required for new frontend components (`jest`).
    - An integration test should verify the frontend correctly displays data from the backend.
    - An E2E test should cover the user flow from logging in to viewing a past quiz result. [Source: docs/PRD.md#Test-Strategy]

### Project Structure Notes

- The planned implementation aligns with the project structure defined in `docs/architecture.md`.
- No new services or major structural changes are anticipated for this story.
- **Story 5.1 Implementation Reference**: The history API and pages were implemented in Story 5.1:
  - Backend: `backend/app/api/history.py` - Contains existing `/history/summaries`, `/history/quizzes`, and `/history` endpoints
  - Backend: `backend/app/schemas/history.py` - Pydantic schemas for history responses
  - Frontend: `frontend/src/app/history/page.tsx` - History list page (currently links to `/quizzes/{quiz_id}`)
  - Frontend: `frontend/src/services/history.ts` - API client functions
- **Database Models**: Use `Quiz`, `Question`, and `UserAnswer` tables (not "quiz_attempts"):
  - `Quiz` table: quiz metadata (id, document_id, user_id, title, status, total_questions)
  - `Question` table: quiz questions with correct_answer and explanation
  - `UserAnswer` table: user's submitted answers with is_correct flag
- **Update History Page**: After implementing the quiz review page at `/history/quiz/[quiz_id]`, update the history page links to use the new review page URL

### References

- [PRD](../../PRD.md)
- [Architecture](../../architecture.md)
- [Epics](../../epics.md)

## Change Log

- **2025-12-08**: Story drafted.
- **2025-12-08**: Story reviewed for dev readiness:
  - Fixed terminology: "quiz_attempt_id" → "quiz_id" (matches actual database model)
  - Updated table references: "quiz attempts table" → "user_answers table"
  - Fixed frontend page path: `[id]` → `[quiz_id]` for consistency
  - Added references to Story 5.1 implementation (history API, schemas, pages)
  - Added database model clarifications (Quiz, Question, UserAnswer tables)
  - Added code artifact references for existing quiz components

## Dev Agent Record

### Context Reference
- `docs/sprint-artifacts/5-2-review-past-quiz-results-answers.context.xml`

### Agent Model Used

Gemini-CLI-Agent

### Debug Log References
*N/A*

### Completion Notes List
*N/A*

### File List
*N/A*
