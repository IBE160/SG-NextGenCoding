# Story 4.3: Quiz Answer Submission and Basic Results

Status: done

## Story

As a user,
I want to submit my answers and see my performance,
so that I can identify my knowledge gaps.

## Acceptance Criteria

1.  **Given** I have completed a quiz, **When** I submit my answers, **Then** the system compares my answers to the correct answers.
2.  My score is displayed (e.g., number correct out of total).
3.  I can review which questions I answered correctly or incorrectly.

## Tasks / Subtasks

- [x] Task 1 (AC: #1, #2, #3) - Develop Backend for Answer Submission
  - [x] Subtask 1.1 - Create a FastAPI endpoint to receive quiz answers.
  - [x] Subtask 1.2 - Implement logic to compare user answers against the correct answers and calculate a score.
  - [x] Subtask 1.3 - Return the score and a detailed breakdown of correct/incorrect answers.
- [x] Task 2 (AC: #2, #3) - Create Frontend for Results Display
  - [x] Subtask 2.1 - Develop a `ResultsView` component in React to display the quiz outcome.
  - [x] Subtask 2.2 - Fetch and display the score prominently.
  - [x] Subtask 2.3 - Render the list of questions, highlighting the user's answer and the correct answer for each.

## Dev Notes

- The primary focus is on creating a backend endpoint to handle the grading logic and a new frontend view to present the results.
- The backend will require a new FastAPI route. The frontend will need a new component, likely in `frontend/src/components/quiz/`.
- The `QuizView` component created in story 4.2 will need to be modified to handle the submission event and navigate to the new results view.

### Project Structure Notes

- **Backend:**
  - New endpoint in `backend/app/api/endpoints/quiz.py` (or similar).
- **Frontend:**
  - New component: `frontend/src/components/quiz/ResultsView.tsx`.
  - Update `frontend/src/components/quiz/QuizView.tsx` to handle submission.

### References

- [Source: docs/epics.md#epic-4-interactive-quiz-generation-feedback]
- [Source: docs/PRD.md#fr-ila-1]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-3-quiz-answer-submission-basic-results.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
