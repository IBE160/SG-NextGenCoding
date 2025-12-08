# Epic Technical Specification: History, Review & Advanced UI

Date: mandag 8. desember 2025
Author: BIP
Epic ID: 5
Status: Draft

---

## Overview

Epic 5 focuses on enabling logged-in users to efficiently review their past learning activities, such as generated summaries and quiz results, and significantly enhancing the overall user experience and accessibility of the application. This directly addresses the PRD's requirement for data persistence (FR-DM-1) by making historical data accessible and aligns with the broader goal of making learning more efficient and engaging through review and self-assessment.

## Objectives and Scope

**Objectives:**
*   To provide users with a clear and intuitive interface to access their historical summaries and quiz attempts.
*   To enable users to review detailed past quiz results, including their answers and correct answers.
*   To ensure the entire application achieves full WCAG 2.1 AA compliance, making it accessible to users with disabilities.
*   To implement advanced UI interactions and polish the application for a professional and delightful user experience.

**In-Scope:**
*   Implementation of a user dashboard or history section to list past summaries and quizzes.
*   Development of detailed views for past quiz attempts, showing questions, user answers, and correct answers.
*   Conducting a comprehensive WCAG 2.1 AA compliance audit and subsequent remediation of identified issues.
*   Refinement of UI elements, animations, and transitions for enhanced polish and responsiveness.
*   Integration with existing data persistence mechanisms (Supabase) for retrieving historical user data.

**Out-of-Scope (from PRD):**
*   AI-Generated Feedback on quiz performance.
*   Difficulty settings for quizzes.
*   Alternative quiz options or question formats beyond the MVP.
*   "Class Feature" or "Study Group Feature" for multi-user collaboration.

## System Architecture Alignment

Epic 5 primarily aligns with the frontend and backend components responsible for data retrieval and user interface presentation. Key architectural components involved include:

*   **Frontend**: `frontend/src/app/dashboard/` and `frontend/src/app/history/` for dedicated history views, and `frontend/src/components/` for reusable UI elements. The `frontend/src/app/` elements will also be heavily impacted by WCAG compliance efforts.
*   **Backend**: `backend/app/api/history/` for exposing endpoints to fetch historical data, and `backend/app/db/` for interacting with the Supabase PostgreSQL database to retrieve persisted summaries, quizzes, and results.
*   **Data Persistence**: Leveraging Supabase (PostgreSQL) as the primary data store for all user-generated content and quiz results, ensuring that historical data is securely stored and retrievable.

This epic focuses on assembling and presenting existing data in new ways and refining the user-facing layers, rather than introducing significant new data models or core AI integrations. The emphasis on WCAG compliance will drive improvements across all frontend components.

## Detailed Design

### Services and Modules

**Frontend Modules:**
*   **`frontend/src/app/dashboard/`**: The main entry point for logged-in users (existing), to be enhanced with an overview of recent activities and navigation to history.
*   **`frontend/src/app/history/`**: New directory to be created; will contain components and pages dedicated to listing and filtering historical summaries and quizzes, with detailed views for each.
*   **`frontend/src/components/`**: Reusable UI components across the application, which will be audited and refactored for WCAG 2.1 AA compliance and advanced UI interactions.
*   **`frontend/src/lib/supabase/`**: Client-side Supabase interactions for data retrieval.

**Backend Modules:**
*   **`backend/app/api/history/`**: New API router to be created; will handle requests for user-specific historical data (summaries, quizzes, quiz results).
*   **`backend/app/db/`**: Contains the SQLAlchemy/SQLModel definitions and CRUD operations for interacting with the `summaries`, `quizzes`, `questions`, and `user_answers` tables in the PostgreSQL database (Supabase).
*   **`backend/app/schemas/`**: Pydantic models for request and response validation, defining the structure of historical data returned by the API.

### Data Models and Contracts

Epic 5 primarily leverages existing data models established in previous epics for content and user activity. The focus is on querying and presenting this data.

*   **`summaries` table**: Stores generated summaries.
    *   `id` (UUID)
    *   `user_id` (UUID, optional for guest users)
    *   `document_id` (UUID, FK to `documents` table)
    *   `summary_text` (TEXT)
    *   `generated_at` (TIMESTAMP)
    *   `ai_model` (TEXT, default: "gemini-1.5-flash")
    *   `feedback` (TEXT, optional)
