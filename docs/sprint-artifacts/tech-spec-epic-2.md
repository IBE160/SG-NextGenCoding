# Epic Technical Specification: User Access & Authentication

Date: 2025-11-27
Author: BIP
Epic ID: 2
Status: Draft

---

## Overview

Epic 2, "User Access & Authentication," focuses on providing secure user access to the application, including registration, login, and account management functionalities, alongside a guest mode for initial product trials. This epic is crucial for enabling personalized user experiences, saving individual progress, and allowing potential users to explore the application's core value proposition before full commitment. It lays the groundwork for all subsequent feature development that requires user identification and data persistence.

## Objectives and Scope

**Objectives:**
- Enable secure user registration and login.
- Provide mechanisms for password recovery and email verification.
- Implement a guest mode for limited, unauthenticated access to core features.
- Integrate seamlessly with Supabase Auth for robust authentication and session management.

**In-scope:**
- User registration with email and password.
- User login and logout functionality.
- Password reset workflow via email.
- Email verification for new registrations.
- Guest access for a predefined number of uses before prompting for registration.
- Integration of Supabase Auth for all authentication and session management.
- Frontend UI components for all authentication flows.

**Out-of-scope (for this epic):**
- Comprehensive user profile editing (e.g., changing username, profile picture).
- Social logins (e.g., Google, GitHub).
- Multi-factor authentication (MFA).
- Role-based access control (RBAC) beyond basic authenticated/guest distinctions.
- Any features directly related to content ingestion, AI summarization, or quiz generation.

## System Architecture Alignment

This epic directly aligns with the defined architecture by leveraging Supabase as the primary platform for authentication and data persistence. Specifically, it utilizes Supabase Auth for handling user registration, login, password resets, and email verification, ensuring secure, JWT-based session management. Frontend components (located in `frontend/src/app/(auth)/`) will interact with Supabase through the dedicated client library (`frontend/src/lib/supabase.ts`). The architecture's emphasis on Supabase's Row Level Security (RLS) will be fundamental in securing user data associated with their accounts. This approach adheres to the established decision to use Supabase for authentication, providing a robust and scalable solution for user access.

## Detailed Design

### Services and Modules

| Service/Module                | Responsibilities                                      | Inputs                                | Outputs                               | Owner              |
| ----------------------------- | ----------------------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------ |
| `frontend/src/app/(auth)/`    | Renders UI for registration, login, password reset    | User actions, credentials             | Rendered UI components                | Frontend Team      |
| `frontend/src/lib/supabase.ts`| Handles all client-side interactions with Supabase    | Authentication requests, user data    | Session state, user object            | Frontend Team      |
| `backend/app/api/auth/`       | Optional custom backend logic for authentication      | Requests from frontend (if needed)    | Responses to frontend (if needed)     | Backend Team       |
| `Supabase Auth` (External)    | Manages user lifecycle, authentication, JWTs, RLS     | User credentials, API requests        | User sessions, secure data access     | Supabase           |
| `Resend` (External)           | Handles transactional emails for verification/reset   | API requests with recipient and content | Email delivery to the user's inbox    | Resend             |

### Data Models and Contracts

The primary data model for this epic is the user, which is managed by Supabase's built-in `auth.users` table. A corresponding `public.profiles` table is recommended for storing non-sensitive, public-facing user data, linked via a foreign key to the `auth.users` table.

**User Model (Supabase `auth.users` table):**
This is a secure, managed table within Supabase.
- `id` (uuid, primary key)
- `email` (text)
- `encrypted_password` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `email_confirmed_at` (timestamptz)
- ...and other management fields.

**Profile Model (`public.profiles` table):**
This table should be created to store public or non-sensitive user information.
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  username text,
  full_name text,
  avatar_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### APIs and Interfaces

This epic will primarily use the Supabase client library, which acts as a wrapper around Supabase's RESTful authentication endpoints. The following functions from the `supabase-js` library will be used:

- **`supabase.auth.signUp(credentials)`**
  - **Description:** Creates a new user.
  - **Endpoint:** `POST /auth/v1/signup`
  - **Request Body:** `{ "email": "...", "password": "..." }`
  - **Response (Success):** `{ "data": { "user": { ... }, "session": { ... } }, "error": null }`
  - **Response (Error):** `{ "data": null, "error": { "message": "...", "status": ... } }`

- **`supabase.auth.signInWithPassword(credentials)`**
  - **Description:** Logs in a user.
  - **Endpoint:** `POST /auth/v1/token?grant_type=password`
  - **Request Body:** `{ "email": "...", "password": "..." }`
  - **Response (Success):** `{ "data": { "user": { ... }, "session": { ... } }, "error": null }`

