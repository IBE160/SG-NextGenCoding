# Story 1.1: initialize-project-structure-tools

Status: ready-for-dev

## Requirements Context Summary

This story, "Initialize Project Structure & Tools," lays the foundation for the `ibe160` application, aligning with Epic 1: "Foundation & Core Platform." The primary goal is to establish a robust and consistent development environment as detailed in the [PRD](./PRD.md) and [Architecture](./architecture.md) documents.

**Key Requirements & References:**

*   **Project Setup**: The project will utilize a Next.js frontend and a FastAPI backend. Initial project structure should include separate directories for `frontend`, `backend`, and `shared` code.
    *   **Frontend Initialization**: Use the `michaeltroya/supa-next-starter` template (Next.js 14, Supabase integration, Tailwind CSS, Shadcn UI, TypeScript, Jest, ESLint, Prettier, GitHub Actions for CI/CD). (`architecture.md`)
    *   **Backend Initialization**: `poetry init` (or `uv venv`), `poetry add fastapi uvicorn`. (`architecture.md`)
    *   **Dependencies**: `package.json` (frontend) and `requirements.txt` (backend) or `pyproject.toml` should be configured. (`epics.md`)
    *   **Build/Run Scripts**: Basic scripts for both frontend and backend are required. (`epics.md`)
    *   **Version Control**: `.gitignore` and `.env.example` files must be present. (`epics.md`)
*   **Technology Stack**:
    *   Frontend: Next.js 16.0.3, TypeScript, React, Tailwind CSS, Shadcn UI, Zustand, React Hook Form with Zod, Axios. (`PRD.md`)
    *   Backend: FastAPI 0.122.0 (Python), Pydantic 2.12.4, SQLModel 0.0.27. (`PRD.md`)
    *   Database & Auth: Supabase (PostgreSQL, Supabase Auth). (`PRD.md`)
    *   AI Model: Gemini 2.5 Pro/Flash. (`PRD.md`)
    *   Deployment: Vercel. (`PRD.md`)
*   **Implementation Patterns**: Adherence to defined naming conventions (e.g., PascalCase for frontend components, snake_case for database columns), structure patterns (e.g., tests co-located with code, frontend components by feature), and format patterns (e.g., API response wrapper). (`architecture.md`)
*   **Development Environment**: Prerequisites include Node.js (with pnpm) and Python (with Poetry/uv). (`architecture.md`)

This story directly supports the core goal of establishing a robust and scalable technical foundation for the `ibe160` application.