*   **`quizzes` table**: Stores generated quizzes.
    *   `id` (UUID)
    *   `user_id` (UUID, optional for guest users)
    *   `document_id` (UUID, FK to `documents` table)
    *   `title` (TEXT)
    *   `status` (TEXT: "generating", "ready", "failed")
    *   `total_questions` (INTEGER)
    *   `ai_model` (TEXT, default: "gemini-2.5-flash")
    *   `created_at` (TIMESTAMP)
    *   `updated_at` (TIMESTAMP)
*   **`questions` table**: Stores individual quiz questions.
    *   `id` (UUID)
    *   `quiz_id` (UUID, FK to `quizzes` table)
    *   `question_type` (TEXT: "multiple_choice", "true_false", "short_answer")
    *   `question_text` (TEXT)
    *   `options` (TEXT, JSON string for multiple choice)
    *   `correct_answer` (TEXT)
    *   `explanation` (TEXT, optional)
    *   `order_index` (INTEGER)
    *   `created_at` (TIMESTAMP)
*   **`user_answers` table**: Stores user's individual quiz answers.
    *   `id` (UUID)
    *   `quiz_id` (UUID, FK to `quizzes` table)
    *   `question_id` (UUID, FK to `questions` table)
    *   `user_id` (UUID, optional for guest users)
    *   `user_answer` (TEXT)
    *   `is_correct` (BOOLEAN)
    *   `answered_at` (TIMESTAMP)

**Frontend Data Contracts (TypeScript interfaces corresponding to Pydantic schemas):**
*   `SummaryHistoryItem`, `QuizHistoryItem`, `QuizResultsResponse`, `AnswerResult`.

### APIs and Interfaces

**Backend API (FastAPI - `backend/app/api/history/`):**
*   **`GET /api/v1/history/summaries`**
    *   **Description**: Retrieves a chronological list of summaries generated by the authenticated user.
    *   **Authentication**: Required (JWT).
    *   **Response**: `200 OK` with `List[SummaryHistoryItem]`.
    *   **Error Codes**: `401 Unauthorized`.
*   **`GET /api/v1/history/quizzes`**
    *   **Description**: Retrieves a chronological list of quizzes generated by the authenticated user.
    *   **Authentication**: Required (JWT).
    *   **Response**: `200 OK` with `List[QuizHistoryItem]`.
    *   **Error Codes**: `401 Unauthorized`.
*   **`GET /api/v1/history/quizzes/{quiz_id}/results`**
    *   **Description**: Retrieves detailed results for a specific quiz attempt by the authenticated user, including questions, user answers, and correct answers.
    *   **Authentication**: Required (JWT).
    *   **Parameters**: `{quiz_id}` (UUID).
    *   **Response**: `200 OK` with `QuizResultsResponse` (includes `quiz_id`, `score`, `total`, `percentage`, `results: List[AnswerResult]`).
    *   **Error Codes**: `401 Unauthorized`, `404 Not Found` (if quiz_id not found or not owned by user).

**Frontend API Communication (Axios with interceptors):**
*   The frontend `services` layer will encapsulate calls to these backend endpoints, handling authentication headers and error responses.

### Workflows and Sequencing

1.  **User Accesses History:**
    *   User logs in and navigates to the "History" or "Dashboard" section.
    *   **Frontend**: Dispatches concurrent `GET` requests to `/api/v1/history/summaries` and `/api/v1/history/quizzes`. Displays loading indicators.
    *   **Backend**: Authenticates requests, queries the `summaries` and `quizzes` tables in Supabase, filtered by `user_id` from the JWT. Applies RLS.
    *   **Backend**: Returns serialized lists of summaries and quizzes.
    *   **Frontend**: Renders a combined, chronological list of past activities, each with basic metadata (date, type, title).

2.  **User Reviews a Summary:**
    *   User clicks on a summary item in the history list.
    *   **Frontend**: Navigates to a dedicated summary view, displaying the full content (already fetched or re-fetched if necessary).

3.  **User Reviews a Quiz Attempt:**
    *   User clicks on a quiz item in the history list.
    *   **Frontend**: Dispatches a `GET` request to `/api/v1/history/quizzes/{quiz_id}/results`. Displays loading indicators.
    *   **Backend**: Authenticates request, queries the `user_answers` table (joined with `questions` and `quizzes` tables for question details) in Supabase, filtered by `quiz_id` and `user_id`. Applies RLS.
    *   **Backend**: Returns detailed quiz results, including original questions, user's submitted answers, and correct answers.
    *   **Frontend**: Renders an interactive quiz review interface, highlighting correct/incorrect answers and the overall score for that attempt.

