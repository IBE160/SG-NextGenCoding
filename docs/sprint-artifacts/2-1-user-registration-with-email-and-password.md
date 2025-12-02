# Story 2.1: User Registration with Email and Password

Status: drafted

## Story

As a new user,
I want to create an account using my email and a secure password,
so that I can access personalized features and save my progress.

## Acceptance Criteria

1.  **AC-UM-1**: A new user must be able to create an account using a valid email and password. Upon successful registration, a verification email must be sent to the provided address. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]


## Tasks / Subtasks

- [ ] **Backend: Create User Registration Endpoint** (AC: #1)
    - [ ] Create a new API route in FastAPI under `backend/app/api/auth/register.py`.
    - [ ] The endpoint should accept email and password.
    - [ ] Implement logic to call `supabase.auth.sign_up()` with the provided credentials.
    - [ ] Handle potential errors from Supabase (e.g., user already exists) and return appropriate HTTP status codes.
- [ ] **Backend: Integrate Email Service for Confirmation** (AC: #1)
    - [ ] Configure the `Resend` email service in the backend.
    - [ ] After a successful sign-up, trigger an email to be sent to the user's email address for confirmation.
- [ ] **Frontend: Build Registration UI Form** (AC: #1)
    - [ ] Create the registration page component at `frontend/src/app/(auth)/register/page.tsx`.
    - [ ] Build the form using Shadcn UI components (`Input`, `Button`, `Label`). Reuse the button from `frontend/components/ui/button.tsx`.
    - [ ] Implement client-side form state management with `React Hook Form`.
- [ ] **Frontend: Implement Form Validation**
    - [ ] Define a `Zod` schema for registration form validation (email, password, confirm password).
    - [ ] Integrate the Zod schema with `React Hook Form` to provide real-time validation feedback.
- [ ] **Frontend: Handle Form Submission** (AC: #1)
    - [ ] On form submission, call the backend registration endpoint.
    - [ ] On success, redirect the user to a "check your email" page or the login page.
    - [ ] On failure, display a user-friendly error message (e.g., using a Toast component).
- [ ] **Testing**
    - [ ] Write a backend unit test for the registration endpoint.
    - [ ] Write a frontend integration test for the registration form, covering success and failure cases.

## Dev Notes

This story initiates **Epic 2: User Access & Authentication**. The primary goal is to implement the user registration flow as defined in the PRD and epics.

- **Relevant architecture patterns and constraints**:
    - Authentication is handled by **Supabase Auth**. [Source: docs/architecture.md#Authentication]
    - The API will be a **RESTful API** built with **FastAPI**. [Source: docs/architecture.md#API-Pattern]
    - The **Resend** service is specified for transactional emails. [Source: docs/architecture.md#Decision-Summary]
    - Frontend forms should use **React Hook Form with Zod** for validation. [Source: docs/PRD.md#Web-App-Specific-Requirements]

- **Source tree components to touch**:
    - `backend/app/api/auth/`: For the new registration endpoint.
    - `frontend/src/app/(auth)/register/`: For the new registration page and UI.
    - `frontend/src/lib/supabase.ts`: To ensure the Supabase client is correctly configured.

- **Testing standards summary**:
    - Backend and frontend code should be covered by unit and integration tests. [Source: docs/PRD.md#Test-Strategy]

### Learnings from Previous Story

**From Story 1.4 (Status: review)**

- **New UI Patterns Established**: The initial UI layout, theming, and component library (`Shadcn UI`) are in place. The registration form should adhere to this theme. The button at `frontend/components/ui/button.tsx` should be reused.
- **File Structure**: The frontend project structure is established. New UI components should be placed appropriately.
- **Warning**: A minor horizontal scrolling issue was noted on very small displays. While not a blocker, frontend implementation for this story should be mindful of responsive design principles.

[Source: docs/sprint-artifacts/1-4-implement-initial-ui-layout-theming.md#Dev-Agent-Record]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- [Source: docs/epics.md#Story-2.1-User-Registration-with-Email-and-Password]
- [Source: docs/PRD.md#FR-UM-1]
- [Source: docs/architecture.md#Epic-to-Architecture-Mapping]

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
