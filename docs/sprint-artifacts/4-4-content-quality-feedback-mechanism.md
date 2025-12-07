# Story 4.4: Content Quality Feedback Mechanism

Status: done

## Story

As a user,
I want to provide feedback on the quality of AI-generated summaries and quizzes,
so that the system can continuously improve.

## Acceptance Criteria

1.  **Given** I am viewing a generated summary or quiz, **When** I click a "Rate this" or "Report Issue" button, **Then** a simple feedback form appears (e.g., 1-5 stars, free text comment).
2.  My feedback is securely recorded.

## Tasks / Subtasks

- [x] Task 1 (AC: #1, #2) - Backend for Feedback Submission
  - [x] Subtask 1.1 - Create a new Supabase table to store feedback (e.g., `feedback` table with columns for `content_id`, `content_type`, `user_id`, `rating`, `comment`).
  - [x] Subtask 1.2 - Implement RLS policies for the `feedback` table.
  - [x] Subtask 1.3 - Create a FastAPI endpoint to receive and store feedback submissions.
- [x] Task 2 (AC: #1) - Frontend for Feedback Collection
  - [x] Subtask 2.1 - Design and implement a feedback component (e.g., a modal or inline form) with star rating and comment field.
  - [x] Subtask 2.2 - Integrate the feedback component into the summary and quiz results views.
  - [x] Subtask 2.3 - Implement the client-side logic to submit the feedback to the backend API.

## Dev Notes

- Create a new `Feedback` model in `backend/app/db/models.py`
- Create Pydantic schemas in `backend/app/schemas/feedback.py`
- Create API endpoint in `backend/app/api/feedback/` or extend existing endpoints
- Frontend component should be placed in `frontend/src/components/feedback/`
- Use star rating (1-5) for quick feedback and optional text comment
- Sanitize user input to prevent XSS attacks
- Apply RLS policies to ensure users can only see their own feedback

### Project Structure Notes

- **Backend:**
  - New model: `backend/app/db/models.py` - `Feedback`
  - New schema: `backend/app/schemas/feedback.py`
  - New endpoint: `backend/app/api/feedback/main.py`
  - New migration: `backend/migrations/create_feedback_table.sql`
- **Frontend:**
  - New component: `frontend/src/components/feedback/FeedbackButton.tsx`
  - New component: `frontend/src/components/feedback/FeedbackModal.tsx`
  - New service: `frontend/src/services/feedback.ts`

### References

- [Source: docs/epics.md#epic-4-interactive-quiz-generation-feedback]
- [Source: docs/PRD.md#fr-ila-2]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-4-content-quality-feedback-mechanism.context.xml

### Agent Model Used

Claude Opus 4.5 (Preview)

### Debug Log References

### Completion Notes List

- Implemented complete feedback system for rating summaries and quizzes
- Backend: POST /api/v1/feedback, GET /api/v1/feedback/{content_type}/{content_id}
- Frontend: StarRating, FeedbackButton, FeedbackModal components
- 12 backend tests, 25 frontend tests all passing
- XSS sanitization applied to user comments
- Duplicate feedback prevention for authenticated users
- Migration SQL ready for Supabase (needs to be run manually)

### File List

- backend/migrations/create_feedback_table.sql (NEW)
- backend/app/db/models.py (MODIFIED - added Feedback model)
- backend/app/schemas/feedback.py (NEW)
- backend/app/api/feedback/__init__.py (NEW)
- backend/app/api/feedback/main.py (NEW)
- backend/app/api/summaries/main.py (MODIFIED - added summary_id to response)
- backend/app/main.py (MODIFIED - registered feedback router)
- backend/tests/test_feedback.py (NEW)
- frontend/src/services/feedback.ts (NEW)
- frontend/src/components/feedback/index.ts (NEW)
- frontend/src/components/feedback/StarRating.tsx (NEW)
- frontend/src/components/feedback/FeedbackButton.tsx (NEW)
- frontend/src/components/feedback/FeedbackModal.tsx (NEW)
- frontend/src/lib/store.ts (MODIFIED - added summaryId to SummaryData)
- frontend/src/app/summaries/[document_id]/page.tsx (MODIFIED - added FeedbackButton)
- frontend/src/app/quizzes/[quiz_id]/page.tsx (MODIFIED - added session, passed accessToken to ResultsView)
- frontend/src/components/quiz/ResultsView.tsx (MODIFIED - added FeedbackButton)
- frontend/__tests__/services/feedback.test.ts (NEW)
- frontend/__tests__/feedback/StarRating.test.tsx (NEW)
- frontend/__tests__/feedback/FeedbackButton.test.tsx (NEW)
