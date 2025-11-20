# ibe160 - Epic Breakdown

**Author:** BIP
**Date:** torsdag 20. november 2025
**Project Level:** Level 3
**Target Scale:** Medium

---

## Overview

This document provides the complete epic and story breakdown for ibe160, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Proposed Epic Structure

The following epic breakdown organizes the project into logical, value-driven phases, ensuring a solid foundation and a clear progression towards delivering the core product vision.

#### **Epic 1: Foundation & Core Platform**
*   **Goal:** Establish the basic technical infrastructure, deployment pipeline, core security, data handling, and fundamental UI elements.
*   **Scope:** Project setup, repository structure, build system, deployment pipeline, core dependencies, Supabase integration (initial setup, Row Level Security), basic FastAPI API setup, initial UI framework (Next.js, Tailwind, Shadcn UI basics), **basic data persistence for user profiles and uploaded file metadata**.

#### **Epic 2: User Access & Authentication**
*   **Goal:** Enable users to securely access and manage their accounts, including a guest mode for initial trials.
*   **Scope:** User registration, login, logout, password reset, email verification, guest mode implementation, integration with Supabase Auth.

#### **Epic 3: Content Ingestion & AI Summarization**
*   **Goal:** Allow users to upload lecture notes and receive AI-generated summaries.
*   **Scope:** File upload (PDF, TXT, DOCX), file validation, text extraction, integration with Gemini 2.5 for summarization, displaying the summary in the UI.

#### **Epic 4: Interactive Quiz Generation & Feedback**
*   **Goal:** Provide users with interactive AI-generated quizzes and a mechanism to provide feedback on the content.
*   **Scope:** AI quiz generation (Gemini 2.5), quiz UI, answer submission, basic result display, content feedback mechanism.

#### **Epic 5: History, Review & Advanced UI**
*   **Goal:** Enable users to review their past learning activities and enhance the overall user experience and accessibility.
*   **Scope:** Displaying user history (past summaries, quizzes, results), advanced UI interactions, and ensuring full WCAG 2.1 AA compliance for the entire application.

### Refined Suggested Epic Sequencing

1.  **Epic 1: Foundation & Core Platform**
2.  **Epic 2: User Access & Authentication**
3.  **Epic 3: Content Ingestion & AI Summarization**
4.  **Epic 4: Interactive Quiz Generation & Feedback**
5.  **Epic 5: History, Review & Advanced UI**

---

## Epic Breakdown Summary

The complete epic and story breakdown has been reviewed for quality and completeness.

**Key Validations:**
*   **Comprehensive Coverage:** All functional requirements detailed in the Product Requirements Document (PRD) are covered across the defined epics and their constituent stories.
*   **Solid Foundation:** Epic 1 (Foundation & Core Platform) effectively establishes the necessary technical infrastructure, deployment pipelines, core security, and fundamental UI elements as a prerequisite for all subsequent development.
*   **Vertical Slicing:** Stories are vertically sliced, ensuring that each delivers a complete, small piece of functionality.
*   **Logical Dependencies:** Prerequisites are clearly defined, and no forward dependencies have been identified, maintaining a clear development flow.
*   **Appropriate Sizing:** Stories are sized for single-session developer completion, promoting agility and maintainable increments.
*   **Clear Acceptance Criteria:** BDD-style acceptance criteria (Given/When/Then) are clear, precise, and testable for each story.
*   **Distributed Compliance:** Domain-specific and compliance requirements (e.g., data privacy, WCAG 2.1 AA, ethical AI) are integrated and addressed across relevant epics and stories.
*   **Incremental Value:** The proposed epic sequencing (Foundation → User Access → Core AI Features → History/Review/Advanced UI) is designed to enable continuous, incremental value delivery.

This breakdown provides an actionable roadmap for the architecture and implementation phases. It ensures a systematic approach to building the `ibe160` application while prioritizing user value and technical robustness.

<!-- Repeat for each epic (N = 1, 2, 3...) -->

## Epic 1: Foundation & Core Platform

Establish the basic technical infrastructure, deployment pipeline, core security, data handling, and fundamental UI elements.

**Note on Parallel Work**: Stories 1.2, 1.3, and 1.4 can be worked on in parallel after Story 1.1 is complete.

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story 1.1: Initialize Project Structure & Tools

As a developer,
I want a well-defined project structure with essential development tools configured,
So that I can start coding efficiently and maintain consistency across the team.

**Acceptance Criteria:**

**Given** a new project,
**When** setting up the development environment,
**Then** the repository contains separate directories for frontend (Next.js), backend (FastAPI), and shared configurations.

