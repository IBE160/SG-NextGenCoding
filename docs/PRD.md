# ibe160 - Product Requirements Document

**Author:** BIP
**Date:** 2025-11-20
**Version:** 1.0

---

## Executive Summary

The project aims to create a web application that helps students and teachers by transforming lecture notes into concise summaries and interactive quizzes, making learning more efficient and engaging.

### What Makes This Special

The core "magic" is the instant transformation of dense lecture notes into a clear summary and an interactive quiz, shifting the user from passive review to active, efficient learning.

---

## Project Classification

**Technical Type:** Web App
**Domain:** EdTech
**Complexity:** Medium

The project is a Web Application in the EdTech domain with medium complexity, requiring attention to data privacy and educational standards.

### Domain Context

The EdTech domain requires careful consideration of student data privacy laws like GDPR, FERPA (in the U.S.), and COPPA (for users under 13). The application should also be designed with web accessibility (WCAG 2.1 AA) in mind to ensure it is usable by all students. While not required for MVP, awareness of learning management standards (like SCORM/xAPI) is beneficial for potential future integrations with institutional systems.



---

## Success Criteria

- **Accuracy & Utility**: Summaries must be rated as "helpful" (4/5 stars or higher) by over 80% of users. Generated quiz questions should directly correlate with the key concepts of the lecture notes.
- **User Engagement**: At least 50% of new users should generate both a summary and a quiz within their first week.
- **Student Confidence**: A user survey indicates that students feel more confident about their understanding of a topic after using the app.
- **Reliability**: The end-to-end process from file upload to quiz generation should be successful in over 99% of attempts.

### Business Metrics

- **Adoption Rate**: Our primary goal is user adoption. We should aim for a target number of active users (e.g., 500) within the first 3 months.
- **Retention Rate**: We want users to come back. We should track how many users return to the app on a weekly or monthly basis.
- **Teacher/TA Advocacy**: Success would be seeing teachers or TAs recommending the tool to their students.

---

## Product Scope

### MVP - Minimum Viable Product

The core functionality that must work for the product to be useful:

*   **Guest Mode**: Allow users to try the core functionality (e.g., 1-2 free uses) before requiring registration.
*   **User Registration & Authentication**: Secure account creation and login for returning users.
*   **File Upload**: Ability to upload lecture notes (PDF, TXT, and DOCX).
*   **AI-Generated Summary**: Automatic summarization of content into key points.
*   **AI-Generated Quiz**: Creation of quiz questions with answers based on lecture notes.
*   **Content Feedback**: A simple "Rate this" or "Report Issue" mechanism for users to provide feedback on the quality of AI-generated content.

### Out of Scope for MVP

The following features are explicitly out of scope for the MVP to ensure a focused and timely delivery of the core product value. They are categorized as Growth or Vision features for future consideration.

#### Growth Features (Post-MVP)

*   **AI-Generated Feedback**: Deferred to gather more data on user interaction with quizzes before adding this layer of complexity.
*   **Difficulty Setting**: Deferred to simplify the initial user experience. The AI will be tuned for a general audience first.
*   **Different Quiz Options**: Deferred to focus on a single, high-quality quiz format for MVP.
*   **Number of Questions**: Deferred to simplify the initial user experience.

#### Vision (Future)

*   **Class Feature**: A significant feature requiring a multi-user architecture, which is a a large extension of the core MVP.
*   **Study Group Feature**: Similar to the Class Feature, this requires a more complex social and permissions model.

---

## Domain-Specific Requirements

-   **Regulatory & Compliance:** Strict data privacy regulations apply, including GDPR, FERPA, and potentially COPPA. These necessitate careful handling of PII, secure data storage, and transparent privacy policies.
-   **Accessibility:** Adherence to Web Content Accessibility Guidelines (WCAG 2.1 AA) is critical to ensure the application is usable by students with disabilities.
-   **Ethical AI Use:** Ethical considerations around bias in summaries or quizzes, fairness in grading, and transparency of AI operation will be paramount.
-   **Interoperability:** Future integration with Learning Management Systems (LMS) would benefit from alignment with standards like SCORM, xAPI, or LTI.

This section shapes all functional and non-functional requirements below.

---

## Innovation & Novel Patterns

