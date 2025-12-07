# Epic Technical Specification: Interactive Quiz Generation & Feedback

Date: 2025-12-07
Author: BIP
Epic ID: 4
Status: Draft

---

## Overview

This epic focuses on providing users with interactive AI-generated quizzes based on their uploaded lecture notes, directly fulfilling a core product requirement [FR-ILA-1]. It allows users to actively test their understanding of the material, shifting them from passive review to active learning. The epic also incorporates the implementation of a feedback mechanism [FR-ILA-2] for users to report on the quality of AI-generated content, creating a valuable data loop for future system improvements.

## Objectives and Scope

### In-Scope
- **AI Quiz Generation:** Integration with Gemini 2.5 to generate quiz questions (Multiple-Choice, True/False, Short Answer) and correct answers from the text content of uploaded documents.
- **Interactive Quiz UI:** Development of a user interface that presents questions, allows users to select/input answers, and navigate the quiz.
- **Answer Submission & Results:** An endpoint to handle the submission of completed quizzes, compare user answers against the correct ones, and display a basic score.
- **Content Quality Feedback:** A simple UI mechanism (e.g., a "Rate this" or "Report Issue" button/form) for users to provide feedback on the quality of both AI-generated summaries and quizzes. The feedback will be stored for analysis.

### Out-of-Scope (for this Epic/MVP)
- **AI-Generated Answer Feedback:** Providing AI-driven explanations for why a quiz answer is correct or incorrect.
- **Variable Difficulty Settings:** Allowing users to select a difficulty level for the quiz.
- **Advanced Quiz Formats:** Any quiz types beyond multiple-choice, true/false, and short answer.
- **Configurable Question Count:** Allowing users to specify the number of questions to be generated.

## System Architecture Alignment

This epic aligns with the established architecture by extending existing services and adding new, domain-specific components.

- **Frontend (`frontend/`):**
    - New React components will be created under `frontend/src/app/quizzes/` to manage the interactive quiz-taking experience and the results display.
    - The `frontend/src/services/` layer will be updated with functions to fetch quizzes, submit answers, and post feedback.
    - A component for submitting feedback will be created and potentially reused for both summaries and quizzes.
- **Backend (`backend/`):**
    - The `backend/app/api/` will be extended with a new router, likely `backend/app/api/quizzes/`, containing endpoints for quiz generation (`POST /quizzes`), submission (`POST /quizzes/{quiz_id}/submit`), and feedback (`POST /feedback`).
    - The `backend/app/services/ai_generation/` service will be expanded with new prompt engineering logic specifically for generating questions and answers.
    - New Pydantic schemas in `backend/app/schemas/` will define the request/response models for quizzes and feedback.
    - New database models in `backend/app/db/` and CRUD functions in `backend/app/crud/` will be required to manage `quizzes`, `questions`, `answers`, and `feedback` data.
- **Database (`Supabase`):**
    - New tables will be created to store `quizzes` (linking to a document and user), `questions` (belonging to a quiz), `user_answers`, and `feedback`.
    - Row Level Security (RLS) policies will be strictly enforced to ensure users can only access and submit their own quiz data and feedback.

## Detailed Design

### Services and Modules

| Service/Module | Responsibilities | Inputs | Outputs | Owner (Team) |
|---|---|---|---|---|
| **Backend: `QuizService`** | Orchestrates quiz generation, submission, and grading. | Document ID, User ID | Quiz object, Quiz results | Backend |
| **Backend: `AIGenerationService`** | (Extended) Generates quiz questions and answers using Gemini 2.5. | Text content, prompt | Structured quiz data (JSON) | Backend |
| **Backend: `FeedbackService`** | Handles storage and retrieval of user feedback. | Feedback payload (content ID, rating, comment) | Stored feedback object | Backend |
| **Frontend: `QuizProvider`** | Manages state for the active quiz session (questions, user answers, current position). | Quiz object | Current question, user answers | Frontend |
| **Frontend: `QuizView`** | Renders the interactive quiz interface. | Quiz questions | User answer selections | Frontend |
| **Frontend: `ResultsView`** | Displays the user's score and a review of their answers. | Graded quiz results | N/A | Frontend |
| **Frontend: `FeedbackButton`** | A reusable component to trigger the feedback form/modal. | Content ID, Content type | Feedback submission event | Frontend |

