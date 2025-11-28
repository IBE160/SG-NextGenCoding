# Architecture
## Executive Summary
An AI-powered web application for generating summaries and quizzes from lecture notes. It will leverage Next.js (frontend), FastAPI (backend), and Supabase (database/auth). The architecture prioritizes user experience with asynchronous AI processing and robust error handling, adhering to strong consistency patterns to ensure maintainability and scalability.

## Project Initialization
First implementation story should execute the following steps to initialize the project using the michaeltroya/supa-next-starter template for the frontend:

Use the template on GitHub: Create a new repository from https://github.com/michaeltroya/supa-next-starter.
Clone the new repository: git clone <your-new-repository-url>
Install dependencies: pnpm install
This establishes the base frontend architecture with: Next.js 14, Supabase integration, Tailwind CSS, Shadcn UI, TypeScript, Jest for testing, ESLint, Prettier, and GitHub Actions for CI/CD.

## Decision Summary
| Category | Decision | Version | Affects Epics | Rationale |
|---|---|---|---|---|
| Data Persistence | Supabase (PostgreSQL) | 2.5 | User Management, Content Ingestion, Interactive Learning, Data Management | Aligns with tech stack choice, handles data persistence, authentication. |
| API Pattern | RESTful API | N/A | All Epics (via backend API) | PRD specifies FastAPI, excellent for building RESTful APIs. |
| Authentication | Supabase Auth | 2.5 | User Management | Aligns with tech stack choice, provides robust user authentication. |
| Real-time Capabilities | Minimal Polling for MVP, clear upgrade path to WebSockets (Supabase Realtime) for future enhancements. | N/A | Content Ingestion (AI generation status), Interactive Learning (future), History/Review (future) | Balances MVP simplicity with enhanced user experience for AI generation feedback. |
| Email Service | Resend | Verified | User Management (email verification, password reset) | Developer-friendly, good deliverability, integrates well with Next.js/React. |
| File Storage | Supabase Storage | 2.5 | Content Ingestion | Natural choice given Supabase for database and authentication. |
| Search Functionality | No Search for MVP, defer to post-MVP. | N/A | N/A (MVP decision) | Simplifies initial build, allows focus on core AI generation features. |
| Background Jobs | Asynchronous Processing with Background Jobs, with user notifications on completion. | N/A | Content Ingestion (AI generation), Interactive Learning (AI generation) | Improves user experience and responsiveness for time-consuming AI generation tasks. |
| Deployment Target | Local Development Environment | N/A | All Epics | Focus on local setup for immediate development and testing. |
## Project Structure
```
/
├── frontend/             # Next.js application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── app/          # Next.js App Router (pages, layouts, etc.)
│   │   ├── components/   # Reusable UI components (shadcn/ui overrides, custom components)
│   │   ├── lib/          # Utility functions, Supabase client setup, helpers
│   │   ├── styles/       # Tailwind CSS configuration, global styles
│   │   └── types/        # TypeScript types (e.g., Supabase models)
│   ├── .env.local.example
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── ...
├── backend/              # FastAPI application
│   ├── app/              # Main FastAPI application
│   │   ├── api/          # API endpoints (routers, e.g., /api/v1/summaries)
│   │   ├── core/         # Core application configuration, settings, security
│   │   ├── db/           # Database models (SQLAlchemy/SQLModel), migrations (Alembic)
│   │   ├── crud/         # Database interaction logic (Create, Read, Update, Delete)
│   │   ├── schemas/      # Pydantic models for request/response validation
│   │   ├── services/     # Business logic, AI integration
│   │   ├── dependencies/ # FastAPI dependency injection
│   │   └── main.py       # FastAPI application entry point
│   ├── tests/            # Unit and integration tests for backend
│   ├── .env.example
│   ├── requirements.txt  # or pyproject.toml for Poetry/uv
│   └── ...
├── shared/               # Code and types shared between frontend and backend
│   └── (e.g., common TypeScript types, Pydantic models if compiled for TS)
├── docs/                 # Project documentation (PRD, Epics, Architecture, etc.)
├── .github/              # GitHub Actions workflows (CI/CD)
├── .gitignore
├── README.md
└── ...
```

## Epic to Architecture Mapping
| Epic | Architectural Component |
|---|---|
| Epic 1: Foundation & Core Platform | frontend/, backend/, .github/, root configuration files. |
| Epic 2: User Access & Authentication | frontend/src/app/(auth)/, frontend/src/lib/supabase.ts, backend/app/api/auth/ (if needed), backend/app/core/security.py. Supabase (external). |
| Epic 3: Content Ingestion & AI Summarization | frontend/src/app/upload/, frontend/src/services/, backend/app/api/summaries/, backend/app/services/ai_generation/, backend/app/db/, backend/app/schemas/. |
| Epic 4: Interactive Quiz Generation & Feedback | frontend/src/app/quizzes/, frontend/src/services/, backend/app/api/quizzes/, backend/app/services/ai_generation/, backend/app/db/, backend/app/schemas/. |
| Epic 5: History, Review & Advanced UI | frontend/src/app/dashboard/, frontend/src/app/history/, frontend/src/components/, backend/app/api/history/, backend/app/db/. WCAG compliance across frontend/src/components/ and frontend/src/app/ elements. |
## Technology Stack Details
### Core Technologies
* Frontend: Next.js 16.0.3, TypeScript, React, Tailwind CSS, Shadcn UI
* Backend: FastAPI 0.122.0 (Python), Pydantic 2.12.4
* Database & Auth: Supabase (PostgreSQL for DB, Supabase Auth for Authentication, Supabase-js 2.84.0, Supabase-py 2.24.0)
* ORM (Backend): SQLModel 0.0.27
* AI Model: Gemini 2.5 Pro/Flash
* Email Service: Resend 6.5.2 (Node.js SDK)
* API Client (Frontend): Axios 1.13.2
* Frontend State Management: Zustand 5.0.8
* Deployment: Local Development Environment
### Integration Points
* Frontend to Backend: RESTful API calls via Axios with interceptors.
* Backend to Supabase: Supabase client library for database and authentication interactions.
* Backend to Gemini API: Direct API calls to Gemini 2.5.
* Backend to Email Service: Resend API for transactional emails.
* Asynchronous Tasks: Background job queue for AI processing.
## Novel Architectural Patterns
No novel architectural patterns requiring invention have been detected in this project. All requirements can be met using established and well-understood architectural patterns. We will proceed with standard architectural patterns.