- **`supabase.auth.signOut()`**
  - **Description:** Logs out a user and invalidates their session.
  - **Endpoint:** `POST /auth/v1/logout`

- **`supabase.auth.resetPasswordForEmail(email)`**
  - **Description:** Sends a password reset link to the user's email.
  - **Endpoint:** `POST /auth/v1/recover`
  - **Request Body:** `{ "email": "..." }`

- **`supabase.auth.updateUser({ password: newPassword })`**
  - **Description:** Updates the user's password.
  - **Endpoint:** `PUT /auth/v1/user`
  - **Request Body:** `{ "password": "..." }`

### Workflows and Sequencing

1.  **User Registration:**
    -   **Actor:** New User
    -   **Steps:**
        1.  User fills out the registration form in the `frontend`.
        2.  Frontend calls `supabase.auth.signUp()` with user's email and password.
        3.  `Supabase Auth` creates a new user record in the `auth.users` table.
        4.  `Supabase Auth` triggers `Resend` to send a verification email.
        5.  User is redirected to a page indicating that a verification email has been sent.

2.  **User Login:**
    -   **Actor:** Registered User
    -   **Steps:**
        1.  User fills out the login form in the `frontend`.
        2.  Frontend calls `supabase.auth.signInWithPassword()`.
        3.  `Supabase Auth` validates credentials and returns a JWT session.
        4.  Frontend stores the session and redirects the user to the main application dashboard.

3.  **Password Reset:**
    -   **Actor:** Registered User
    -   **Steps:**
        1.  User requests a password reset from the login page.
        2.  Frontend calls `supabase.auth.resetPasswordForEmail()`.
        3.  `Supabase Auth` triggers `Resend` to send a password reset link.
        4.  User clicks the link, is taken to a password reset page, and enters a new password.
        5.  Frontend calls `supabase.auth.updateUser()` to securely update the password.

## Non-Functional Requirements

### Performance

- **Latency:** All authentication-related API calls (login, registration, password reset) must have a P95 latency of less than 500ms under normal load conditions.
- **Concurrency:** The system must support at least 100 concurrent authentication requests without significant performance degradation.
- **Responsiveness:** Frontend UI for authentication forms must be highly responsive, with immediate client-side validation feedback to the user.

### Security

- **Authentication:** All authentication will be managed by Supabase Auth, which provides secure, JWT-based authentication for email/password credentials.
- **Authorization:** Access to user-specific data will be strictly enforced using Supabase's Row Level Security (RLS). RLS policies must be configured to ensure that users can only access their own data.
- **Data Handling:** All user Personally Identifiable Information (PII) must be handled in accordance with GDPR principles. Data is encrypted in transit (TLS) and at rest, as managed by Supabase and Vercel.
- **Threat Mitigation:**
  - Brute-force login attempts will be mitigated by Supabase Auth's built-in rate limiting and lock-out policies.
  - Password complexity rules are enforced by Supabase Auth to ensure strong passwords.
  - All communication between the client, backend, and Supabase will be over HTTPS.

### Reliability/Availability

- **Availability:** The authentication services, being reliant on Supabase, are expected to meet Supabase's SLA of 99.9% uptime.
- **Degradation:**
  - In the event of a Supabase Auth outage, the application will gracefully degrade. Users will be unable to log in or register, and the UI will display a clear "Service Unavailable" message.
  - If the `Resend` email service is unavailable, password resets and email verifications will fail. The user should be informed with a message advising them to try again later.
- **Recovery:** The system is expected to recover automatically as soon as external services (Supabase, Resend) are restored. No manual intervention should be required.

### Observability

- **Logging:**
  - All successful and failed authentication attempts (login, registration) will be logged within Supabase's provided logging tools.
  - All API errors returned from Supabase or Resend will be logged, including correlation IDs where available, to facilitate debugging.
- **Metrics:**
  - Key performance indicators (KPIs) to be monitored include:
    - Number of new user registrations per day.
    - Daily/Monthly Active Users (DAU/MAU).
    - P95 latency for all authentication endpoints.
    - Error rate percentage for authentication flows.
- **Tracing:** For the scope of this epic, distributed tracing is not a requirement. Basic logging will be the primary tool for observability.

## Dependencies and Integrations

### Internal Dependencies
- **Epic 1: Foundation & Core Platform:** This epic is a hard prerequisite. The core project structure, UI framework (`Next.js`, `Shadcn UI`), and initial Supabase integration established in Epic 1 are essential before work on Epic 2 can commence.

