# Story 1.2: Set Up CI/CD & Build Pipeline

Status: drafted

## Story

As a developer,
I want automated deployment for frontend and backend,
So that I can quickly and reliably deploy changes to development environments.

## Acceptance Criteria

**Given** a code commit to the main branch,
**When** the CI/CD pipeline runs,
Then the Next.js frontend is built successfully and ready for local execution.

**And** the FastAPI backend is built successfully and ready for local execution.

**And** unit tests (if any exist) are run successfully before deployment.

## Tasks / Subtasks

*   **CI/CD Pipeline Setup (AC: #1, #2, #3)**
    *   [ ] Create `.github/workflows/main.yml` for CI/CD.
    *   [ ] Configure workflow to trigger on push to `main` branch.
    *   [ ] Add a step to install frontend dependencies (`pnpm install`).
    *   [ ] Add a step to install backend dependencies (`poetry install` or `uv pip install`).
    *   [ ] Add a step to run frontend tests (if any) (e.g., `pnpm test`).
    *   [ ] Add a step to run backend tests (if any) (e.g., `poetry run pytest`).
    *   [ ] Add a step to build the Next.js frontend (e.g., `pnpm build`).
    *   [ ] Add a step to build the FastAPI backend (e.g., any necessary pre-compilation steps if applicable, though typically Python doesn't require this).

*   **Local Build and Run Validation**
    *   [ ] Verify the CI/CD pipeline runs successfully on a push to `main`. (AC: #1, #2, #3)
    *   [ ] Confirm successful local build of frontend (e.g., `pnpm build` completes without errors). (AC: #1)
    *   [ ] Confirm successful local execution of frontend (e.g., `pnpm dev` starts and serves the application). (AC: #1)
    *   [ ] Confirm successful local build of backend. (AC: #2)
    *   [ ] Confirm successful local execution of backend (e.g., `uvicorn app.main:app --reload` starts and serves the API). (AC: #2)
    *   [ ] Validate that all existing unit tests (frontend and backend) are executed successfully within the pipeline. (AC: #3)

[Source: docs/architecture.md#Deployment-Architecture]
[Source: docs/architecture.md#Development-Environment]
[Source: docs/architecture.md#Project-Structure]
[Source: docs/epics.md#Story-1.2-Set-Up-CI/CD-&-Deployment-Pipeline]

## Dev Notes

*   **Project Initialization**: This story builds upon the initial project setup completed in Story 1.1. Ensure the monorepo structure with `frontend`, `backend`, and `shared` directories is respected.
*   **CI/CD Pipeline**:
    *   The primary task is to set up GitHub Actions workflows for automated deployment.
    *   Ensure proper installation of frontend (pnpm) and backend (poetry/uv) dependencies within the CI environment.
    *   Integrate existing unit tests for both frontend and backend into the pipeline.
*   **Local Build and Execution**:
    *   Focus on configuring local build processes for both Next.js frontend and FastAPI backend.
    *   The FastAPI backend will be executed locally using `uvicorn`.
*   **Learnings from Previous Story (Story 1.1)**:
    *   **Architectural Decisions**: Monorepo Structure, and Supabase-managed Database Schema with RLS are confirmed. Local execution is the current deployment target.
    *   **Warnings/Recommendations**: From the previous story review, there is a pending item: "Verifying backend Supabase connection after environment variables are set and Supabase project is configured (locally). (AC #4)". This is important for local testing of the backend within the CI/CD context.
    *   **Review Findings**: Story 1.1 was "Approved with reservations for further testing (local)". Key findings included correct backend health check implementation, frontend layout, and `.env.example` files. These should serve as a solid base.

### Architecture patterns and constraints

*   **Monorepo Structure**: Continued adherence to the monorepo approach for decoupled applications within a single repository.
*   **Local Deployment**: Focus on local execution of both frontend and backend for development and testing purposes.
*   **Database Schema**: Supabase's UI and migrations for schema management, with RLS enforced for data security.
*   **CI/CD Best Practices**: Implement robust CI/CD practices using GitHub Actions to ensure automated testing and reliable builds.

### Project Structure Notes

*   Alignment with unified project structure (paths, modules, naming): The CI/CD configuration files will reside in `.github/workflows/`, maintaining the established project structure.
*   Detected conflicts or variances (with rationale): None, this story is extending the existing structure.

### References

*   [Source: docs/architecture.md#Deployment-Architecture]
*   [Source: docs/architecture.md#Development-Environment]
*   [Source: docs/architecture.md#Project-Structure]
*   [Source: docs/epics.md#Story-1.2-Set-Up-CI/CD-&-Deployment-Pipeline]
*   [Source: docs/sprint-artifacts/1-1-initialize-project-structure-tools.md#Senior-Developer-Review-(AI)---Follow-up]

## Change Log

- 2025-11-28: Initial draft created by BMAD SM Agent.

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Requirements Context Summary

This story, "Set Up CI/CD & Build Pipeline," aligns with Epic 1: "Foundation & Core Platform." It establishes the automated build process for both the frontend and backend, ensuring quick and reliable builds as detailed in the [PRD](./PRD.md) and [Architecture](./architecture.md) documents.

**Key Requirements & References:**

*   **Automated Build**: The CI/CD pipeline should automatically build the Next.js frontend and FastAPI backend upon code commit to the main branch, making them ready for local execution. (`epics.md`)
*   **Unit Tests**: Unit tests should be run successfully before deployment. (`epics.md`)
*   **Local Execution Environment**: Frontend (Next.js) and Backend (FastAPI). (`architecture.md`)
*   **CI/CD Tooling**: GitHub Actions will be used for CI/CD workflows (for automated testing only). (`architecture.md`)
*   **Project Structure**: `.github/` directory for GitHub Actions workflows. (`architecture.md`)

This story is crucial for establishing a streamlined development workflow and enabling continuous integration.

[Source: docs/epics.md#Story-1.2-Set-Up-CI/CD-&-Deployment-Pipeline]
[Source: docs/architecture.md#Deployment-Architecture]
[Source: docs/architecture.md#Development-Environment]
[Source: docs/architecture.md#Project-Structure]