### Data Models and Contracts

New database tables required in Supabase (PostgreSQL).

**`quizzes` Table:**
- `id`: UUID (Primary Key)
- `document_id`: UUID (Foreign Key to `documents` table)
- `user_id`: UUID (Foreign Key to `auth.users`)
- `created_at`: `timestamp with time zone`

**`questions` Table:**
- `id`: UUID (Primary Key)
- `quiz_id`: UUID (Foreign Key to `quizzes` table)
- `question_text`: TEXT
- `question_type`: VARCHAR (e.g., 'multiple-choice', 'true-false', 'short-answer')
- `options`: JSONB (for multiple-choice options)
- `correct_answer`: TEXT or JSONB

**`user_answers` Table:**
- `id`: UUID (Primary Key)
- `question_id`: UUID (Foreign Key to `questions` table)
- `user_id`: UUID (Foreign Key to `auth.users`)
- `selected_answer`: TEXT or JSONB
- `is_correct`: BOOLEAN
- `submitted_at`: `timestamp with time zone`

**`feedback` Table:**
- `id`: UUID (Primary Key)
- `content_id`: UUID (ID of the summary or quiz)
- `content_type`: VARCHAR ('summary' or 'quiz')
- `user_id`: UUID (Foreign Key to `auth.users`)
- `rating`: SMALLINT (e.g., 1-5)
- `comment`: TEXT
- `created_at`: `timestamp with time zone`

### APIs and Interfaces

All endpoints are protected and require JWT authentication.

**1. Generate Quiz**
- **Endpoint:** `POST /api/v1/quizzes`
- **Request Body:**
  ```json
  {
    "document_id": "uuid-of-the-document"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "data": {
      "id": "quiz-uuid",
      "questions": [
        {
          "id": "question-uuid",
          "question_text": "...",
          "question_type": "multiple-choice",
          "options": ["A", "B", "C"]
        }
        // ... more questions
      ]
    },
    "message": "Quiz generated successfully.",
    "status": "success"
  }
  ```
- **Error Responses:** `404 Not Found` (document not found), `500 Internal Server Error` (AI service failure).

**2. Submit Quiz**
- **Endpoint:** `POST /api/v1/quizzes/{quiz_id}/submit`
- **Request Body:**
  ```json
  {
    "answers": [
      {
        "question_id": "question-uuid-1",
        "selected_answer": "A"
      },
      {
        "question_id": "question-uuid-2",
        "selected_answer": "True"
      }
    ]
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "data": {
      "quiz_id": "quiz-uuid",
      "score": 1,
      "total": 2,
      "results": [
        { "question_id": "question-uuid-1", "is_correct": true, "correct_answer": "A" },
        { "question_id": "question-uuid-2", "is_correct": false, "correct_answer": "False" }
      ]
    },
    "message": "Quiz submitted successfully.",
    "status": "success"
  }
  ```

**3. Submit Feedback**
- **Endpoint:** `POST /api/v1/feedback`
- **Request Body:**
  ```json
  {
    "content_id": "uuid-of-summary-or-quiz",
    "content_type": "quiz",
    "rating": 5,
    "comment": "This quiz was very helpful!"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "data": { "feedback_id": "new-feedback-uuid" },
    "message": "Feedback submitted successfully.",
    "status": "success"
  }
  ```

### Workflows and Sequencing

**1. Quiz Generation Workflow (Async)**
1.  **User Action:** Clicks "Generate Quiz" button on the frontend for a specific document.
2.  **Frontend:** Makes a `POST` request to `/api/v1/quizzes` with the `document_id`. A loading state is displayed.
3.  **Backend:**
    a. The `QuizService` receives the request.
    b. It fetches the document's text content.
    c. It places a job in a background queue to call the `AIGenerationService`. This immediately returns a `202 Accepted` response or uses long polling/WebSockets to notify the user of completion.
    d. The `AIGenerationService` constructs a prompt for Gemini 2.5 and requests a quiz.
    e. Upon receiving the response from Gemini, it parses the questions and answers.
    f. The `QuizService` saves the quiz and its questions to the database.