### External Dependencies & Integrations

| Dependency / Integration        | Type               | Version Constraint            | Purpose                                                                |
| ------------------------------- | ------------------ | ----------------------------- | ---------------------------------------------------------------------- |
| **Supabase Auth**               | External Service   | N/A                           | Core service for user authentication, session management, and JWTs.    |
| **Supabase Database (PostgreSQL)** | External Service   | N/A                           | Persistence of user profile data in the `public.profiles` table.         |
| **Resend**                      | External Service   | N/A                           | Transactional email delivery for email verification and password resets. |
| `supabase-js`                   | Frontend Library   | `^2.84.0`                     | Official client-side library for interacting with Supabase services.    |
| `react-hook-form`               | Frontend Library   | As per starter template       | For building and validating robust and accessible authentication forms. |
| `zod`                           | Frontend Library   | As per starter template       | For schema validation of form data on the client-side.                 |
| `next.js`                       | Frontend Framework | `^16.0.3`                     | The core framework for building the frontend application.              |

### Integration Points

- **Frontend -> Supabase Auth:** The frontend application will directly and securely communicate with the Supabase Auth service via the `supabase-js` library for all authentication workflows (registration, login, etc.). This is the primary integration point for this epic.
- **Supabase Auth -> Resend:** Supabase Auth will be configured within the Supabase dashboard to use Resend as the custom SMTP provider for sending all transactional emails. This is a configuration step, not a direct code integration within the application itself.

## Acceptance Criteria (Authoritative)

1.  **AC-UM-1 (User Registration):** A new user must be able to create an account using a valid email and password. Upon successful registration, a verification email must be sent to the provided address.
2.  **AC-UM-2 (User Login):** A registered and verified user must be able to log in with their correct credentials. Upon successful login, a session must be established, granting access to protected routes.
3.  **AC-UM-3 (User Logout):** A logged-in user must be able to log out, which must terminate their session and redirect them to a public page (e.g., login or home).
4.  **AC-UM-4 (Password Reset):** A user who has forgotten their password must be able to request a password reset link to be sent to their registered email address. Following the link must allow them to set a new password.
5.  **AC-UM-5 (Guest Access):** An unauthenticated user must be able to use the core application features for a limited number of times (e.g., 2 times) before being prompted to register or log in.
6.  **AC-UM-6 (Guest Access Limitation):** After exceeding the guest usage limit, the user must be prevented from further use of core features and be directed to the registration/login page.
7.  **AC-UM-7 (Email Verification):** A user's account must remain in an "unverified" state until they click the verification link sent to their email.
8.  **AC-UM-8 (Session Persistence):** A logged-in user's session should persist across browser tabs and sessions until they explicitly log out.

## Traceability Mapping

| Acceptance Criterion | Spec Section(s)                                    | Component(s) / API(s)                                                                       | Test Idea                                                                                                     |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **AC-UM-1**          | Detailed Design > APIs > `signUp`                  | `frontend/src/app/(auth)/register`, `supabase.auth.signUp()`                                  | **E2E:** Fill registration form, submit, and verify that a verification email is received.                     |
| **AC-UM-2**          | Detailed Design > APIs > `signInWithPassword`        | `frontend/src/app/(auth)/login`, `supabase.auth.signInWithPassword()`                         | **E2E:** Fill login form with valid credentials and verify redirection to a protected route.                    |
| **AC-UM-3**          | Detailed Design > APIs > `signOut`                 | Logout Button, `supabase.auth.signOut()`                                                    | **E2E:** Click the logout button and verify redirection and that protected routes are no longer accessible.     |
| **AC-UM-4**          | Detailed Design > APIs > `resetPasswordForEmail`     | `frontend/src/app/(auth)/forgot-password`, `supabase.auth.resetPasswordForEmail()`, `updateUser()` | **E2E:** Request password reset, check email, follow link, set new password, and log in with the new password. |
| **AC-UM-5**          | Objectives and Scope                               | Guest mode logic, Local Storage tracking                                                    | **E2E:** As a logged-out user, use a core feature twice successfully.                                           |
| **AC-UM-6**          | Objectives and Scope                               | Guest mode logic, Local Storage tracking                                                    | **E2E:** After two uses, attempt a third use and verify that a registration prompt appears.                   |
| **AC-UM-7**          | Detailed Design > Workflows                        | Supabase Auth email verification flow                                                       | **Integration:** Check user status in Supabase DB after registration. **E2E:** Click verification link, log in. |
| **AC-UM-8**          | NFRs > Security                                    | Supabase session management                                                                 | **E2E:** Log in, close the browser, reopen, and verify that the session is still active.                       |

