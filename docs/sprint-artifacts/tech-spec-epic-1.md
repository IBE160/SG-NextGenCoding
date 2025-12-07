# Epic Technical Specification: Foundation & Core Platform

Date: 2025-11-27
Author: BIP
Epic ID: 1
Status: Draft

---

## Overview

This epic establishes the foundational infrastructure for the ibe160 project. It encompasses the creation of the project structure, continuous integration and deployment pipelines, and the integration of core technologies such as Supabase for the database and Next.js with Tailwind CSS for the frontend. The primary goal is to create a stable and scalable platform upon which all future features, such as user authentication and AI-powered content generation, will be built. This directly supports the project's long-term objective of providing an efficient and engaging learning tool for students and teachers.

## Objectives and Scope

**In-Scope:**

*   **Project Scaffolding:** Initialize the monorepo structure with distinct `frontend` (Next.js) and `backend` (FastAPI) directories.
*   **CI/CD Pipeline:** Configure a basic CI/CD pipeline using GitHub Actions to automatically deploy the frontend and backend to Vercel.
*   **Database and Auth Integration:** Set up a Supabase project and integrate the Supabase client into the application, including initial configuration for database access and RLS.
*   **UI Foundation:** Implement the basic UI layout using Next.js, including a primary navigation structure, and integrate Tailwind CSS and Shadcn UI for theming and component use.
*   **Data Persistence:** Create the initial database schema for user profiles and file metadata.

**Out-of-Scope:**

*   User-facing authentication features (login, registration).
*   File uploading and processing logic.
*   AI model integration for summaries or quizzes.
*   Any application business logic beyond basic connectivity checks.

## System Architecture Alignment

This epic directly implements the initial phase of the architecture defined in the `architecture.md` document. The work focuses on establishing the `frontend/` (Next.js), `backend/` (FastAPI), and `.github/` (CI/CD) components. It sets up the Vercel deployment target and integrates Supabase for data and authentication, as specified in the architectural decisions. This foundational work ensures that subsequent epics can build upon a consistent and well-defined technical landscape.

## Detailed Design

### Services and Modules

| Service/Module | Responsibilities | Inputs/Outputs | Owner |
|---|---|---|---|
| **Frontend (Next.js)** | Render the user interface, manage client-side state, and handle user interactions. | **Inputs:** User actions, API responses. **Outputs:** API requests, rendered HTML/CSS. | TBD |
| **Backend (FastAPI)** | Provide a RESTful API, handle business logic, and interact with the database. | **Inputs:** API requests. **Outputs:** API responses, database queries. | TBD |
| **CI/CD (GitHub Actions)** | Automate testing and deployment of the frontend and backend applications. | **Inputs:** Code commits. **Outputs:** Deployment to Vercel. | TBD |

### Data Models and Contracts

The initial database schema will be created in Supabase.

**`users` Table:**
Stores public user profile information. This will be linked to the `auth.users` table provided by Supabase.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Foreign Key to `auth.users.id` | The unique identifier for the user. |
| `created_at` | `timestamp with time zone` | Not Null, Default `now()` | The timestamp when the user was created. |
| `full_name` | `text` | | The user's full name. |