-   **Seamless Personalization**: Direct transformation of individual lecture notes into bespoke summaries and interactive quizzes, challenging traditional study methods.
-   **Active Learning Facilitation**: Providing instant self-assessment tools, shifting students from passive consumption to active engagement.
-   **Empowering User-Generated Content**: Leveraging user-uploaded content as primary input, ensuring relevance to specific curriculum and learning context.

### Validation Approach

-   **User-Centric Testing**: Extensive user testing to evaluate accuracy, usefulness, and engagement of AI-generated content.
-   **Iterative Feedback Loops**: Mechanisms (like the "Rate this" feature) to gather feedback on content quality and adjust AI models.
-   **Comparative Studies**: Compare learning outcomes/efficiency of students using the tool vs. traditional methods.
-   **A/B Testing**: Experiment with AI prompt designs, summary styles, and quiz formats.

---

## Web App Specific Requirements

This application will be a web-based platform with a modern tech stack designed for optimal performance and user experience.

*   **Frontend**: Built with **Next.js 14+ (App Router)** and **TypeScript** for a robust and scalable UI. Styling will use **Tailwind CSS** and **Shadcn UI** for rapid, responsive development. **Zustand** will manage global state, and **React Hook Form with Zod** will handle form validation. API communication will use **Axios with interceptors**.
*   **Backend**: A high-performance **FastAPI (Python)** framework will power the RESTful API, chosen for AI integration compatibility. **SQLAlchemy** will manage database operations, with **Alembic** for migrations.
*   **Database**: **Supabase (PostgreSQL)** will serve as the managed database, leveraging its real-time capabilities and Row Level Security (RLS) for data protection.
*   **AI Integration**: **Gemini 2.5 Pro/Flash** will be central to AI-generated summaries, quizzes, and optional feedback, with careful prompt design, error handling, and cost management.
*   **Deployment**: Both frontend and backend will be deployed on **Vercel**, benefiting from its CI/CD capabilities.
*   **Platform & Responsiveness**: The application will be primarily web-based, optimized for desktop and laptop browsers (Chrome, Firefox, Safari, Edge), with adaptability for tablets. Mobile support is optional for MVP.

### API Specification

The FastAPI backend will expose a RESTful API with clearly defined endpoints for:

*   **User Management**: Registration, login, profile management.
*   **File Upload**: Securely receiving and processing lecture notes.
*   **Summary Generation**: Triggering AI summarization.
*   **Quiz Generation**: Requesting AI-generated quizzes based on notes.
*   **Quiz Attempts**: Submitting user answers and storing results.
*   **History/Review**: Accessing past summaries, quizzes, and performance data.

Error codes will be standardized (e.g., HTTP status codes), and basic rate limiting will be implemented for AI API calls.

### Authentication & Authorization

Authentication will be handled by **Supabase Auth**, providing:

*   **JWT-based authentication**: Secure token-based sessions.
*   **Email/password registration and login**.
*   **Email verification** and **password reset** flows.
*   **Session management** with refresh token rotation.
*   **Row Level Security (RLS)** will be rigorously applied within Supabase to ensure users can only access their own data, providing robust authorization.

---

## User Experience Principles

The application's UX will embody a **professional, clean, and intuitive** design aesthetic. The primary goal is to make the process of transforming notes into learning tools feel **effortless, efficient, and rewarding**. The design will emphasize clarity and reduce cognitive load, allowing students to focus on learning rather than navigating complex interfaces.

### Key Interactions

We will focus on highly optimized and intuitive interaction patterns for the critical user journeys:

*   **Seamless Onboarding & Account Management**: A streamlined sign-up and login process (including the new Guest Mode) and easy access to account settings.
*   **Effortless File Upload**: A clear, drag-and-drop or simple file selection interface for uploading lecture notes, with immediate visual feedback on progress and success.
*   **Instant Transformation**: A "one-click" or minimal-step process to generate summaries and quizzes, reinforcing the "instant magic" of AI.
*   **Interactive Quiz Experience**: An engaging, clear, and easy-to-use quiz interface that presents one question at a time, allows answer submission, and provides immediate results (or feedback for advanced features).
*   **Intuitive History & Review**: Simple navigation to review past summaries, quiz attempts, and overall learning progress, enabling students to track their understanding over time.
*   **Feedback Mechanism**: An easily accessible and straightforward way for users to provide feedback on AI-generated content.

---

## Functional Requirements