4.  **WCAG 2.1 AA Compliance & UI Polish:**
    *   This is an overarching, continuous effort integrated throughout all frontend development tasks in this epic.
    *   **Development Cycle**: Implement features -> perform accessibility checks (automated and manual) -> remediate issues -> refine UI for polish (animations, micro-interactions, responsive adjustments).
    *   **Tools**: Utilize browser developer tools, accessibility audit tools (e.g., Lighthouse, axe DevTools), and keyboard navigation testing.
    *   **Impact**: Affects all UI components within `frontend/src/components/` and page layouts in `frontend/src/app/`.

## Non-Functional Requirements

### Performance

*   **UI Responsiveness**: The frontend must render history lists and quiz review screens efficiently, aiming for initial load times of less than 2-3 seconds for a typical user with a moderate amount of historical data. UI interactions (filtering, navigation) should feel fluid and responsive.
*   **API Latency**: Backend API endpoints for history retrieval (e.g., `/api/v1/history/summaries`, `/api/v1/history/quizzes/{quiz_id}/results`) should respond within 500ms under normal load, excluding database query time. Optimized database queries and efficient data serialization will be critical.
*   **WCAG Impact**: Performance will be monitored closely after WCAG remediations, as certain accessibility features or DOM manipulations could introduce overhead. Performance budgets will be maintained.

### Security

*   **Authentication & Authorization**: Strict adherence to Supabase Row Level Security (RLS) policies is paramount to ensure that users can only access their own historical summaries, quizzes, and quiz attempt data (PRD: FR-DM-1, Architecture: Security Architecture). Backend API endpoints will enforce JWT-based authentication.
*   **Data Handling**: All stored historical user content (summaries, quiz questions, answers) must continue to be treated as sensitive data, complying with GDPR, FERPA, and COPPA regulations (PRD: Domain Context, Domain-Specific Requirements). No sensitive user data will be exposed in frontend URLs or client-side logs.
*   **Input Validation**: While primarily a display epic, any new user inputs (e.g., for filtering/searching history) will undergo rigorous backend validation to prevent injection attacks.

### Reliability/Availability

*   **High Availability**: The history and review features must remain highly available, as they represent core value for returning users. Standard deployment and monitoring practices will be followed to ensure uptime.
*   **Data Integrity**: Data fetched for historical display must maintain integrity, accurately reflecting what was originally generated and stored.
*   **Error Handling**: Robust error handling will be implemented for all frontend-backend communication. User-friendly messages will be displayed if historical data cannot be retrieved due to API errors or network issues.

### Observability

*   **Logging**: Detailed, contextual logs will be generated by the backend for all history API endpoint calls (requests, responses, errors) to aid in debugging and operational monitoring.
*   **Metrics**: Key performance metrics (latency, throughput, error rates) for all history-related API endpoints will be collected and monitored.
*   **Tracing**: Distributed tracing (if implemented for the overall system) will include history API calls to help identify performance bottlenecks and understand data flow through the system.
*   **Accessibility Monitoring**: Automated accessibility checks will be integrated into the CI/CD pipeline, and results will be part of the overall observability picture.

## Dependencies and Integrations

Epic 5 primarily integrates with existing components, utilizing the established technology stack to retrieve and display historical user data and enhance the UI.

**Frontend Dependencies (from `frontend/package.json`):**
*   **Core Frameworks**: `next` (^16.0.7), `react` (`18.2.0`), `react-dom` (`18.2.0`), `typescript` (`5.1.3`)
*   **Styling & UI**: `tailwindcss` (`3.3.3`), `next-themes` (`^0.4.6`), `shadcn/ui` components (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.), `lucide-react` (`^0.304.0`), `tailwind-merge` (`^2.2.0`), `clsx` (`^2.1.0`)
*   **State Management**: `zustand` (`5.0.8`)
*   **Form Handling**: `react-hook-form` (`^7.67.0`), `@hookform/resolvers` (`^5.2.2`), `zod` (`^4.1.13`)
*   **API Client**: `axios` (`^1.6.5`)
*   **Supabase Integration**: `@supabase/ssr` (`^0.1.0`), `@supabase/supabase-js` (`^2.39.3`)
*   **Utilities**: `uuid` (`^13.0.0`), `react-copy-to-clipboard` (`^5.1.0`), `react-markdown` (`^9.1.0`)
*   **Development**: `jest`, `eslint`, `prettier`, `husky`, `lint-staged`

