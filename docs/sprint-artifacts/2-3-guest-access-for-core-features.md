# Story 2.3: Guest Access for Core Features

Status: drafted

## Story

As a potential user,
I want to try the core summary and quiz generation features without immediate registration,
so that I can experience the value of the application before committing to an account.

## Acceptance Criteria

1.  **AC-UM-5**: An unauthenticated user must be able to use the core application features for a limited number of times (e.g., 2 times) before being prompted to register or log in. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]
2.  **AC-UM-6**: After exceeding the guest usage limit, the user must be prevented from further use of core features and be directed to the registration/login page. [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-Authoritative]

## Tasks / Subtasks

- [ ] **Frontend: Implement Guest Usage Tracking** (AC: #1)
    - [ ] Create a utility service or a set of functions in `frontend/src/lib/` to manage guest usage.
    - [ ] Use `localStorage` to persist the usage count for a guest user across browser sessions.
    - [ ] The service should provide functions to `getUsageCount`, `incrementUsageCount`, and `checkUsageLimit`.
- [ ] **Frontend: Gate Core Features for Guests** (AC: #1, #2)
    - [ ] In the UI components responsible for core features (e.g., the file upload page), add logic to check if the user is authenticated.
    - [ ] If the user is a guest, call the usage tracking service to check their limit.
    - [ ] If the limit is not reached, allow the feature to be used and call `incrementUsageCount` on completion.
- [ ] **Frontend: Create "Registration Wall" UI** (AC: #2)
    - [ ] Design and build a reusable modal component (using Shadcn UI) that prompts the user to register or log in.
    - [ ] The modal should clearly state why they are being prompted (e.g., "You've used all your free summaries.").
    - [ ] The modal should contain links to the registration and login pages.
- [ ] **Testing**
    - [ ] Write frontend integration tests to simulate a guest user's journey:
        - Using the feature for the first time.
        - Reaching the usage limit.
        - Being blocked by the registration wall.
    - [ ] Verify that an authenticated user is not affected by the guest limit.

## Dev Notes

This story introduces the "Guest Mode," a key feature of the MVP designed to lower the barrier to entry for new users. It relies heavily on client-side logic and leverages the authentication state established in the previous stories.

- **Relevant architecture patterns and constraints**:
    - **Client-side tracking** is the specified method for managing guest access. This avoids unnecessary backend complexity for unauthenticated users. [Source: docs/epics.md#Technical-Notes]
    - The UI should be **conditionally rendered** based on authentication status and guest usage count. [Source: docs/epics.md#Technical-Notes]

- **Source tree components to touch**:
    - `frontend/src/lib/`: For the new guest tracking utility.
    - `frontend/src/app/(main-feature-routes)/`: The pages containing the core features that will be gated.
    - `frontend/src/components/`: For the new registration wall modal.
    - `frontend/src/middleware.ts`: To ensure it correctly differentiates between guest and authenticated users.

### Learnings from Previous Story

**From Story 2.2 (Status: drafted)**

- **Authentication Context**: The patterns for checking authentication status are being established. This story will implement the "else" condition for an unauthenticated user, providing an alternative experience instead of a hard redirect.
- **UI Consistency**: The registration/login modal should be built with Shadcn UI to maintain visual consistency with the auth pages.

[Source: docs/sprint-artifacts/2-2-user-login-session-management.md#Dev-Notes]

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- [Source: docs/architecture.md]
- [Source: docs/epics.md#Story-2.3-Guest-Access-for-Core-Features]
- [Source: docs/PRD.md#FR-UM-2]

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