[Source: docs/PRD.md#objectives-and-scope]
[Source: docs/epics.md#Epic-1-Foundation-&-Core-Platform]
[Source: docs/architecture.md#Project-Initialization]
[Source: docs/sprint-artifacts/tech-spec-epic-1.md#acceptance-criteria-authoritative]

## Project Structure Alignment Summary

This being the first story, the focus is on establishing the foundational project structure as outlined in the [Architecture Document](./architecture.md).

*   **Expected Structure**:
    *   `/frontend/`: Next.js application
    *   `/backend/`: FastAPI application
    *   `/shared/`: Code and types shared between frontend and backend
    *   `/docs/`: Project documentation
    *   `.github/`: GitHub Actions workflows
    *   `.gitignore`
    *   `README.md`
*   **Initialization**: The project will be initialized using `michaeltroya/supa-next-starter` for the frontend and a manual FastAPI setup for the backend.
*   **No Conflicts**: As this is the initial setup, no conflicts with existing project structure or previous story learnings are anticipated.

[Source: docs/architecture.md#Project-Structure]

## Story

As a developer,
I want a well-defined project structure with essential development tools configured,
So that I can start coding efficiently and maintain consistency across the team.

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

## Tasks / Subtasks

*   **Project Scaffolding (AC: #1, #2)**
    *   [ ] Create a new repository from `https://github.com/michaeltroya/supa-next-starter`.
    *   [ ] Clone the new repository to create the `frontend` directory.
    *   [ ] Create the `backend` directory.
    *   [ ] Initialize a new Python project in the `backend` directory using `poetry init` (or `uv venv`).
    *   [ ] Create the `/shared` directory.
    *   [ ] Verify `package.json` for frontend and `pyproject.toml` (or `requirements.txt`) for backend are correctly configured. (AC: #2)

*   **Dependency Installation (AC: #2)**
    *   [ ] Run `pnpm install` in the `frontend` directory to install dependencies.
    *   [ ] Add `fastapi` and `uvicorn` as dependencies in the `backend` directory using `poetry add fastapi uvicorn`.

*   **CI/CD Pipeline (AC: #3)**
    *   [ ] Create a basic GitHub Actions workflow file in `.github/workflows/` to deploy to Vercel.
    *   [ ] Configure Vercel project settings for frontend and backend deployments.
    *   [ ] Test the CI/CD pipeline with a push to a test branch.

*   **Database and Auth Integration (AC: #4, #5, #6)**
    *   [ ] Set up a new project in Supabase.
    *   [ ] Create `users` and `files` tables in Supabase. (AC: #6)
    *   [ ] Enable Row Level Security (RLS) on the tables. (AC: #6)
    *   [ ] Add Supabase connection details to `.env.example` files in both `frontend` and `backend`. (AC: #5)
    *   [ ] Implement a Supabase client in the backend to verify connection. (AC: #4)

*   **Backend Health Check (AC: #7)**
    *   [ ] Create a `GET /api/v1/health` endpoint in the FastAPI backend.
    *   [ ] Implement logic to check database connectivity.

*   **UI Foundation (AC: #8, #9)**
    *   [ ] Verify the basic Next.js application from the starter template runs.
    *   [ ] Create a basic responsive layout with a header, main content, and footer. (AC: #8)
    *   [ ] Confirm Tailwind CSS and Shadcn UI are correctly configured and can be used for styling. (AC: #9)

*   **Version Control & Environment (AC: #5)**
    *   [ ] Create/update `.gitignore` to include necessary exclusions (e.g., `node_modules`, `__pycache__`, `.env` files).
    *   [ ] Create `.env.example` files in both `frontend` and `backend` directories with placeholder variables for Supabase keys and other secrets.

*   **Testing and Validation**
    *   [ ] (AC: #7) Write a unit test for the `/api/v1/health` endpoint.
    *   [ ] (AC: #3) Manually trigger the CI/CD pipeline and verify successful deployment to Vercel.
    *   [ ] (AC: #4) Write a script or test to confirm the backend can connect to the Supabase database.
    *   [ ] (AC: #8, #9) Manually inspect the deployed frontend to verify the basic layout and that Tailwind/Shadcn styles are applied.
    *   [ ] (AC: #6) Manually inspect the Supabase dashboard to confirm tables and RLS policies are created.

[Source: docs/epics.md#Story-1.1-Initialize-Project-Structure-&-Tools]
[Source: docs/architecture.md#Project-Initialization]

## Dev Notes

*   **Project Initialization**:
    *   Frontend: Utilize the `michaeltroya/supa-next-starter` template to initialize the Next.js project. Ensure `pnpm install` is run to install dependencies.
    *   Backend: Set up a FastAPI project using `poetry init` (or `uv venv`) and add `fastapi` and `uvicorn` as dependencies.
*   **Project Structure**:
    *   The project should adhere to the defined structure: `/frontend`, `/backend`, `/shared`, `/docs`, `.github` (for CI/CD), `.gitignore`, and `README.md`.
*   **Technical Stack (as per PRD/Architecture)**:
    *   Frontend: Next.js, TypeScript, React, Tailwind CSS, Shadcn UI.
    *   Backend: FastAPI (Python).
    *   Development Tools: Node.js (with pnpm), Python (with Poetry/uv).
*   **Implementation Patterns**:
    *   Follow established naming conventions (e.g., PascalCase for components, snake_case for database entities).
    *   Organize frontend components by feature and backend by domain.
    *   Ensure shared utilities reside in the `/shared` directory.
    *   Adhere to code formatting standards (ESLint/Prettier for frontend, Ruff for backend).
*   **References**:
    *   [Source: docs/sprint-artifacts/tech-spec-epic-1.md#acceptance-criteria-authoritative]
    *   [Source: docs/epics.md#Story-1.1-Initialize-Project-Structure-&-Tools]
    *   [Source: docs/architecture.md#Project-Initialization]
    *   [Source: docs/architecture.md#Project-Structure]
    *   [Source: docs/architecture.md#Implementation-Patterns]
    *   [Source: docs/PRD.md#objectives-and-scope]

### Architecture patterns and constraints

*   **Monorepo Structure**: The project will follow a monorepo approach with separate `frontend` and `backend` directories to decouple the two applications while keeping them in a single repository.
*   **Serverless Deployment**: The FastAPI backend will be deployed as a serverless function on Vercel to align with the frontend deployment and simplify infrastructure management.
*   **Database Schema**: The database schema will be managed through Supabase's UI and migrations. Row Level Security (RLS) will be enforced on all tables containing user data.

### Project Structure Notes

*   Alignment with unified project structure (paths, modules, naming): The initial project setup will directly establish the unified project structure.
*   Detected conflicts or variances (with rationale): None detected, as this story defines the initial structure.

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Change Log

- 2025-11-27: Initial draft created.
- 2025-11-27: Updated to align with authoritative Acceptance Criteria from `tech-spec-epic-1.md` and address validation feedback.

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-1-initialize-project-structure-tools.context.xml]

### Agent Model Used

Gemini-1.5-Pro

### Debug Log References

### Completion Notes List

### File List

## Requirements Context Summary

This story, "Initialize Project Structure & Tools," lays the foundation for the `ibe160` application, aligning with Epic 1: "Foundation & Core Platform." The primary goal is to establish a robust and consistent development environment as detailed in the [PRD](./PRD.md) and [Architecture](./architecture.md) documents.

**Key Requirements & References:**

*   **Project Setup**: The project will utilize a Next.js frontend and a FastAPI backend. Initial project structure should include separate directories for `frontend`, `backend`, and `shared` code.
    *   **Frontend Initialization**: Use the `michaeltroya/supa-next-starter` template (Next.js 14, Supabase integration, Tailwind CSS, Shadcn UI, TypeScript, Jest, ESLint, Prettier, GitHub Actions for CI/CD). (`architecture.md`)
    *   **Backend Initialization**: `poetry init` (or `uv venv`), `poetry add fastapi uvicorn`. (`architecture.md`)
    *   **Dependencies**: `package.json` (frontend) and `requirements.txt` (backend) or `pyproject.toml` should be configured. (`epics.md`)
    *   **Build/Run Scripts**: Basic scripts for both frontend and backend are required. (`epics.md`)
    *   **Version Control**: `.gitignore` and `.env.example` files must be present. (`epics.md`)
*   **Technology Stack**:
    *   Frontend: Next.js 16.0.3, TypeScript, React, Tailwind CSS, Shadcn UI, Zustand, React Hook Form with Zod, Axios. (`PRD.md`)
    *   Backend: FastAPI 0.122.0 (Python), Pydantic 2.12.4, SQLModel 0.0.27. (`PRD.md`)
    *   Database & Auth: Supabase (PostgreSQL, Supabase Auth). (`PRD.md`)
    *   AI Model: Gemini 2.5 Pro/Flash. (`PRD.md`)
    *   Deployment: Vercel. (`PRD.md`)
*   **Implementation Patterns**: Adherence to defined naming conventions (e.g., PascalCase for frontend components, snake_case for database columns), structure patterns (e.g., tests co-located with code, frontend components by feature), and format patterns (e.g., API response wrapper). (`architecture.md`)
*   **Development Environment**: Prerequisites include Node.js (with pnpm) and Python (with Poetry/uv). (`architecture.md`)

This story directly supports the core goal of establishing a robust and scalable technical foundation for the `ibe160` application.

[Source: docs/PRD.md#objectives-and-scope]
[Source: docs/epics.md#Epic-1-Foundation-&-Core-Platform]
[Source: docs/architecture.md#Project-Initialization]
[Source: docs/sprint-artifacts/tech-spec-epic-1.md#acceptance-criteria-authoritative]

## Project Structure Alignment Summary

This being the first story, the focus is on establishing the foundational project structure as outlined in the [Architecture Document](./architecture.md).

*   **Expected Structure**:
    *   `/frontend/`: Next.js application
    *   `/backend/`: FastAPI application
    *   `/shared/`: Code and types shared between frontend and backend
    *   `/docs/`: Project documentation
    *   `.github/`: GitHub Actions workflows
    *   `.gitignore`
    *   `README.md`
*   **Initialization**: The project will be initialized using `michaeltroya/supa-next-starter` for the frontend and a manual FastAPI setup for the backend.
*   **No Conflicts**: As this is the initial setup, no conflicts with existing project structure or previous story learnings are anticipated.

[Source: docs/architecture.md#Project-Structure]

## Story

As a developer,
I want a well-defined project structure with essential development tools configured,
So that I can start coding efficiently and maintain consistency across the team.

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

## Tasks / Subtasks

*   **Project Scaffolding (AC: #1, #2)**
    *   [ ] Create a new repository from `https://github.com/michaeltroya/supa-next-starter`.
    *   [ ] Clone the new repository to create the `frontend` directory.
    *   [ ] Create the `backend` directory.
    *   [ ] Initialize a new Python project in the `backend` directory using `poetry init` (or `uv venv`).
    *   [ ] Create the `/shared` directory.
    *   [ ] Verify `package.json` for frontend and `pyproject.toml` (or `requirements.txt`) for backend are correctly configured. (AC: #2)

*   **Dependency Installation (AC: #2)**
    *   [ ] Run `pnpm install` in the `frontend` directory to install dependencies.
    *   [ ] Add `fastapi` and `uvicorn` as dependencies in the `backend` directory using `poetry add fastapi uvicorn`.

*   **CI/CD Pipeline (AC: #3)**
    *   [ ] Create a basic GitHub Actions workflow file in `.github/workflows/` to deploy to Vercel.
    *   [ ] Configure Vercel project settings for frontend and backend deployments.
    *   [ ] Test the CI/CD pipeline with a push to a test branch.

*   **Database and Auth Integration (AC: #4, #5, #6)**
    *   [ ] Set up a new project in Supabase.
    *   [ ] Create `users` and `files` tables in Supabase. (AC: #6)
    *   [ ] Enable Row Level Security (RLS) on the tables. (AC: #6)
    *   [ ] Add Supabase connection details to `.env.example` files in both `frontend` and `backend`. (AC: #5)
    *   [ ] Implement a Supabase client in the backend to verify connection. (AC: #4)

*   **Backend Health Check (AC: #7)**
    *   [ ] Create a `GET /api/v1/health` endpoint in the FastAPI backend.
    *   [ ] Implement logic to check database connectivity.

*   **UI Foundation (AC: #8, #9)**
    *   [ ] Verify the basic Next.js application from the starter template runs.
    *   [ ] Create a basic responsive layout with a header, main content, and footer. (AC: #8)
    *   [ ] Confirm Tailwind CSS and Shadcn UI are correctly configured and can be used for styling. (AC: #9)

*   **Version Control & Environment (AC: #5)**
    *   [ ] Create/update `.gitignore` to include necessary exclusions (e.g., `node_modules`, `__pycache__`, `.env` files).
    *   [ ] Create `.env.example` files in both `frontend` and `backend` directories with placeholder variables for Supabase keys and other secrets.

*   **Testing and Validation**
    *   [ ] (AC: #7) Write a unit test for the `/api/v1/health` endpoint.
    *   [ ] (AC: #3) Manually trigger the CI/CD pipeline and verify successful deployment to Vercel.
    *   [ ] (AC: #4) Write a script or test to confirm the backend can connect to the Supabase database.
    *   [ ] (AC: #8, #9) Manually inspect the deployed frontend to verify the basic layout and that Tailwind/Shadcn styles are applied.
    *   [ ] (AC: #6) Manually inspect the Supabase dashboard to confirm tables and RLS policies are created.

[Source: docs/epics.md#Story-1.1-Initialize-Project-Structure-&-Tools]
[Source: docs/architecture.md#Project-Initialization]

## Dev Notes

*   **Project Initialization**:
    *   Frontend: Utilize the `michaeltroya/supa-next-starter` template to initialize the Next.js project. Ensure `pnpm install` is run to install dependencies.
    *   Backend: Set up a FastAPI project using `poetry init` (or `uv venv`) and add `fastapi` and `uvicorn` as dependencies.
*   **Project Structure**:
    *   The project should adhere to the defined structure: `/frontend`, `/backend`, `/shared`, `/docs`, `.github` (for CI/CD), `.gitignore`, and `README.md`.
*   **Technical Stack (as per PRD/Architecture)**:
    *   Frontend: Next.js, TypeScript, React, Tailwind CSS, Shadcn UI.
    *   Backend: FastAPI (Python).
    *   Development Tools: Node.js (with pnpm), Python (with Poetry/uv).
*   **Implementation Patterns**:
    *   Follow established naming conventions (e.g., PascalCase for components, snake_case for database entities).
    *   Organize frontend components by feature and backend by domain.
    *   Ensure shared utilities reside in the `/shared` directory.
    *   Adhere to code formatting standards (ESLint/Prettier for frontend, Ruff for backend).
*   **References**:
    *   [Source: docs/sprint-artifacts/tech-spec-epic-1.md#acceptance-criteria-authoritative]
    *   [Source: docs/epics.md#Story-1.1-Initialize-Project-Structure-&-Tools]
    *   [Source: docs/architecture.md#Project-Initialization]
    *   [Source: docs/architecture.md#Project-Structure]
    *   [Source: docs/architecture.md#Implementation-Patterns]
    *   [Source: docs/PRD.md#objectives-and-scope]

### Architecture patterns and constraints

*   **Monorepo Structure**: The project will follow a monorepo approach with separate `frontend` and `backend` directories to decouple the two applications while keeping them in a single repository.
*   **Serverless Deployment**: The FastAPI backend will be deployed as a serverless function on Vercel to align with the frontend deployment and simplify infrastructure management.
*   **Database Schema**: The database schema will be managed through Supabase's UI and migrations. Row Level Security (RLS) will be enforced on all tables containing user data.

### Project Structure Notes

*   Alignment with unified project structure (paths, modules, naming): The initial project setup will directly establish the unified project structure.
*   Detected conflicts or variances (with rationale): None detected, as this story defines the initial structure.

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]

## Change Log

- 2025-11-27: Initial draft created.
- 2025-11-27: Updated to align with authoritative Acceptance Criteria from `tech-spec-epic-1.md` and address validation feedback.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Gemini-1.5-Pro

### Debug Log References

### Completion Notes List

### File List
