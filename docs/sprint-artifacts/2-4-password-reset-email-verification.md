# Story 2.4: Password Reset and Email Verification

Status: review

## Story

As a user,
I want to reset my password if I forget it and verify my email address,
so that I can maintain access to my account and ensure its security.

## Acceptance Criteria

1.  **AC-UM-4**: A user who has forgotten their password must be able to request a password reset link to be sent to their registered email address. Following the link must allow them to set a new password. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]
2.  **AC-UM-7**: A user's account must remain in an "unverified" state until they click the verification link sent to their email. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]

## Tasks / Subtasks

- [x] **Backend: Password Reset Request Endpoint** (AC: #1)
    - [x] Create an API endpoint (e.g., `POST /api/auth/forgot-password`) that accepts a user's email.
    - [x] The endpoint should call the Supabase Auth function to trigger the password recovery email (e.g., `auth.resetPasswordForEmail`).
- [x] **Frontend: "Forgot Password" UI** (AC: #1)
    - [x] Create a "Forgot Password" page at `frontend/src/app/(auth)/forgot-password/page.tsx`.
    - [x] The page should have a form with an email input field and a submit button.
    - [x] On submit, call the backend endpoint.
- [x] **Backend: Password Update Endpoint** (AC: #1)
    - [x] Supabase handles the password update via its redirect flow. A backend endpoint may be needed to handle the callback from Supabase to finalize the password update if not handled client-side.
- [x] **Frontend: "Reset Password" UI** (AC: #1)
    - [x] Create a "Reset Password" page at `frontend/src/app/(auth)/reset-password/page.tsx`.
    - [x] This page will be loaded when the user clicks the link in their email. It will handle the token from Supabase.
    - [x] The form will allow the user to enter and confirm their new password.
- [x] **Frontend: Email Verification Handling** (AC: #2)
    - [x] Create a specific callback page (e.g., `frontend/src/app/auth/callback/page.tsx`) to handle the redirect from Supabase after a user clicks the verification link.
    - [x] This page should inform the user that their email has been verified and direct them to the login page.
- [x] **Testing**
    - [x] Write integration tests for the full password reset flow.
    - [x] Write a test to ensure the email verification callback route works as expected.

### Review Follow-ups (AI)
- [ ] [AI-Review][Low] Make `redirect_to` URL configurable via environment variables in `backend/app/api/auth/forgot_password.py`

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

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- [Source: docs/epics.md#Story-2.4-Password-Reset-and-Email-Verification]
- [Source: docs/PRD.md#FR-UM-1]
- [Source: docs/architecture.md#Security-Architecture]

## Dev Agent Record

### Context Reference
<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used
{{agent_model_name_version}}

### Debug Log References

### File List
- frontend/src/mocks/handlers.ts

## Senior Developer Review (AI)

**Reviewer:** BIP
**Date:** torsdag 4. desember 2025
**Outcome:** APPROVE

**Summary:**
Story 2.4, "Password Reset and Email Verification," has been thoroughly implemented and verified. All acceptance criteria are met, and all tasks are completed as described. The implementation correctly integrates with Supabase Auth for password reset and email verification flows, leveraging both frontend UI components and backend API endpoints. A minor regression in frontend tests was addressed during the development process.

**Key Findings:**
No High or Medium severity findings.

**Acceptance Criteria Coverage:**
*   **AC-UM-4: A user who has forgotten their password must be able to request a password reset link to be sent to their registered email address. Following the link must allow them to set a new password.**
    *   **Status:** IMPLEMENTED
    *   **Evidence:**
        *   `frontend/src/app/(auth)/forgot-password/page.tsx`: Implements the "Forgot Password" UI and calls backend endpoint.
        *   `backend/app/api/auth/forgot_password.py`: Implements backend endpoint using `supabase.auth.reset_password_for_email`.
        *   `frontend/src/app/(auth)/reset-password/page.tsx`: Implements the "Reset Password" UI, handles token, and calls backend for password update.
        *   `backend/app/api/auth/reset_password.py`: Implements backend endpoint using `supabase.auth.update_user`.
*   **AC-UM-7: A user's account must remain in an "unverified" state until they click the verification link sent to their email.**
    *   **Status:** IMPLEMENTED
    *   **Evidence:**
        *   `frontend/src/app/auth/callback/page.tsx`: This page is designed to handle the redirect from Supabase after email verification, confirming integration with Supabase's flow.

**Summary:** 2 of 2 acceptance criteria fully implemented.

**Task Completion Validation:**
All tasks were marked as completed and verified.

*   **Backend: Password Reset Request Endpoint**
    *   `Create an API endpoint (e.g., POST /api/auth/forgot-password).`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `backend/app/api/auth/forgot_password.py`
    *   `The endpoint should call the Supabase Auth function to trigger the password recovery email (e.g., auth.resetPasswordForEmail).`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `backend/app/api/auth/forgot_password.py`
*   **Frontend: "Forgot Password" UI**
    *   `Create a "Forgot Password" page at frontend/src/app/(auth)/forgot-password/page.tsx.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/forgot-password/page.tsx`
    *   `The page should have a form with an email input field and a submit button.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/forgot-password/page.tsx`
    *   `On submit, call the backend endpoint.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/forgot-password/page.tsx`
*   **Backend: Password Update Endpoint**
    *   `Supabase handles the password update via its redirect flow. A backend endpoint may be needed to handle the callback from Supabase to finalize the password update if not handled client-side.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `backend/app/api/auth/reset_password.py`
*   **Frontend: "Reset Password" UI**
    *   `Create a "Reset Password" page at frontend/src/app/(auth)/reset-password/page.tsx.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/reset-password/page.tsx`
    *   `This page will be loaded when the user clicks the link in their email. It will handle the token from Supabase.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/reset-password/page.tsx`
    *   `The form will allow the user to enter and confirm their new password.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/(auth)/reset-password/page.tsx`
*   **Frontend: Email Verification Handling**
    *   `Create a specific callback page (e.g., frontend/src/app/auth/callback/page.tsx) to handle the redirect from Supabase after a user clicks the verification link.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/auth/callback/page.tsx`
    *   `This page should inform the user that their email has been verified and direct them to the login page.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/src/app/auth/callback/page.tsx`
*   **Testing**
    *   `Write integration tests for the full password reset flow.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `backend/tests/test_password_reset.py`
    *   `Write a test to ensure the email verification callback route works as expected.`
        *   **Marked As:** [x]
        *   **Verified As:** VERIFIED COMPLETE
        *   **Evidence:** `frontend/__tests__/auth-callback.test.tsx`

**Summary:** 9 of 9 completed tasks verified, 0 questionable, 0 falsely marked complete.

**Test Coverage and Gaps:**
*   Existing unit/integration tests cover the password reset flow in the backend (`tests/test_password_reset.py`) and email verification in the frontend (`__tests__/auth-callback.test.tsx`).
*   Frontend password reset UI (`forgot-password`, `reset-password`) could benefit from dedicated integration tests to ensure form submission and state handling are robust.

**Architectural Alignment:**
*   The implementation aligns well with the stated architecture of using Next.js for the frontend, FastAPI for the backend, and Supabase for authentication.
*   The use of `Supabase Auth` for password recovery and email verification is consistent with the architecture document.
*   **Warning:** No Epic Tech Spec was found for Epic 2. This does not block the review but highlights a potential documentation gap.

**Security Notes:**
*   Supabase handles the core security for password hashing, token generation, and email sending, reducing the surface area for custom vulnerabilities.
*   Frontend handles token extraction from URL securely via `window.location.hash`.
*   Input validation is in place using `zod` (frontend) and `pydantic` (backend).

**Best-Practices and References:**
*   Project uses Next.js, FastAPI, Supabase.
*   Adherence to RESTful API patterns.
*   Pydantic for backend data validation.
*   Zod for frontend data validation.

**Action Items:**

**Code Changes Required:**
*   - [ ] [Low] Make `redirect_to` URL configurable via environment variables in `backend/app/api/auth/forgot_password.py` (e.g., `os.getenv("FRONTEND_RESET_PASSWORD_URL")`).

**Advisory Notes:**
*   - Note: Consider setting up a client-side Supabase instance in `frontend/src/app/(auth)/reset-password/page.tsx` to handle password reset directly using the Supabase JS library, potentially simplifying the backend endpoint.
*   - Note: Add dedicated integration tests for frontend password reset UI (`forgot-password`, `reset-password`) to cover form submission and state handling.
*   - Note: Create an Epic Tech Spec for Epic 2 to ensure comprehensive documentation and alignment for future stories.

## Change Log

- torsdag 4. desember 2025: Senior Developer Review notes appended.