4.  **Frontend:** Once the quiz is ready (e.g., via polling or WebSocket message), the UI transitions to the quiz-taking interface.

**2. Quiz Submission Workflow (Sync)**
1.  **User Action:** Clicks "Submit Quiz" after answering all questions.
2.  **Frontend:** Makes a `POST` request to `/api/v1/quizzes/{quiz_id}/submit` with all user answers.
3.  **Backend:**
    a. The `QuizService` receives the submission.
    b. It iterates through the user's answers, compares them to the correct answers stored in the database, and calculates the score.
    c. It saves the `user_answers` with `is_correct` flags.
    d. It returns the final score and results to the frontend.
4.  **Frontend:** Displays the results page to the user.

## Non-Functional Requirements

### Performance
- **P1:** AI quiz generation (end-to-end from user click to quiz ready) should complete within 30 seconds for a typical document (as per PRD [FR-ILA-1]). The backend process will be asynchronous to avoid blocking the UI.
- **P2:** Quiz submission and grading must be completed within 1 second.

### Security
- **S1:** All API endpoints for this epic must be protected, requiring a valid JWT from an authenticated user.
- **S2:** Supabase RLS policies must be implemented for the `quizzes`, `questions`, `user_answers`, and `feedback` tables to ensure users can only access and modify their own data.
- **S3:** All input from user comments in the feedback form must be sanitized before rendering to prevent XSS attacks.

### Reliability/Availability
- **R1:** If the external Gemini API is unavailable or returns an error, the backend service should fail gracefully and return a `503 Service Unavailable` error to the frontend, which should display a user-friendly message.
- **R2:** The system should implement a retry mechanism (e.g., exponential backoff) for transient errors when calling the Gemini API.

### Observability
- **O1:** The backend should log errors related to AI quiz generation, including API errors from Gemini, parsing failures, and database errors.
- **O2:** The backend should log the submission of feedback, capturing the content ID and rating for monitoring and analysis.

## Dependencies and Integrations

- **Google Gemini API:** External integration for all AI generation capabilities.
- **Supabase:**
    - **PostgreSQL:** For storing all new data models.
    - **Supabase Auth:** For user authentication and authorization.
- **Backend Frameworks/Libraries:**
    - `FastAPI`: For creating the API endpoints.
    - `Pydantic`: For request/response model validation.
    - `SQLModel`/`SQLAlchemy`: For database interactions.
    - `httpx` or `aiohttp`: For making asynchronous API calls to Gemini.
- **Frontend Frameworks/Libraries:**
    - `Next.js`/`React`: For building the UI components.
    - `Zustand`: For managing global quiz state.
    - `Axios`: For making API calls to the backend.
    - `React Hook Form` / `Zod`: For validating the feedback submission form.

## Acceptance Criteria (Authoritative)

Derived from stories 4.1, 4.2, 4.3, and 4.4.

- **AC1 (Story 4.1):** Given a document's text content, the system can make a call to the Gemini API with a specifically engineered prompt to generate a set of quiz questions (including multiple-choice, true/false, short-answer types) and their corresponding correct answers.
- **AC2 (Story 4.1):** The generated quiz and questions are successfully saved to the database, linked to the source document and the user.
- **AC3 (Story 4.2):** The frontend can fetch a generated quiz and display the questions one at a time in a clean, interactive interface.
- **AC4 (Story 4.2):** The user can select an option for multiple-choice questions, toggle a selection for true/false questions, and type an answer for short-answer questions.
- **AC5 (Story 4.2):** The user can navigate between questions (next/previous) before submitting.
- **AC6 (Story 4.3):** Upon submission, the user's answers are sent to the backend and validated against the correct answers.
- **AC7 (Story 4.3):** The user's score (e.g., "2 out of 5 correct") is displayed on a results screen.
- **AC8 (Story 4.3):** The results screen allows the user to review which specific questions they answered correctly or incorrectly.
- **AC9 (Story 4.4):** A "Rate this" or "Report Issue" button is visible on both the summary and quiz results pages.
- **AC10 (Story 4.4):** Clicking the feedback button opens a form where a user can provide a rating (e.g., 1-5 stars) and an optional text comment.
- **AC11 (Story 4.4):** The submitted feedback is saved to the `feedback` table in the database, linked to the user and the specific content.