**And** `package.json` for frontend, `requirements.txt` for backend, and `pyproject.toml` are configured with initial dependencies.

**And** basic build and run scripts are defined for both frontend and backend.

**And** `.gitignore` and `.env.example` files are present and correctly configured.

**Prerequisites:** None

Scope: MVP

**Technical Notes:** This story covers initial `npm init`, `npx create-next-app`, `poetry init` or `pipenv init`, basic file structure.

### Story 1.2: Set Up CI/CD & Deployment Pipeline

As a developer,
I want automated deployment for frontend and backend,
So that I can quickly and reliably deploy changes to development environments.

**Acceptance Criteria:**

**Given** a code commit to the main branch,
**When** the CI/CD pipeline runs,
**Then** the Next.js frontend is deployed to Vercel.

**And** the FastAPI backend is deployed to Vercel (or a suitable serverless function if using Vercel for backend).

**And** unit tests (if any exist) are run successfully before deployment.

**Prerequisites:** Story 1.1

Scope: MVP

**Technical Notes:** This involves Vercel project setup, linking GitHub repository, and configuring Vercel for both frontend and backend.

### Story 1.3: Integrate Supabase for Basic Data & Auth

As a developer,
I want Supabase to be integrated,
So that I can manage basic user data and authentication state.

**Acceptance Criteria:**

**Given** a Supabase project is created,
**When** configuring the application,
**Then** the application can connect to Supabase.

**And** environment variables for Supabase URL and Anon Key are configured.

**And** a basic `users` table (or similar) is created with Row Level Security (RLS) enabled and configured to allow authenticated users to read their own data.

**And** a basic API endpoint for checking Supabase connection status exists.

**Prerequisites:** Story 1.1

Scope: MVP

FRs: [FR-DM-1]

**Technical Notes:** Supabase project setup, API key management, basic RLS policies, installing Supabase client libraries in frontend/backend.

### Story 1.4: Implement Initial UI Layout & Theming

As a UX designer / developer,
I want a basic, consistent UI layout and theming,
So that subsequent feature development has a visual foundation.

**Acceptance Criteria:**

**Given** the Next.js project is set up,
**When** viewing the application,
**Then** a responsive basic layout (e.g., header, main content area, footer) is visible.

**And** Tailwind CSS is integrated and a basic theme (colors, typography) is applied.

**And** Shadcn UI components (e.g., Button, Card) can be imported and used.

**Prerequisites:** Story 1.1

Scope: MVP

FRs: [FR-UI-1]

**Technical Notes:** Tailwind configuration, Shadcn UI setup instructions.

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}

**And** {{additional_criteria}}

**Prerequisites:** {{dependencies_on_previous_stories}}

**Technical Notes:** {{implementation_guidance}}

<!-- End story repeat -->

---

<!-- End epic repeat -->

## Epic 5: History, Review & Advanced UI

Enable users to review their past learning activities and enhance the overall user experience and accessibility.

### Story 5.1: View History of Summaries and Quizzes

As a logged-in user,
I want to see a list of my past summaries and quizzes,
So that I can easily access and review my previous learning materials.

**Acceptance Criteria:**

**Given** I am logged in,
**When** I navigate to my "History" or "Dashboard" section,
**Then** I see a chronological list of my generated summaries and quizzes.

**And** each item in the list shows basic details (e.g., date, document title, type).

**And** I can click on an item to view its full content.

**Prerequisites:** Epic 2 (Story 2.2), Epic 3 (Story 3.4), Epic 4 (Story 4.3), Epic 1 (Story 1.3 - Data Persistence)

Scope: MVP

FRs: [FR-DM-1]

**Technical Notes:** FastAPI endpoints for fetching user history, Supabase queries, UI components for displaying lists.

### Story 5.2: Review Past Quiz Results and Answers

As a logged-in user,
I want to review my past quiz attempts, including my answers and the correct answers,
So that I can identify areas where I need to improve.

**Acceptance Criteria:**

**Given** I am viewing a past quiz from my history,
**When** I select a quiz attempt,
**Then** I see the questions, my submitted answers, and the correct answers.

**And** my score for that attempt is clearly visible.

**Prerequisites:** Story 5.1

Scope: MVP

FRs: [FR-DM-1]

**Technical Notes:** FastAPI endpoint for fetching detailed quiz results, UI for presenting question-answer review.

### Story 5.3: Full WCAG 2.1 AA Compliance Audit & Remediation

As a user with disabilities,
I want to use the application with assistive technologies and without barriers,
So that I have an equitable learning experience.

**Acceptance Criteria:**

**Given** the application has implemented all core features,
**When** an accessibility audit is performed against WCAG 2.1 AA guidelines,
**Then** all critical issues are identified and remediated.