**1. User Management & Authentication (FR-UM)**
*   **FR-UM-1: User Registration & Login**: The system shall allow new users to register for an account and existing users to log in securely using email and password (via Supabase Auth).
    *   **Priority**: MVP
    *   **User Value**: Provides personalized experience, saves user data securely.
    *   **Acceptance Criteria**:
        *   Users can successfully create an account with a unique email and password.
        *   Users can log in and out.
        *   Password recovery and email verification processes are functional.
    *   **Domain Constraint**: Must comply with GDPR data handling for user data.
*   **FR-UM-2: Guest Access**: The system shall allow guest users to access core summary and quiz generation features for a limited number of uses (e.g., 1-2 free uses) without requiring registration.
    *   **Priority**: MVP
    *   **Dependencies**: FR-UM-1
    *   **User Value**: Low friction trial, immediate value proposition of the "magic."
    *   **Acceptance Criteria**:
        *   Guest users can upload a file, generate a summary, and take a quiz for the defined free uses.
        *   After the limit, the system prompts the guest user to register to continue.

**2. Content Ingestion & Processing (FR-CIP)**
*   **FR-CIP-1: Lecture Note Upload**: The system shall allow users to upload lecture notes in PDF, TXT, and DOCX formats.
    *   **Priority**: MVP
    *   **Dependencies**: FR-UM-1
    *   **User Value**: Easily use existing notes without conversion, saving time.
    *   **Acceptance Criteria**:
        *   Users can select and upload supported file types.
        *   The system validates file format and size.
        *   The system accurately extracts text from the uploaded file for AI processing.
*   **FR-CIP-2: AI Summary Generation**: The system shall generate a concise summary (including key points and a short paragraph) from uploaded lecture notes using AI (Gemini 2.5).
    *   **Priority**: MVP
    *   **Dependencies**: FR-CIP-1
    *   **User Value**: Time-saving, quick grasp of key concepts, enhances understanding. *(Highlights "magic")*
    *   **Acceptance Criteria**:
        *   A summary is generated within a specified performance threshold (e.g., under 30 seconds for a typical file).
        *   The summary accurately reflects the main concepts of the uploaded notes.
        *   Users can view the generated summary in a clear, readable format.
    *   **Domain Constraint**: Ethical AI use guidelines must be applied to minimize bias and ensure factual accuracy.

**3. Interactive Learning & Assessment (FR-ILA)**
*   **FR-ILA-1: AI Quiz Generation**: The system shall generate relevant quiz questions (e.g., multiple-choice, true/false, short answer) and correct answers based on the uploaded lecture notes and/or generated summary using AI (Gemini 2.5).
    *   **Priority**: MVP
    *   **Dependencies**: FR-CIP-2
    *   **User Value**: Self-assessment, active recall, identifies knowledge gaps, makes studying efficient. *(Highlights "magic")*
    *   **Acceptance Criteria**:
        *   A quiz is generated within a specified performance threshold (e.g., under 30 seconds).
        *   Quiz questions are relevant to the content and have factually correct answers.
        *   Users can take the generated quiz through an intuitive interface.
    *   **Domain Constraint**: Ethical AI use guidelines must be applied to minimize bias and ensure factual accuracy.
*   **FR-ILA-2: Content Feedback**: The system shall provide a simple mechanism for users to rate the quality/accuracy of AI-generated summaries and quizzes (e.g., "helpful/not helpful," "report issue" button).
    *   **Priority**: MVP
    *   **Dependencies**: FR-ILA-1, FR-CIP-2
    *   **User Value**: Users contribute to improving AI quality, feel heard and valued.
    *   **Acceptance Criteria**:
        *   Users can easily submit feedback on both summaries and quizzes.
        *   Feedback data is securely recorded for system analysis and improvement.

**4. Data Management & History (FR-DM)**
*   **FR-DM-1: Data Persistence**: The system shall securely store user data, uploaded lecture notes, generated summaries, quizzes, and quiz results between user sessions for logged-in users.
    *   **Priority**: MVP
    *   **User Value**: Continuity of study, ability to track progress and review past materials.
    *   **Acceptance Criteria**:
        *   Logged-in users can access their past content and results.
        *   All sensitive data (user info, notes) is encrypted at rest and in transit.
    *   **Domain Constraint**: Full GDPR, FERPA, and potentially COPPA compliance for all stored data. Row Level Security (RLS) must be rigorously applied.