## Traceability Mapping

| AC ID | Spec Section(s) | Component(s)/API(s) | Test Idea |
|---|---|---|---|
| **AC1** | Detailed Design.APIs, Workflows | `POST /api/v1/quizzes`, `AIGenerationService` | Integration test: Call the endpoint and verify a valid, structured response is received from the mock AI service. |
| **AC2** | Detailed Design.Data Models | `QuizService`, `quizzes` table, `questions` table | Unit test: `QuizService` correctly persists the parsed AI response to the database. |
| **AC3** | Detailed Design.Services, Workflows | `GET /api/v1/quizzes/{id}` (implied), `QuizProvider`, `QuizView` | E2E test: After generating a quiz, verify the first question is displayed correctly. |
| **AC4, AC5**| Detailed Design.Services, Workflows| `QuizView`, `QuizProvider` | Component test: Interact with the quiz component and verify state changes correctly for answers and navigation. |
| **AC6** | Detailed Design.APIs | `POST /api/v1/quizzes/{quiz_id}/submit` | Integration test: Submit a mock set of answers and verify the backend grading logic is correct. |
| **AC7, AC8**| Detailed Design.Services, Workflows | `ResultsView` | E2E test: Complete a quiz submission and verify the results screen shows the correct score and answer review. |
| **AC9, AC10**|Detailed Design.Services, Workflows| `FeedbackButton`, `FeedbackForm` | Component test: Click the feedback button and verify the form opens and can be filled out. |
| **AC11**| Detailed Design.APIs, Data Models | `POST /api/v1/feedback`, `feedback` table | Integration test: Submit the feedback form and verify the data is correctly saved in the database with the correct user/content IDs. |

## Risks, Assumptions, Open Questions

- **Risk 1 (High):** The quality and relevance of AI-generated quiz questions may be inconsistent.
    - **Mitigation:** Extensive prompt engineering and testing with diverse documents will be required. The feedback mechanism (Story 4.4) is critical for gathering data to refine prompts over time.
- **Risk 2 (Medium):** The structure of the AI's response for quizzes may be unpredictable, making it difficult to parse reliably.
    - **Mitigation:** The prompt must explicitly request a specific JSON format. The backend parsing logic must be robust and include error handling for malformed responses.
- **Assumption 1:** The Gemini 2.5 API will be available and performant enough to meet the 30-second NFR (P1).
- **Assumption 2:** The text content extracted from documents in Epic 3 is of sufficient quality to generate meaningful quizzes.
- **Question 1:** What is the optimal prompt structure to balance question diversity (MCQ, T/F, short-answer) and response quality/parsability?
    - **Next Step:** Requires research and experimentation during development of the `AIGenerationService`.
- **Question 2:** How should the system handle a user re-taking a quiz? Should it generate a new quiz or show the same one?
    - **Decision for MVP:** For MVP, a user will always get the same generated quiz for a given document. Re-generation is out of scope.

## Test Strategy Summary

The test strategy for this epic will follow the project's established multi-layered approach.

- **Unit Tests:**
    - Backend: `QuizService` logic (grading), `AIGenerationService` prompt creation, and Pydantic schema validation will be unit tested.
    - Frontend: React components (`QuizView`, `ResultsView`) and state management logic (`QuizProvider`) will be tested using Jest and React Testing Library.
- **Integration Tests:**
    - Test the full flow from the API endpoints (`/api/v1/quizzes`, `/api/v1/feedback`) to the service layer and database.
    - Mock the external Gemini API to test the backend's ability to handle success and error responses.
- **End-to-End (E2E) Tests:**
    - A full user journey will be tested using Cypress:
        1. User logs in.
        2. User selects a document.
        3. User clicks "Generate Quiz".
        4. User completes and submits the quiz.
        5. User verifies the results screen.
        6. User submits feedback on the quiz.