**And** the application is fully navigable and usable via keyboard.

**Prerequisites:** All other epics' stories are largely complete.

Scope: MVP

FRs: [FR-UI-1]

**Technical Notes:** Manual and automated accessibility testing tools, knowledge of WCAG guidelines, remediation of identified issues.

### Story 5.4: Implement Advanced UI Interactions & Polish

As a user,
I want a highly polished and smooth user experience,
So that the application feels professional and delightful to use.

**Acceptance Criteria:**

**Given** core functionalities are implemented,
**When** interacting with the application,
**Then** UI animations are smooth and transitions are seamless.

**And** minor UI inconsistencies are resolved.

**And** the application provides clear visual feedback for all user actions.

**Prerequisites:** All other epics' stories are largely complete.

Scope: MVP

FRs: [FR-UI-1]

**Technical Notes:** Focus on CSS refinements, minor JS/React optimizations, attention to detail in UI/UX.

## Epic 4: Interactive Quiz Generation & Feedback

Provide users with interactive AI-generated quizzes and a mechanism to provide feedback on the content.

### Story 4.1: AI Quiz Generation Integration

As a user,
I want to receive relevant quiz questions based on my lecture notes or summary,
So that I can actively test my understanding.

**Acceptance Criteria:**

**Given** I have uploaded a file and its text has been extracted,
**When** I request a quiz,
**Then** an AI model (Gemini 2.5) generates a set of quiz questions (e.g., multiple-choice, true/false, short answer) with correct answers based on the content.

**And** the quiz is generated within a specified performance threshold (e.g., under 30 seconds).

**And** ethical AI guidelines are followed to minimize bias and ensure factual accuracy.

**Prerequisites:** Epic 3 (Story 3.2: Text Extraction from Uploaded Files)

Scope: MVP

FRs: [FR-ILA-1]

**Technical Notes:** FastAPI endpoint for quiz generation, Google Gemini API integration, prompt engineering for quiz generation.

### Story 4.2: Interactive Quiz User Interface

As a user,
I want an intuitive interface to take the generated quizzes,
So that my learning experience is engaging and effective.

**Acceptance Criteria:**

**Given** a quiz has been generated,
**When** I start the quiz,
**Then** questions are presented one at a time.

**And** I can select or input my answers.

**And** I can navigate between questions (e.g., next/previous).

**Prerequisites:** Story 4.1

Scope: MVP

FRs: [FR-ILA-1]

**Technical Notes:** React components for quiz display, state management for user answers.

### Story 4.3: Quiz Answer Submission and Basic Results

As a user,
I want to submit my answers and see my performance,
So that I can identify my knowledge gaps.

**Acceptance Criteria:**

**Given** I have completed a quiz,
**When** I submit my answers,
**Then** the system compares my answers to the correct answers.

**And** my score is displayed (e.g., number correct out of total).

**And** I can review which questions I answered correctly or incorrectly.

**Prerequisites:** Story 4.2

Scope: MVP

FRs: [FR-ILA-1]

**Technical Notes:** FastAPI endpoint for quiz submission and grading, UI for displaying results.

### Story 4.4: Content Quality Feedback Mechanism

As a user,
I want to provide feedback on the quality of AI-generated summaries and quizzes,
So that the system can continuously improve.

**Acceptance Criteria:**

**Given** I am viewing a generated summary or quiz,
**When** I click a "Rate this" or "Report Issue" button,
**Then** a simple feedback form appears (e.g., 1-5 stars, free text comment).

**And** my feedback is securely recorded.

**Prerequisites:** Epic 3 (Story 3.4), Story 4.3

Scope: MVP

FRs: [FR-ILA-2]

**Technical Notes:** FastAPI endpoint for feedback submission, Supabase table for feedback data, UI for feedback collection.

## Epic 3: Content Ingestion & AI Summarization

Allow users to upload their lecture notes and receive AI-generated summaries.

### Story 3.1: File Upload Interface

As a user,
I want to easily upload my lecture notes in PDF, TXT, or DOCX format,
So that the system can process them.

**Acceptance Criteria:**

**Given** I am on the file upload page,
**When** I drag and drop a file or use the file selector,
**Then** the selected file's name and type are displayed.

**And** only PDF, TXT, and DOCX files are accepted.

**And** files exceeding 20MB are rejected with an error message.

**Prerequisites:** Epic 1 (Story 1.4), Epic 2 (Story 2.2/2.3)

Scope: MVP

FRs: [FR-CIP-1]

**Technical Notes:** HTML file input, drag-and-drop handler, client-side file type and size validation.

### Story 3.2: Text Extraction from Uploaded Files