**5. User Interface & Experience (FR-UI)**
*   **FR-UI-1: Responsive User Interface**: The system shall provide a responsive web interface compatible with modern browsers (Chrome, Firefox, Safari, Edge - latest two versions) on desktop, laptop, and tablet devices.
    *   **Priority**: MVP
    *   **User Value**: Consistent, accessible, and comfortable experience across different devices and screen sizes.
    *   **Acceptance Criteria**:
        *   UI elements and layouts adapt correctly across specified device types and browser windows.
        *   Core functionalities are fully accessible and usable via keyboard navigation.
    *   **Domain Constraint**: WCAG 2.1 AA accessibility guidelines must be met for all UI components and content.

---

## Edge Cases and Special Scenarios

- **Large File Uploads**: The system should gracefully handle file uploads that are close to the size limit, providing clear feedback to the user during the upload and processing.
- **Empty or Very Short Files**: If a user uploads a file with little or no content, the AI should return a message indicating that there is not enough content to generate a summary or quiz, rather than producing an error or a nonsensical output.
- **Unsupported File Types**: The system should provide a clear and immediate error message if a user attempts to upload a file type that is not supported.
- **AI Service Unavailability**: If the AI service (Gemini 2.5) is unavailable or returns an error, the user should be notified with a user-friendly message, and the system should not crash.
- **Poor Quality OCR**: For PDF files that are images, the text extraction (OCR) might be of poor quality. The system should ideally detect this and warn the user that the generated content might be inaccurate.

---

## Non-Functional Requirements

### Performance & Scalability

-   The system must handle a 10x increase in user load over a 24-hour period without crashing.
-   Implement a queuing system for AI tasks to manage load and provide users with expected wait times.
-   Add strict cost-control measures, including rate limiting and budget alerts for AI API usage.

### Security

-   Enforce strict file size limits (e.g., 20MB) and type validation.
-   Uploaded files must be scanned for malware.
-   All user-generated content must be sanitized before rendering to prevent cross-site scripting (XSS) attacks.

### Accessibility

-   The application must comply with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA to ensure it is usable by all students, including those with disabilities.

### Integration

-   The system's architecture should be designed to allow for potential future integration with Learning Management Systems (LMS) using standards like LTI or xAPI.

---

## Technical Unknowns

- **AI Performance at Scale**: While Gemini 2.5 is powerful, its performance and cost implications at high user volumes are yet to be determined. This will require monitoring and potential optimization post-launch.
- **OCR Accuracy for Diverse PDFs**: The accuracy of text extraction from image-based PDFs can vary widely. The effectiveness of detecting poor quality OCR and providing meaningful warnings to the user needs to be researched and tested.
- **Real-time Collaboration Complexity**: For the "Vision" features (Class and Study Group), the real-time collaboration aspect using Supabase's capabilities will introduce significant complexity that needs to be fully scoped and designed.

---

## Test Strategy

- **Unit Tests**: Both frontend and backend code will be covered by unit tests to ensure individual components function correctly.
- **Integration Tests**: Integration tests will be written to verify the interactions between different parts of the system, such as the frontend and backend API, and the backend and the AI service.
- **End-to-End (E2E) Tests**: E2E tests will simulate user journeys to ensure the entire application works as expected. This will include testing the file upload, summary generation, and quiz taking processes.
- **User Acceptance Testing (UAT)**: A group of beta testers will be invited to use the application and provide feedback before the public launch. This will help identify usability issues and ensure the application meets user expectations.

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow epics-stories` to create the implementation breakdown.

---

## References



- Product Brief: docs/product-brief-ibe160-2025-11-19.md
- Research: docs/research-technical-2025-11-19.md


## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow epics-stories`
2. **UX Design** (if UI) - Run: `workflow ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

## PRD Summary

The PRD outlines a web application to make learning more efficient and engaging by transforming lecture notes into summaries and quizzes. Success will be measured by accuracy, user engagement, and organic growth. The MVP includes a "Guest Mode," file upload (PDF, TXT, DOCX), AI-generated content, and a feedback mechanism. The requirements address functional needs as well as NFRs for performance, security, accessibility, and integration, with special attention to EdTech domain considerations like data privacy.

_Created through collaborative discovery between BIP and AI facilitator._