**`files` Table:**
Stores metadata for uploaded files.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` | The unique identifier for the file. |
| `user_id` | `uuid` | Foreign Key to `users.id` | The user who uploaded the file. |
| `created_at` | `timestamp with time zone` | Not Null, Default `now()` | The timestamp when the file was uploaded. |
| `file_name` | `text` | | The original name of the uploaded file. |
| `storage_path` | `text` | | The path to the file in Supabase Storage. |

### APIs and Interfaces

A single health-check endpoint will be created in the backend to verify connectivity.

*   **Endpoint:** `GET /api/v1/health`
*   **Description:** Checks the service status, including database connectivity.
*   **Request:** None
*   **Response (Success):**
    *   **Status:** `200 OK`
    *   **Body:**
        ```json
        {
          "status": "ok",
          "database": "connected"
        }
        ```
*   **Response (Error):**
    *   **Status:** `503 Service Unavailable`
    *   **Body:**
        ```json
        {
          "status": "error",
          "database": "disconnected"
        }
        ```

### Workflows and Sequencing

**CI/CD Workflow:**

1.  **Trigger:** A developer pushes a commit to the `main` branch of the GitHub repository.
2.  **Job Start:** GitHub Actions triggers the deployment workflow.
3.  **Run Tests:** The workflow executes any unit tests for both the frontend and backend. If tests fail, the workflow stops.
4.  **Deploy Frontend:** The Next.js application is deployed to Vercel.
5.  **Deploy Backend:** The FastAPI application (as a serverless function) is deployed to Vercel.
6.  **Completion:** The workflow reports the status of the deployment.

## Non-Functional Requirements

### Performance

The selection of Vercel for deployment and a serverless backend architecture with FastAPI is intended to provide a highly scalable foundation. For this epic, performance targets are focused on the development and deployment pipeline:
*   **CI/CD Pipeline Execution:** The pipeline should complete in under 5 minutes.
*   **API Response Time:** The `/api/v1/health` endpoint must respond in under 500ms.

### Security

Security for this epic is centered on establishing a secure foundation for data handling, as outlined in the PRD and Architecture documents.
*   **Data Protection:** All user data will be encrypted at rest and in transit by Supabase and Vercel.
*   **Authorization:** Row Level Security (RLS) will be enabled on all tables containing user data. The initial policy will ensure that users can only read their own data in the `users` table.
*   **Secrets Management:** All sensitive keys (Supabase URL, API keys) will be managed through environment variables and will not be hardcoded in the application.

### Reliability/Availability

The reliability of the platform for this epic is tied to the reliability of the chosen cloud providers.
*   **Uptime:** The application will be subject to the uptime guarantees provided by Vercel and Supabase.
*   **Automated Deployments:** The CI/CD pipeline ensures that deployments are repeatable and reliable, reducing the risk of human error.

### Observability

Observability for this epic will be minimal, focusing on providing basic insights into the health of the system.
*   **Logging:** Basic console logging will be implemented in the backend for critical events, suchs as application startup and database connection errors.
*   **Health Check:** The `/api/v1/health` endpoint provides a basic mechanism for monitoring the health of the backend service.

## Dependencies and Integrations

This epic introduces the following key dependencies and integration points:

**Frontend (`package.json`):**
*   `next`: Core React framework.
*   `react`, `react-dom`: UI library.
*   `tailwindcss`: CSS framework.
*   `@supabase/supabase-js`: Client library for interacting with Supabase.
*   `shadcn-ui`, `lucide-react`: UI component library.
*   `typescript`, `@types/react`, `@types/node`: Type checking.
*   `eslint`, `prettier`: Code linting and formatting.

**Backend (`pyproject.toml` or `requirements.txt`):**
*   `fastapi`: Web framework for the API.
*   `uvicorn`: ASGI server for running FastAPI.
*   `supabase`: Python client for Supabase.
*   `pydantic`: Data validation.
*   `python-dotenv`: For managing environment variables.

**Integrations:**
*   **GitHub:** Source code management and trigger for CI/CD.
*   **Vercel:** Deployment and hosting for both frontend and backend.
*   **Supabase:** Managed PostgreSQL database and authentication service.

## Acceptance Criteria (Authoritative)

1.  The repository must contain distinct `frontend` and `backend` directories.
2.  The frontend and backend must have their own dependency management files (`package.json` and `pyproject.toml`/`requirements.txt`).
3.  A CI/CD pipeline in GitHub Actions must successfully deploy the frontend and backend to Vercel on a push to `main`.
4.  The application must successfully connect to the Supabase database.
5.  Supabase environment variables must be securely managed and not exposed in the codebase.
6.  The `users` and `files` tables must be created in Supabase with RLS enabled.
7.  The backend must provide a `GET /api/v1/health` endpoint that returns a `200 OK` status when the service is healthy.
8.  The frontend must render a basic responsive layout with a header, main content area, and footer.
9.  Tailwind CSS and Shadcn UI must be integrated and functional in the Next.js application.

## Traceability Mapping

| Acceptance Criterion | Spec Section(s) | Component(s)/API(s) | Test Idea |
|---|---|---|---|
| AC #1 | Detailed Design > Services and Modules | Project file structure | Manual verification of directory structure. |
| AC #2 | Dependencies and Integrations | `frontend/package.json`, `backend/pyproject.toml` | Manual verification of dependency files. |
| AC #3 | Workflows and Sequencing | `.github/workflows/deploy.yml` | Integration test: Push to `main` and verify deployment on Vercel. |
| AC #4 | Security, APIs and Interfaces | `backend/main.py` | Integration test: The `GET /api/v1/health` endpoint should return `"database": "connected"`. |
| AC #5 | Security | `.env.local`, Vercel environment settings | Manual verification of environment variable configuration. |
| AC #6 | Data Models and Contracts | Supabase Studio | Manual verification of table creation and RLS policies in Supabase. |
| AC #7 | APIs and Interfaces | `backend/main.py`, `GET /api/v1/health` | Unit test for the `/health` endpoint logic; Integration test to call the deployed endpoint. |
| AC #8, #9 | Objectives and Scope | `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx` | E2E test: Load the application in a browser and verify the layout and styling. |

## Risks, Assumptions, Open Questions

*   **Risk:** The initial setup of the CI/CD pipeline may be more complex than anticipated, potentially causing delays.
    *   **Mitigation:** Allocate sufficient time for pipeline configuration and testing. Refer to Vercel and GitHub Actions documentation for best practices.
*   **Assumption:** The free tiers of Vercel and Supabase will be sufficient for the initial development and testing phases.
    *   **Next Step:** Monitor usage and be prepared to upgrade to a paid plan if necessary.
*   **Question:** What is the definitive strategy for database schema migrations?
    *   **Next Step:** Formally adopt a migration tool like Alembic for the backend and establish a clear workflow for creating and applying migrations. This should be addressed at the beginning of Epic 2.

## Test Strategy Summary

The test strategy for this foundational epic is focused on ensuring the core infrastructure is stable and reliable.

*   **Unit Tests:**
    *   **Backend:** A unit test will be created for the `GET /api/v1/health` endpoint to verify its logic in isolation.
*   **Integration Tests:**
    *   An integration test will be added to the CI/CD pipeline to make a live call to the deployed `GET /api/v1/health` endpoint to ensure the backend is running and connected to the database.
*   **End-to-End (E2E) Tests:**
    *   A simple E2E test will be configured to load the homepage of the deployed frontend application and verify that the main layout components are rendered correctly.
*   **Manual Testing:**
    *   The file structure, dependency files, and Supabase schema will be manually verified against the specifications.