**Backend Dependencies (from `backend/pyproject.toml`):**
*   **Core Framework**: `fastapi` (`^0.122.0`), `uvicorn` (`^0.38.0`)
*   **Database & ORM**: `supabase` (`^2.24.0`), `sqlmodel` (`^0.0.27`), `sqlalchemy` (`^2.0.44`), `psycopg2-binary` (`^2.9.11`), `asyncpg` (`^0.31.0`)
*   **Authentication**: `gotrue` (`^2.11.3`)
*   **Environment**: `python-dotenv` (`^1.2.1`), `pydantic-settings` (`^2.12.0`)
*   **File Processing**: `pypdf` (`^6.4.0`), `python-docx` (`^1.2.0`), `python-multipart` (`^0.0.20`)
*   **AI Integration**: `google-generativeai` (`^0.7.1`), `tenacity` (`^8.5.0`)
*   **Development/Testing**: `pytest`, `httpx`, `pytest-asyncio`, `aiosqlite`

**Integration Points:**
*   **Frontend to Backend**: RESTful API calls for fetching historical data and quiz results via Axios.
*   **Backend to Supabase**: Supabase client library (`supabase-py`) for database operations (queries for summaries, quizzes, questions, user_answers) and user authentication (`gotrue`).
*   **User Authentication**: Supabase Auth provides secure JWT-based authentication, which is leveraged by both frontend and backend to authorize access to user-specific historical data.
*   **UI Component Libraries**: Shadcn UI provides pre-built, accessible components for the frontend, which will be crucial for meeting WCAG compliance goals.
*   **Version Control**: `git` and `GitHub Actions` for CI/CD as defined in the Architecture.

## Acceptance Criteria (Authoritative)

1.  As a logged-in user, when navigating to the "History" or "Dashboard" section, I can view a chronological list of my generated summaries and quizzes, with basic details (e.g., date, document title, type) for each, and the ability to click on an item to view its full content.
2.  As a logged-in user, when selecting a past quiz attempt from my history, I can review the questions, my submitted answers, the correct answers, and clearly see my score for that specific attempt.
3.  The application, upon completion of an accessibility audit against WCAG 2.1 AA guidelines, must identify and remediate all critical accessibility issues, ensuring full keyboard navigation and usability with assistive technologies across all functionalities within this epic's scope.
4.  The application must exhibit smooth UI animations, seamless transitions between views, resolved minor UI inconsistencies, and provide clear, consistent visual feedback for all user actions, contributing to a professional and delightful user experience.

## Traceability Mapping

| Acceptance Criteria (AC)                                                                      | Spec Section(s)                                   | Component(s)/API(s)                                                                     | Test Idea                                                                                             |
| :-------------------------------------------------------------------------------------------- | :------------------------------------------------ | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1. Display chronological list of summaries/quizzes with details and full content access.      | FR-DM-1, Workflows and Sequencing                 | `frontend/src/app/history/`, `backend/app/api/history/summaries`, `backend/app/api/history/quizzes`, `Supabase` | E2E Test: User logs in, navigates to history, verifies chronological list content, clicks to view full content. |
| 2. Display detailed past quiz results (questions, user answers, correct answers, score).      | FR-DM-1, Workflows and Sequencing                 | `frontend/src/app/history/`, `backend/app/api/history/quizzes/{quiz_id}/results`, `Supabase` | E2E Test: User completes a quiz, navigates to history, reviews quiz results, verifies accuracy of presented data. |
| 3. Pass WCAG 2.1 AA accessibility audit; critical issues remediated; full keyboard usability. | FR-UI-1, Non-Functional: Accessibility           | `frontend/src/components/`, `frontend/src/app/`, all UI elements, `tailwind-merge`, `clsx` | Manual Accessibility Audit (screen reader, keyboard navigation), automated accessibility scans (Lighthouse, Axe). |
| 4. Exhibit smooth UI animations, seamless transitions, and clear visual feedback.             | FR-UI-1, Detailed Design: UI Interactions & Polish | `frontend/src/components/`, `frontend/src/app/`                                         | Manual UI/UX review, performance testing for UI animations, responsiveness checks across devices.    |