## Risks, Assumptions, Open Questions

## Risks, Assumptions, Open Questions

### Risks

-   **R1: External Service Outage (Supabase/Resend):**
    -   **Description:** Core authentication and email delivery rely entirely on external services (Supabase Auth, Resend). An outage in either could prevent users from registering, logging in, or resetting passwords.
    -   **Mitigation:** Implement robust error handling with user-friendly messages. Actively monitor the status of these services. Consider fallback mechanisms or informative static pages during prolonged outages for critical functions.
-   **R2: Security Vulnerabilities in Implementation:**
    -   **Description:** Incorrect configuration of Supabase Row Level Security (RLS) or improper handling of client-side tokens could expose user data or lead to unauthorized access.
    -   **Mitigation:** Strictly adhere to Supabase security best practices and documentation. Regularly audit RLS policies. Conduct thorough code reviews focused on security aspects. Utilize secure client-side storage mechanisms (e.g., HTTP-only cookies where appropriate, or secure local storage for non-sensitive data).
-   **R3: Performance Degradation under Load:**
    -   **Description:** While Supabase is scalable, excessive concurrent authentication requests could still lead to temporary performance degradation or rate-limiting by Supabase.
    -   **Mitigation:** Monitor authentication endpoint performance metrics closely. Implement client-side mechanisms to prevent excessive retries (e.g., backoff strategies). Leverage Supabase's rate-limiting capabilities and configure them appropriately.

### Assumptions

-   **A1: Supabase Auth Scalability and Reliability:** It is assumed that Supabase Auth provides sufficient scalability and reliability to handle the projected user growth for the MVP and immediate post-MVP phases without requiring custom backend authentication services.
-   **A2: Resend Email Deliverability:** It is assumed that Resend will reliably deliver transactional emails (account verification, password reset) to a wide range of email providers without significant delays or being flagged as spam.
-   **A3: Guest Mode Client-Side Usage Tracking:** For MVP, it is assumed that client-side tracking of guest mode usage limits (e.g., via browser local storage) is acceptable. Acknowledged that this is not fully tamper-proof but provides sufficient value for an MVP.

### Open Questions

-   **Q1: Guest Mode Usage Limit Configuration:** What is the precise number of free uses allowed for guest mode, and how will this value be configured and managed (e.g., environment variable, remote config, or hardcoded)?
-   **Q2: Session Management Specifics:** Are there any explicit requirements for session timeouts, refresh token rotation policies, or forced re-authentication beyond Supabase's default settings?
-   **Q3: User Profile Data (Public.Profiles):** What specific fields are required in the `public.profiles` table (e.g., username, full_name, avatar_url) and are there any specific validation rules for these fields?

## Test Strategy Summary

The testing strategy for Epic 2 will encompass a multi-level approach to ensure robust and secure user access and authentication.

-   **Unit Tests:**
    -   **Frontend:** `Jest` and `React Testing Library` will be used to test individual UI components related to authentication (e.g., `LoginForm`, `RegistrationForm`) and client-side utility functions (e.g., form validation, Supabase client initialization mocks).
    -   **Backend:** `Pytest` will cover any custom backend authentication logic (e.g., `middleware`, `security helpers`) if they exist beyond direct Supabase integration.
-   **Integration Tests:**
    -   Verify the correct interaction between frontend components and the Supabase client library (`supabase-js`), mocking Supabase API responses where necessary or using a dedicated test Supabase project.
    -   Validate that email sending through `Resend` is correctly triggered by Supabase Auth (this would largely involve verifying Supabase configurations or monitoring logs).
-   **End-to-End (E2E) Tests:**
    -   `Playwright` or `Cypress` will be used to simulate full user journeys, including:
        -   Successful user registration, email verification (simulated or real), and login.
        -   Password reset flow (request, email link, new password submission, login).
        -   Guest mode usage, hitting the limit, and successful redirection to the registration/login flow.
        -   Testing invalid credentials, missing fields, and other negative scenarios.
-   **User Acceptance Testing (UAT):**
    -   Conduct UAT with a representative group of users to validate the usability, clarity, and overall experience of the authentication flows (registration, login, guest access, password reset), ensuring they meet user expectations for a smooth and intuitive process.
-   **Security Testing:**
    -   Manual and automated security checks (e.g., vulnerability scanning) will be performed, especially focusing on correct RLS implementation and secure handling of tokens and credentials.
    -   Testing for common vulnerabilities like SQL injection (for any custom database interactions), XSS (for any user-supplied inputs), and broken authentication attempts.