## Implementation Patterns
These patterns ensure consistent implementation across all AI agents:

### Naming Conventions
* API Endpoints: Use plural nouns for resources, kebab-case for multi-word.
* Route Parameters: {id} format.
* Database Tables: Plural, snake_case.
* Database Columns: snake_case.
* Frontend Components: PascalCase for components, kebab-case for file names.
### Structure Patterns
* Tests: Co-locate with code.
* Frontend Component Organization: By feature.
* Backend Organization: By domain/feature.
* Shared Utilities: Dedicated lib/, core/, or shared/ directories.
### Format Patterns
* API Response Wrapper: {"data": ..., "message": ..., "status": ...} for success.
* API Error Format: {"error": {"message": ..., "code": ...}} for errors.
* Date Format in JSON: ISO 8601 strings.
### Communication Patterns
* Frontend State Management: Zustand (global), useState/useContext (local).
* API Communication (Frontend): Axios with interceptors.
* Backend Inter-service Communication: Direct FastAPI calls (MVP).
### Lifecycle Patterns
* Loading States: Clear indicators (spinners, skeleton loaders).
* Error Recovery: Toast notifications, inline messages with retry.
* Retry Mechanisms: Exponential backoff for network/external API calls.
### Location Patterns
* API Route Structure (Backend): Logical paths within backend/app/api/.
* Static Assets (Frontend): frontend/public/.
* Configuration Files: .env.local (frontend), .env (backend), project-wide in root of respective services.
## Consistency Rules
### Date/Time Formatting in UI
* User-friendly, locale-aware format on the frontend.

### Logging Strategy
* Clear, concise, contextual messages (basic console logging for MVP).

### User-facing Error Messages
* Clear, non-technical, actionable advice.

### Code Formatting
* ESLint/Prettier (frontend), Ruff (backend), with automated checks.

## Data Architecture
* Database: PostgreSQL (managed by Supabase).
* ORM (Backend): SQLModel
* Frontend Data Access: Supabase client library, React Query/TanStack Query (via michaeltroya/supa-next-starter).
* Data Models: Pydantic models for API schemas, corresponding database models (SQLAlchemy/SQLModel) for persistence.
* **Supabase `profiles` table:**
    *   `id` (UUID, primary key)
    *   `created_at` (timestamp with timezone, default now)
    *   `user_id` (UUID, foreign key referencing `auth.users.id`, unique, not null)
* **Supabase RLS Policies for `profiles` table:**
    *   `SELECT` Policy: Allows authenticated users to `SELECT` rows where `user_id = auth.uid()`.
    *   `INSERT` Policy: Allows authenticated users to `INSERT` rows where `user_id = auth.uid()`.
## API Contracts
* Style: RESTful API.
* Response Format: Wrapped payload for success, standardized error format.
* Authentication: JWT tokens via Supabase Auth.
* Error Handling: HTTP status codes, consistent error body.
## Security Architecture
* Authentication: Supabase Auth (JWT-based, email/password, email verification, password reset).
* Authorization: Supabase Row Level Security (RLS) for data, backend API route protection.
* Data Protection: Encryption at rest and in transit (handled by Supabase, Vercel).
* Input Validation: Pydantic models on backend.
* CORS: Configured in FastAPI.
## Performance Considerations
* Asynchronous Operations: FastAPI's async capabilities for I/O-bound tasks.
* Background Jobs: For AI generation.
* Caching: Potential for Redis (future) for AI prompt caching or frequently accessed data.
* Database Optimization: Proper indexing, efficient queries (to be managed in implementation).
## Deployment Architecture
* Frontend: Local Development (e.g., `pnpm dev`).
* Backend: Local Development (e.g., `uvicorn app.main:app --reload`).
* CI/CD: GitHub Actions (for automated testing only).
## Development Environment
### Prerequisites
* Node.js (with pnpm)
* Python (with Poetry/uv)
* Docker (optional, for local DB/Redis)
### Setup Commands
```
Frontend initialization:
Create new repository from https://github.com/michaeltroya/supa-next-starter.
git clone <your-new-repository-url>
pnpm install
Backend setup (manual project creation, followed by installing dependencies):
cd backend
poetry init (or uv venv, pip install -r requirements.txt)
poetry add fastapi uvicorn (and other dependencies)
Environment variables: .env.local (frontend), .env (backend) for Supabase keys, API keys, etc.
```
## Architecture Decision Records (ADRs)
Generated by BMAD Decision Architecture Workflow v1.0 Date: tirsdag 25. november 2025 For: BIP