## Risks, Assumptions, Open Questions

*   **Risk**: **WCAG 2.1 AA Compliance Complexity**: Achieving full WCAG 2.1 AA compliance across the entire application, especially with advanced UI interactions, can be significantly more complex and time-consuming than anticipated.
    *   **Mitigation**: Prioritize remediation of critical accessibility issues early in the development cycle. Integrate automated accessibility checks into the CI/CD pipeline. Conduct regular manual audits involving accessibility specialists or tools (e.g., screen readers, keyboard navigation). Allocate dedicated time in sprint planning for accessibility tasks.
*   **Risk**: **Performance Degradation**: Retrieving and displaying extensive historical data, or implementing overly complex UI animations for polish, could lead to performance degradation, impacting user experience.
    *   **Mitigation**: Implement pagination or infinite scrolling for history lists. Optimize database queries for historical data retrieval. Profile frontend rendering performance to identify and optimize bottlenecks. Utilize efficient UI animation libraries and techniques.
*   **Assumption**: **Data Model Sufficiency**: It is assumed that the existing `summaries`, `quizzes`, `questions`, and `user_answers` data models in Supabase are sufficient to capture all necessary information for display in the history and review sections without requiring significant schema alterations within this epic.
    *   **Next Step**: Verify data model completeness against display requirements during initial story grooming.
*   **Open Question**: **Scope of "Advanced UI Interactions & Polish"**: The specific details and extent of "advanced UI interactions" and "polish" (Story 5.4) need further clarification from UX/Product to define clear acceptance criteria and estimate effort accurately.
    *   **Next Step**: Detailed discussion with UX/Product during sprint planning for Story 5.4.

## Test Strategy Summary

The testing strategy for Epic 5 will encompass a multi-faceted approach to ensure functional correctness, accessibility, and performance.

*   **Unit Tests**:
    *   **Frontend**: Focus on individual React components within `frontend/src/app/history/`, `frontend/src/app/dashboard/`, and `frontend/src/components/`. This includes testing rendering of historical items, state management for filters/pagination, and basic UI interactions. Also, unit test utility functions for data formatting.
    *   **Backend**: Cover new API endpoints in `backend/app/api/history/` to ensure correct data retrieval logic from the database and proper serialization/deserialization of responses. Test database query functions in `backend/app/db/` for fetching historical `summaries`, `quizzes`, `questions`, and `user_answers`.
*   **Integration Tests**:
    *   Verify the seamless data flow between the frontend (Axios calls), backend (FastAPI endpoints), and Supabase database. Ensure that the backend correctly fetches data and the frontend accurately displays it.
*   **End-to-End (E2E) Tests**:
    *   **History View**: Simulate user login, navigation to the "History" section, and verification that the chronological list of summaries and quizzes is displayed correctly with accurate basic details.
    *   **Summary Review**: Test clicking on a summary item and verifying that the full summary content is displayed.
    *   **Quiz Review**: Simulate clicking on a past quiz attempt, verifying that the detailed quiz review interface loads, showing questions, user's answers, correct answers, and the score.
    *   **Basic Accessibility**: Include E2E tests for fundamental keyboard navigation and focus management within the history and review sections.
*   **Accessibility Testing (Critical for Story 5.3)**:
    *   **Automated Scans**: Integrate automated accessibility testing tools (e.g., Axe-core) into the CI/CD pipeline to scan rendered HTML for common accessibility violations.
    *   **Manual Audits**: Conduct thorough manual audits with screen readers (e.g., NVDA, VoiceOver), keyboard-only navigation, and color contrast checkers by team members or external specialists.
    *   **User Acceptance Testing (UAT)**: If feasible, involve users with disabilities to gather direct feedback on usability.
*   **Performance Testing**:
    *   Monitor frontend rendering performance (e.g., FPS, TTI) for complex history lists and animated UI elements.
    *   Track backend API response times for history retrieval endpoints under various data loads.
*   **Frameworks**: Jest for frontend unit tests, Pytest for backend unit/integration tests. E2E tests could utilize Cypress or Playwright (depending on project's choice).
