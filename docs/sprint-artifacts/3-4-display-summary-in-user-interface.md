# Story 3.4: Display Summary in User Interface

## Requirements Context Summary

This story, "Display Summary in User Interface," is the final user-facing component of Epic 3: "Content Ingestion & AI Summarization." Its goal is to present the AI-generated summaries (from Story 3.3) to the user in a clear, readable, and intuitive format, allowing for easy review of key points.

### User Story Statement:

As a user,
I want to view my generated summary clearly and intuitively,
So that I can easily review the key points.

### Acceptance Criteria (from PRD/Epic):

*   **FR-CIP-2**: When a summary has been generated (from Story 3.3), the user can navigate to a dedicated summary view.
*   **FR-CIP-2**: The summary content is presented in an easy-to-read format within the user interface, utilizing markdown rendering for structure and readability.
*   **FR-CIP-2**: The user can easily copy the summary text to their clipboard.
*   **FR-CIP-2**: The UI provides clear visual feedback regarding the summary generation status (e.g., loading indicator, "summary ready").
*   **FR-UI-1**: The summary display interface is responsive across desktop, laptop, and tablet devices.

### Relevant Technical Context & Constraints:

*   **Frontend**: Built with Next.js, TypeScript, React, Tailwind CSS, and Shadcn UI. A new React component will be responsible for rendering the summary.
*   **Markdown Rendering**: A client-side markdown renderer library will be integrated to display formatted summaries.
*   **Backend API**: The frontend will interact with the `GET /api/v1/documents/{document_id}/summary` endpoint to fetch the generated summary, and potentially `GET /api/v1/documents/{document_id}/status` for status updates.
*   **State Management**: Zustand will manage the UI state related to summary display and loading.
*   **Dependencies**: Relies on successful summary generation (Story 3.3) and the availability of the summary text from the `summaries` table.
*   **User Experience**: Adherence to UX principles for clarity, readability, and ease of interaction (e.g., copy functionality).
## Project Structure Alignment

This story will primarily involve the following areas of the project structure:

*   **Frontend UI (`frontend/src/app/summaries/` or `frontend/src/app/documents/[document_id]/`)**: Creation of new Next.js pages and React components for displaying a single generated summary. This will include UI elements for rendering markdown, status indicators, and copy functionality.
*   **Frontend Services (`frontend/src/services/`)**: The existing frontend service will be extended to include functions for:
    *   Fetching the summary content (`GET /api/v1/documents/{document_id}/summary`).
    *   Polling the status of summary generation (`GET /api/v1/documents/{document_id}/status`) to provide real-time updates to the user.
*   **Frontend State Management (`frontend/src/lib/store.ts` or similar)**: Zustand will be used to manage the UI state related to fetching, loading, and displaying summaries, ensuring a smooth user experience.
*   **Third-party Libraries**: Integration of a markdown rendering library (e.g., `react-markdown`) and potentially a clipboard utility library (e.g., `react-copy-to-clipboard`).
*   **Backend API (`backend/app/api/summaries/`)**: This story relies on the `GET /api/v1/documents/{document_id}/summary` and `GET /api/v1/documents/{document_id}/status` endpoints implemented or enhanced in Story 3.3.

### Learnings from Previous Stories (Story 3.3 - AI Summary Generation Integration):

Story 3.3 is currently in `drafted` status. This story builds directly on the output of Story 3.3:

*   **Summary Availability**: This story assumes that Story 3.3 successfully generates summaries and stores them in the `summaries` table, making them retrievable via the backend API.
*   **Document Status Updates**: The frontend will monitor the `documents.status` field, which is updated by Story 3.3, to determine when a summary is ready for display.
*   **API Contracts**: The frontend will strictly adhere to the API contracts defined for summary retrieval and status checking (`GET /api/v1/documents/{document_id}/summary` and `GET /api/v1/documents/{document_id}/status`).
*   **Error Handling**: Frontend error handling should gracefully manage scenarios where a summary is not yet available, has failed generation, or if there are API communication issues, aligning with patterns established in previous stories.
## Acceptance Criteria

1.  **FR-CIP-2**: When a summary is successfully generated (from Story 3.3) and available, the frontend can fetch it using `GET /api/v1/documents/{document_id}/summary`.
2.  **FR-CIP-2**: The summary content, including formatting (e.g., headings, bullet points), is correctly rendered in the UI using a markdown renderer component.
3.  **FR-CIP-2**: The UI includes a clearly visible and functional button/icon to copy the entire summary text to the user's clipboard.
4.  **FR-CIP-2**: The UI provides clear visual feedback (e.g., a loading spinner or skeleton screen) while the summary is being fetched or generated.
5.  **FR-CIP-2**: The UI displays a user-friendly message if summary generation has failed or the summary is not yet available.
6.  **FR-UI-1**: The summary display interface is responsive and maintains readability and usability across desktop, laptop, and tablet screen sizes.
7.  **FR-UI-1**: Navigation to the summary view is intuitive from the main application flow (e.g., after successful upload and generation).
8.  **FR-CIP-2**: The system handles large summaries efficiently, ensuring the UI remains responsive and loads content without excessive delays.

## Tasks & Subtasks

### Frontend Development

*   **Design & Implement Summary Display Page (`frontend/src/app/summaries/[document_id]/page.tsx`)**
    *   Create a dedicated Next.js page for displaying a single summary.
    *   Implement UI layout to present the summary prominently.
    *   Integrate a markdown rendering library (e.g., `react-markdown`) to display `summary_text`.
    *   Add a "Copy Summary" button/icon with associated clipboard functionality (e.g., `react-copy-to-clipboard`).
    *   Implement loading states (e.g., skeleton UI, spinner) for when the summary is being fetched.
    *   Handle error states (e.g., summary not found, generation failed) with user-friendly messages.
*   **Extend Frontend API Service (`frontend/src/services/documents.ts`)**
    *   Create function `getSummary(documentId: UUID)` to call `GET /api/v1/documents/{document_id}/summary`.
    *   Create function `getSummaryStatus(documentId: UUID)` to call `GET /api/v1/documents/{document_id}/status`.
    *   Implement polling mechanism for `getSummaryStatus` to update UI automatically once summary is ready.
*   **Integrate with Zustand Store (`frontend/src/lib/store.ts`)**
    *   Define state slices for managing summary data, loading status, and errors.
    *   Update the store with fetched summaries and status changes.
*   **Navigation Integration**
    *   Ensure smooth navigation to the summary display page (e.g., from an upload success screen or a user's document list).

### Testing

*   **Unit Tests (Frontend `jest`)**:
    *   Test markdown rendering component with various markdown inputs.
    *   Test clipboard copy functionality.
    *   Test state management updates for loading, success, and error states.
*   **Integration Tests (Frontend `jest`)**:
    *   Test `getSummary` and `getSummaryStatus` service functions, mocking backend API responses.
    *   Test polling logic for summary status.
*   **E2E Tests (Playwright/Cypress)**:
    *   Simulate a user uploading a file, waiting for summary generation (mocked), and navigating to view the summary.
    *   Verify summary content is displayed correctly and can be copied.
    *   Test responsiveness across different device viewports.
    *   Test error scenarios: summary generation failed, summary not found.
*   **Manual UI/UX Review**:
    *   Visually inspect the summary display for clarity, intuition, and adherence to design principles.
## Change Log

*   **2025-12-04**: Initial draft generated by SM agent.

## Dev Agent Record

### Context Reference
*   docs/sprint-artifacts/3-4-display-summary-in-user-interface.context.xml

Status: ready-for-dev