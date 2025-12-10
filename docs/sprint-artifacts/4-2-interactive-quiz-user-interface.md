# Story 4.2: Interactive Quiz User Interface

Status: done

## Story

As a user,
I want an intuitive interface to take the generated quizzes,
so that my learning experience is engaging and effective.

## Acceptance Criteria

1.  **Given** a quiz has been generated, **When** I start the quiz, **Then** questions are presented one at a time.
2.  I can select or input my answers.
3.  I can navigate between questions (e.g., next/previous).

## Tasks / Subtasks

- [x] Task 1 (AC: #1, #2, #3) - Create React components for quiz display.
  - [x] Subtask 1.1 - Create a `QuizView` component to manage the overall quiz state.
  - [x] Subtask 1.2 - Create a `QuestionCard` component to display a single question and its options.
- [x] Task 2 (AC: #2, #3) - Implement state management for user answers and navigation.
  - [x] Subtask 2.1 - Use React state (e.g., `useState`, `useReducer`, or a state management library) to track the current question index and user's answers.
  - [x] Subtask 2.2 - Implement "Next" and "Previous" button functionality.

## Dev Notes

- React components for quiz display, state management for user answers.
- Consider using a state management library like Zustand or Redux Toolkit if the quiz state becomes complex.
- Ensure the UI is responsive and works well on different screen sizes.

### Project Structure Notes

- New components should be placed in `frontend/src/components/quiz/`.
- `QuizView.tsx` will be the main component for the quiz interface.
- `QuestionCard.tsx` will be a reusable component for displaying questions.

### References

- [Source: docs/epics.md#epic-4-interactive-quiz-generation-feedback]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
