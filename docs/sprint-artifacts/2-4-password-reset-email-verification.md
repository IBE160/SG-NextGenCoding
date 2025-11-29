# Story 2.4: Password Reset and Email Verification

Status: drafted

## Story

As a user,
I want to reset my password if I forget it and verify my email address,
so that I can maintain access to my account and ensure its security.

## Acceptance Criteria

1.  **Given** I have an account but have forgotten my password, **When** I request a password reset from the "Forgot Password" page, **Then** I receive an email with a password reset link. [Source: docs/epics.md#Story-2.4]
2.  **And** upon clicking the link and submitting a new password, my password is changed, and I can log in with the new password. [Source: docs/epics.md#Story-2.4]
3.  **Given** I have just registered for a new account, **When** I click the link in my verification email, **Then** my email address is marked as verified in the system. [Source: docs/epics.md#Story-2.4]

## Tasks / Subtasks

- [ ] **Backend: Password Reset Request Endpoint** (AC: #1)
    - [ ] Create an API endpoint (e.g., `POST /api/auth/forgot-password`) that accepts a user's email.
    - [ ] The endpoint should call the Supabase Auth function to trigger the password recovery email (e.g., `auth.resetPasswordForEmail`).
- [ ] **Frontend: "Forgot Password" UI** (AC: #1)
    - [ ] Create a "Forgot Password" page at `frontend/src/app/(auth)/forgot-password/page.tsx`.
    - [ ] The page should have a form with an email input field and a submit button.
    - [ ] On submit, call the backend endpoint.
- [ ] **Backend: Password Update Endpoint** (AC: #2)
    - [ ] Supabase handles the password update via its redirect flow. A backend endpoint may be needed to handle the callback from Supabase to finalize the password update if not handled client-side.
- [ ] **Frontend: "Reset Password" UI** (AC: #2)
    - [ ] Create a "Reset Password" page at `frontend/src/app/(auth)/reset-password/page.tsx`.
    - [ ] This page will be loaded when the user clicks the link in their email. It will handle the token from Supabase.
    - [ ] The form will allow the user to enter and confirm their new password.
- [ ] **Frontend: Email Verification Handling** (AC: #3)
    - [ ] Create a specific callback page (e.g., `frontend/src/app/auth/callback/page.tsx`) to handle the redirect from Supabase after a user clicks the verification link.
    - [ ] This page should inform the user that their email has been verified and direct them to the login page.
- [ ] **Testing**
    - [ ] Write integration tests for the full password reset flow.
    - [ ] Write a test to ensure the email verification callback route works as expected.

## Dev Notes

This story completes the core user authentication lifecycle by adding essential account management features. It relies heavily on the built-in flows provided by Supabase Auth.

- **Relevant architecture patterns and constraints**:
    - The implementation will use **Supabase Auth's** password recovery and email verification functionalities. [Source: docs/epics.md#Technical-Notes]
    - The **Resend** service, configured in Story 2.1, will be used by Supabase to send the necessary emails. [Source: docs/architecture.md#Decision-Summary]
    - All new UI pages must be consistent with the existing auth UI.

- **Source tree components to touch**:
    - `backend/app/api/auth/`: For password reset request endpoint.
    - `frontend/src/app/(auth)/`: For the new `forgot-password` and `reset-password` pages.
    - `frontend/src/app/auth/callback/`: For handling the email verification redirect.

### Learnings from Previous Story

**From Story 2.3 (Status: drafted)**

- **User State Management**: The project now has several user states (authenticated, guest, limited guest). This story adds to that by handling the state of a user who is verifying their email or resetting their password. The UI must provide clear feedback during these flows.

[Source: docs/sprint-artifacts/2-3-guest-access-for-core-features.md#Dev-Notes]

### References

- [Source: docs/epics.md#Story-2.4-Password-Reset-and-Email-Verification]
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