As a user,
I want the system to accurately extract text from my uploaded lecture notes,
So that the AI can process the content for summaries and quizzes.

**Acceptance Criteria:**

**Given** I upload a supported file (PDF, TXT, DOCX),
**When** the file is received by the backend,
**Then** the text content is successfully extracted from the file.

**And** the extracted text is available for subsequent AI processing.

**Prerequisites:** Story 3.1

Scope: MVP

FRs: [FR-CIP-2]

**Technical Notes:** Backend libraries for parsing PDF (e.g., `PyPDF2`), DOCX (e.g., `python-docx`), and TXT files. Error handling for corrupted files.

### Story 3.3: AI Summary Generation Integration

As a user,
I want to receive a concise summary of my lecture notes,
So that I can quickly grasp the key concepts.

**Acceptance Criteria:**

**Given** I have uploaded a file and its text has been extracted,
**When** I request a summary,
**Then** an AI model (Gemini 2.5) generates a summary of the content.

**And** the summary is displayed to me in a readable format within a specified performance threshold (e.g., under 30 seconds).

**And** ethical AI guidelines are followed to minimize bias and ensure factual accuracy.

**Prerequisites:** Story 3.2

Scope: MVP

FRs: [FR-CIP-2]

**Technical Notes:** FastAPI endpoint for summary generation, Google Gemini API integration, prompt engineering for summarization, asynchronous task handling (queuing system).

### Story 3.4: Display Summary in User Interface

As a user,
I want to view my generated summary clearly and intuitively,
So that I can easily review the key points.

**Acceptance Criteria:**

**Given** a summary has been generated,
**When** I navigate to the summary view,
**Then** the summary content is presented in an easy-to-read format (e.g., markdown rendering).

**And** I can copy the summary text.

**Prerequisites:** Story 3.3

Scope: MVP

FRs: [FR-CIP-2]

**Technical Notes:** Markdown renderer component, UI for displaying the summary.

## Epic 2: User Access & Authentication

Enable users to securely access and manage their accounts, including a guest mode for trials.

### Story 2.1: User Registration with Email and Password

As a new user,
I want to create an account using my email and a secure password,
So that I can access personalized features and save my progress.

**Acceptance Criteria:**

**Given** I am on the registration page,
**When** I provide a valid email and password (and confirm password),
**Then** my account is created in Supabase Auth.

**And** a confirmation email is sent to my provided email address.

**And** I am redirected to a success page or login.

**Prerequisites:** Epic 1 (Story 1.3: Integrate Supabase for Basic Data & Auth, Story 1.4: Implement Initial UI Layout & Theming)

Scope: MVP

FRs: [FR-UM-1]

**Technical Notes:** Supabase Auth `signUp` function, form validation with React Hook Form and Zod, Next.js API route for handling registration.

### Story 2.2: User Login and Session Management

As a registered user,
I want to log in to my account,
So that I can access my saved content and continue my learning journey.

**Acceptance Criteria:**

**Given** I have a registered account,
**When** I enter my correct email and password on the login page,
**Then** I am authenticated via Supabase Auth.

**And** a session is established, allowing me access to protected routes.

**Prerequisites:** Story 2.1

Scope: MVP

FRs: [FR-UM-1]

**Technical Notes:** Supabase Auth `signInWithPassword` function, JWT handling, protected routes in Next.js.

### Story 2.3: Guest Access for Core Features

As a potential user,
I want to try the core summary and quiz generation features without immediate registration,
So that I can experience the value of the application before committing to an account.

**Acceptance Criteria:**

**Given** I am an unauthenticated user,
**When** I visit the application,
**Then** I can access the file upload and content generation features for a limited number of uses (e.g., 2 free uses).

**And** after reaching the limit, the system prompts me to register or log in to continue.

**Prerequisites:** Epic 1 (Story 1.3), Story 2.1, Story 2.2

Scope: MVP

FRs: [FR-UM-2]

**Technical Notes:** Client-side tracking of guest uses (e.g., local storage), conditional rendering based on authentication status and use count.

### Story 2.4: Password Reset and Email Verification

As a user,
I want to reset my password if I forget it and verify my email address,
So that I can maintain access to my account and ensure its security.

**Acceptance Criteria:**

**Given** I forget my password,
**When** I initiate the password reset process,
**Then** I receive a password reset link in my email.

**And** I can set a new password via the link.

**Given** I register,
**When** I receive a verification email,
**Then** clicking the link verifies my email address.

**Prerequisites:** Story 2.1

Scope: MVP

FRs: [FR-UM-1]

**Technical Notes:** Supabase Auth password recovery and email verification flows.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._
