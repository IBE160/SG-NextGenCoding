# Architecture

## Executive Summary

{{executive_summary}}

## 1. Project Context & Understanding

Based on the project documentation (PRD, Epics, UX Specification), the project is an AI-powered web application named `ibe160`.

**Key Aspects:**

*   **Core Functionality**: The application will transform uploaded lecture notes (PDF, TXT, DOCX) into concise summaries and interactive quizzes using AI.
*   **Epics & Stories**: The project is broken down into 5 epics and 20 user stories.
*   **User Experience**: The UX is designed to be a "magical" and effortless transformation experience. It will feature a dark theme ("Scholarly Slate") and a clean, card-based layout.
*   **Critical Non-Functional Requirements**:
    *   **Data Privacy**: Compliance with GDPR/FERPA.
    *   **Security**: Row Level Security (RLS) in Supabase is a key requirement.
    *   **Accessibility**: WCAG 2.1 AA compliance is required.
*   **Key Challenges**:
    *   Ensuring the quality and accuracy of AI-generated content.
    *   Handling a variety of input file formats and qualities.
    *   Delivering a seamless "instant transformation" experience while managing asynchronous AI processing on the backend.

## 2. Project Initialization & Starter Template

The **Vinta Software Next.js FastAPI Template** has been selected as the foundation for this project.

### Initialization Process

This project is initialized using the Vinta Software template on GitHub. The process is as follows:

1.  Navigate to [https://github.com/vintasoftware/nextjs-fastapi-template](https://github.com/vintasoftware/nextjs-fastapi-template).
2.  Click the "Use this template" button to create a new repository under your GitHub account.
3.  Clone the newly created repository to your local machine:
    ```bash
    git clone https://github.com/YourUsername/your-new-repo.git
    ```

This process should be the **first implementation story**.

### Architectural Decisions Provided by Starter

The starter template makes the following architectural decisions, which align with the project's requirements:

| Category              | Decision                                          |
| --------------------- | ------------------------------------------------- |
| **Frameworks**        | Next.js (Frontend), FastAPI (Backend)             |
| **Language**          | TypeScript (Frontend), Python (Backend)           |
| **Styling**           | Tailwind CSS                                      |
| **UI Components**     | `shadcn/ui`                                       |
| **Authentication**    | `fastapi-users` with JWT tokens                   |
| **Database**          | PostgreSQL (managed via Docker Compose)           |
| **Migrations**        | Alembic                                           |
| **Dependency Mgmt**   | `pnpm` (Frontend), `uv` (Backend)               |
| **Type Safety**       | End-to-end type safety with Zod and code generation |
| **Containerization**  | Docker and Docker Compose                         |
| **Deployment**        | Vercel-ready for both frontend and backend        |
| **Project Structure** | Monorepo-like with `nextjs-frontend` and `fastapi_backend` folders |

## 3. Decision Roadmap: Remaining Architectural Choices

The chosen Vinta Software Next.js FastAPI Template provides a robust foundation, making many initial architectural decisions for us. Based on your project's unique requirements, we will now collaboratively address the following key architectural decisions.

### Critical Decisions (Must be made for a functional and secure MVP)

*   **Authentication Strategy**: Reconcile `fastapi-users` (from template) with Supabase Auth (from PRD). The goal is to integrate FastAPI backend directly with Supabase Auth services to leverage its features and RLS.
*   **File Upload & Malware Scanning**: Determine the approach for handling file uploads (PDF, TXT, DOCX), using Supabase Storage, and integrating a malware scanning solution.
*   **AI Integration Strategy**: Define the specific service layer and patterns for integrating with Gemini 2.5 Pro/Flash, including prompt engineering, error handling, and cost management.
*   **Overall Security Architecture**: Detail the implementation of Supabase Row Level Security (RLS), comprehensive backend input validation and sanitization, and ensure encryption for all data at rest and in transit.
*   **Scalability Strategy**: Outline the plan to handle 10x user load leveraging Vercel's serverless capabilities, Supabase optimizations, and a robust queuing system for AI tasks.
*   **Accessibility Integration**: Confirm ongoing adherence to WCAG 2.1 Level AA, primarily through the use of `shadcn/ui` components and scheduled accessibility audits.

### Important Decisions (Shape the architecture significantly, but might be refined during implementation)

*   **Background Job/Queuing System**: Select and integrate a message queue (e.g., Celery with Redis) for asynchronous AI processing and other background tasks.
*   **Email Service Integration**: Plan for integrating SendGrid (or similar) for custom transactional emails, complementing Supabase Auth's built-in email features.
*   **Real-time Capabilities (Future-proofing)**: Architect for potential future integration of Supabase Realtime to support live updates in the application (e.g., quiz progress, notifications).
*   **Global Error Handling and Logging**: Establish a consistent strategy for API error responses and implement a centralized structured logging solution.
*   **High-Level Data Model Design**: Define the initial SQLAlchemy models for the core data entities, ensuring they support the application's functionality and RLS requirements.

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |

{{decision_table_rows}}

## Project Structure

```
{{project_root}}/
{{source_tree}}
```

## Epic to Architecture Mapping

{{epic_mapping_table}}

## Technology Stack Details

### Core Technologies

{{core_stack_details}}

### Integration Points

{{integration_details}}

{{novel_pattern_designs_section}}

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

{{implementation_patterns}}

## Consistency Rules

### Naming Conventions

{{naming_conventions}}

### Code Organization

{{code_organization_patterns}}

### Error Handling

{{error_handling_approach}}

### Logging Strategy

{{logging_approach}}

## Data Architecture

{{data_models_and_relationships}}

## API Contracts

{{api_specifications}}

## Security Architecture

{{security_approach}}

## Performance Considerations

{{performance_strategies}}

## Deployment Architecture

{{deployment_approach}}

## Development Environment

### Prerequisites

{{development_prerequisites}}

### Setup Commands

```bash
{{setup_commands}}
```

## Architecture Decision Records (ADRs)

{{key_architecture_decisions}}

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: {{date}}_
_For: {{user_name}}_
