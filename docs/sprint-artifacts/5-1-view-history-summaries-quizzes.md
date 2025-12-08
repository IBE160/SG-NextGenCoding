# Story 5.1: View History of Summaries and Quizzes
Status: ready-for-dev

## Story

As a logged-in user,
I want to see a list of my past summaries and quizzes,
so that I can easily access and review my previous learning materials.

## Acceptance Criteria

1.  **Given** I am logged in,
    **When** I navigate to my "History" or "Dashboard" section,
    **Then** I see a chronological list of my generated summaries and quizzes.
2.  **Given** a chronological list of summaries and quizzes is displayed,
    **When** viewing each item in the list,
    **Then** it shows basic details (e.g., date, document title, type).
3.  **Given** a chronological list of summaries and quizzes is displayed,
    **When** I click on an item,
    **Then** I can view its full content.

## Tasks / Subtasks

- [ ] **Task 1: Implement Backend API Endpoint for History Retrieval**
    - [ ] Subtask 1.1: Define Pydantic models for `SummaryHistoryItem` and `QuizHistoryItem` in `backend/app/schemas/history.py`.
    - [ ] Subtask 1.2: Create FastAPI router `backend/app/api/history.py`.
    - [ ] Subtask 1.3: Implement GET /api/v1/history/summaries endpoint to fetch summaries for authenticated user from Supabase.
    - [ ] Subtask 1.4: Implement GET /api/v1/history/quizzes endpoint to fetch quizzes for authenticated user from Supabase.
    - [ ] Subtask 1.5: Implement Supabase queries in `backend/app/db/` to retrieve chronological lists of summaries and quizzes filtered by `user_id`.
    - [ ] Subtask 1.6: Add unit tests for history API endpoints using `pytest`.

- [ ] **Task 2: Develop Frontend History/Dashboard UI**
    - [ ] Subtask 2.1: Create `frontend/src/app/history/` directory and page component.
    - [ ] Subtask 2.2: Integrate API calls to GET /api/v1/history/summaries and GET /api/v1/history/quizzes using Axios.
    - [ ] Subtask 2.3: Design and implement UI components to display chronological list of summaries and quizzes.
    - [ ] Subtask 2.4: Display basic details (date, document title, type) for each item.
    - [ ] Subtask 2.5: Implement clickable items to navigate to full content view (linking to existing summary/quiz view pages or placeholders).
    - [ ] Subtask 2.6: Implement loading states and error handling for API calls.
    - [ ] Subtask 2.7: Add frontend unit tests for history components using Jest and React Testing Library.

- [ ] **Task 3: Ensure Data Persistence and RLS**
    - [ ] Subtask 3.1: Verify Supabase summaries and quizzes tables have user_id column and appropriate RLS policies configured to restrict access to owner. (FR-DM-1)
    - [ ] Subtask 3.2: Confirm documents table also has user_id and RLS. (FR-DM-1)

- [ ] **Task 4: Integration and E2E Testing**
    - [ ] Subtask 4.1: Conduct integration tests to ensure data flow from frontend history UI to backend API and Supabase is correct.
    - [ ] Subtask 4.2: Develop E2E test to simulate a logged-in user navigating to history, viewing the list, and clicking an item.

## Dev Notes

- Relevant architecture patterns and constraints:
    - Frontend: Next.js, TypeScript, React, Tailwind CSS, Shadcn UI
    - Backend: FastAPI (Python), Pydantic
    - Database & Auth: Supabase (PostgreSQL), Supabase Auth
    - API Client (Frontend): Axios
    - Frontend State Management: Zustand
- Source tree components to touch:
    - Frontend: `frontend/src/app/dashboard/`, `frontend/src/app/history/`, `frontend/src/components/`
    - Backend: `backend/app/api/history/`, `backend/app/db/`
- Testing standards summary:
    - Unit Tests (frontend Jest, backend Pytest)
    - Integration Tests
    - End-to-End (E2E) Tests

## References

- [PRD](../PRD.md)
- [Architecture](../architecture.md)
- [Epic Breakdown](../epics.md)
- [Epic Technical Specification: History, Review & Advanced UI](tech-spec-epic-5.md)

## Change Log

- **2025-12-08**: Story drafted.
## Dev Agent Record

### Context Reference
- C:\git\SG-NextGenCoding\docs\sprint-artifacts\5-1-view-history-summaries-quizzes.context.xml
