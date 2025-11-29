# Story 2.2: User Login and Session Management

Status: drafted

## Story

As a registered user,
I want to log in to my account,
so that I can access my saved content and continue my learning journey.

## Acceptance Criteria

1.  **AC-UM-2**: A registered and verified user must be able to log in with their correct credentials. Upon successful login, a session must be established, granting access to protected routes. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]
2.  **AC-UM-8**: A logged-in user's session should persist across browser tabs and sessions until they explicitly log out. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]

## Tasks / Subtasks

- [ ] **Backend: Create User Login Endpoint** (AC: #1)
    - [ ] Create a new API route in FastAPI under `backend/app/api/auth/login.py`.
    - [ ] The endpoint should accept email and password and use Supabase `signInWithPassword`.
    - [ ] On successful login, it should return the session/JWT to the client.
    - [ ] Handle login errors (e.g., invalid credentials) gracefully.
- [ ] **Frontend: Build Login UI Form** (AC: #1)
    - [ ] Create the login page component at `frontend/src/app/(auth)/login/page.tsx`.
    - [ ] Build the form using Shadcn UI components, consistent with the registration form.
    - [ ] Implement form state management with `React Hook Form` and validation with `Zod`.
- [ ] **Frontend: Handle Login and Session** (AC: #1, #2)
    - [ ] On form submission, call the backend login endpoint.
    - [ ] Securely store the returned session/JWT (e.g., in an HttpOnly cookie).
    - [ ] Redirect the user to a dashboard or home page on successful login.
- [ ] **Frontend: Implement Protected Routes** (AC: #1)
    - [ ] Create a Next.js middleware file (`frontend/src/middleware.ts`) to handle route protection.
    - [ ] The middleware should check for a valid session cookie.
    - [ ] If the session is invalid, redirect the user to the login page.
    - [ ] Create an example protected page (e.g., `frontend/src/app/dashboard/page.tsx`) to test the functionality.
- [ ] **Testing**
    - [ ] Write a backend unit test for the login endpoint.
    - [ ] Write frontend integration tests for the login flow and for accessing a protected route (both authenticated and unauthenticated states).

## Dev Notes

This story builds directly on the registration functionality from Story 2.1. It implements the core login and session management, a critical part of the user authentication epic.

- **Relevant architecture patterns and constraints**:
    - Session management will be JWT-based, handled by **Supabase Auth**. [Source: docs/PRD.md#Authentication-&-Authorization]
    - Route protection will be implemented using **Next.js Middleware**. [Source: docs/epics.md#Technical-Notes]
    - All patterns established in Story 2.1 for auth endpoints and UI should be followed for consistency.

- **Source tree components to touch**:
    - `backend/app/api/auth/`: For the new login endpoint.
    - `frontend/src/app/(auth)/login/`: For the login UI.
    - `frontend/src/middleware.ts`: For route protection logic.
    - `frontend/src/app/dashboard/`: For an example protected route.

### Learnings from Previous Story

**From Story 2.1 (Status: drafted)**

- **API and UI Structure Defined**: The locations for authentication-related backend (`/backend/app/api/auth`) and frontend (`/frontend/src/app/(auth)`) code have been established. This story will follow that pattern by adding `login` resources in those directories.
- **Tech Stack**: The component and validation libraries (`Shadcn UI`, `React Hook Form`, `Zod`) have been specified and should be reused for the login form to ensure consistency with the registration form.

[Source: docs/sprint-artifacts/2-1-user-registration-with-email-and-password.md#Dev-Notes]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- [Source: docs/epics.md#Story-2.2-User-Login-and-Session-Management]
- [Source: docs/PRD.md#FR-UM-1]
- [Source: docs/architecture.md#Security-Architecture]

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

<!--
- YYYY-MM-DD: Description of change.
-->
