## Case Title
Lecture Notes - Summary & Quiz generator 

## Background
Students often find it difficult to identify and understand the key concepts from lectures.
Going through large amounts of notes can be time-consuming, boring, and not very effective. 
By utilizing AI to summarize lecture content and generate quizzes, students can learn in a more interactive and efficient way.  

## Purpose
Create an application that allows students to transform the lecture notes into summaries and quizzes. This helps the students gain a better understanding of the topics and key concepts discussed in class. This helps students gain a better understanding of the topics discussed in class and identify areas where they need improvement.

## Target Users
The main target users are students, who want an easy way to summarize and review lecture content, as well as a better way to study. 
Teachers or teaching assistants (TAs) may also use the tool to quickly generate summaries and quizzes from their lectures
## Core Functionality

### Must Have (MVP)
- User registration and authentication - Users are able to register their account. 
- File upload - Users can upload lecture notes (PDF, Text-file, etc.)
- AI-generated summary - The system automatically summarizes the content into key points.
- AI-generated Quiz - The system creates quiz questions based on the provided lecture notes. Answers will also be created. 

### Nice to Have (Optional Extensions)
- AI-generated feedback - The system gives the user feedback based on the answers the user has given. 
- Difficulty setting - Users can select the difficulty of the questions. 
- Different quiz-options - Options to choose between multiple choise, written answers or flashcards. 
- Number of questions - option to select the number of questions. 

### Post-MVP activities (Potential implementation in the future)
- Class feature - Users are able to join a class where the teacher can create summaries and quizzes for the students. (could also have a studygroup feature, which implements the same concepts.)

## Data Requirements

- Data entity 1: User data - Username, email, password (for login and saving summaries and results)
- Data entity 2: Lecture note data - Uploaded documents, generated summaries. 
- Data entity 3: Quiz data - Questions, correct answers, user-score (number of correct answers), Time (time used on quizzes).

## User Stories (Optional)
[Brief scenarios describing how users will interact with the system]

1. As a student, I want to upload my lecture notes, so that I can get an automatic summary, that helps me pick out the most important concepts. 
2. As a Student, I want to take a quiz based on the topics in the lecture, so that I can test my understanding, and figure out what i need to work on. 
3. As a student i want to be able to choose what type of quiz is want to generate, and i would also like to choose the difficulty. 
4. As a Teacher, I want to generate quizzes based on my lectures, so that i can allow my students to test their knowledge, and save some time creating every single question. 

## User flows 
### Flow 1: Account creation & login 
**Goal**: Securely register, log in and access personalized dashboard. 
**Steps**: 
1. User opens up the application and lands on home/login page
2. Clicks "Sign up" to create an account
3. Enters the following information:   
   1. Username
   2. Email
   3. Password 
4. System validates inputs
5. User data saved -> JWT token generated -> redirected to dashboard
6. On later visits user selects "Log in" insted of "sign up" to log into their account. 
   - Logs in using their email/username and password


### Flow 2: Upload lecture notes
**Goal**: Upload a file of lecture notes and prepare it for processing
**Steps**: 
1. From dashboard - user can select "Upload notes" 
2. Upload options: PDF or TXT 
3. System  
   1. Validates file format & size 
   2. sends file to backend 
   3. extractx text via parser 
4. UI shows "File uploaded successfully" 
   - option to select "Generate Summary" or "Generate Quiz"

### Flow 3: Generate AI summary 
**Goal**: Get accurate and percise key points from the lecture notes. 
**Steps**: 
1. user selects uploaded file and click "Generate summary" 
2. frontend sends request -> backend AI endpoint 
3. system 
   1. Chicks large text (if needed)
   2. Send to AI 
   3. return Key points + Short paragraph summary 
4. UI shows: 
   - Title, summary 
   - Option to "Genrate Quiz"

## Flow 4: Generate & take a quiz
**Goal**: Test understanding of lecture content using generated quiz. 
**Steps**: 
1. from summary-page or home-page -> click "Generate Quiz" 
   - if from home page, select the lecture notes or summary to base the quiz on. 
2. Choose parameters 
   -  Number of questions (e.g., 5, 10...)
   -  Type of quiz-questions like Multiple-choice, text or flashcards. (optional MVP)
   -  Difficulty level of the questions (optional MVP)
3. System: 
   - Sends text + parameters to AI 
   - returns structured quiz (questions + answers) 
4. UI shows quiz interface 
   - 1 Question shown at the time 
   - Submit answer 
5. On submit -> backend scores quiz
   - if Quiz is text-aswers, the answers are sendt to the backend AI
   - AI analyze, scores and gives feeback based on what the user answered on the question. 
6. Quiz attempt and data is stored
   - Time used
   - Score

## Flow 5: Review result & history 
**Goal**: let user view past performance and summaries
**Steps**: 
1. From dashboard you can click on "my History" 
2. Tabs: 
   - Documents - list of uploaded documents
   - Summaries - list of provided summaries
   - Quizzes - Lits of quizzes and quiz attempts
3. User can open 
   - Past summaries
   - Past quiz attempts 
   - Quiz-preview (shows question and answers/explenation)

## Technical Constraints
- Must be web-based and accessible via modern browsers (Chrome, Firefox, Safari, Edge)
- Must be responsive and functional on desktop and laptop devices.
- Mobile phone and table support is optional for MVP, but should be considered in the design. 
- Must support PDF and Text-file uploads. 
- Must use Supabase Auth for secure user authentication with JWT tokens 
- Must encrypt sensitive data (passwords handled by Supabase) at rest and in transit
- Must comply with basic data protection practices (GDPR considerations)
- Must use AI to generate the summaries and questions. (Gemini 2.5)
- Supabase Auth handles email delivery for authentication (verification, password resets)

## Success Criteria
- Criterion 1: Users can successfully create and log into their account. 
- Criterion 2: Users can upload the lecture notes and receive accurate summaries. 
- Criterion 3: Generated quizzes provide questions that relate to the key points from the material, and include correct answers. 
- Criterion 4: Data (summaries and quizzes) persists between user sessions. 
- Criterion 5: Application runs smoothly and provides a clear and user-friendly interface

## Technical Specifications 

### Frontend Specifications
- **Framework**: Next.js 14+ with App Router for server-side rendering and optimal performance
- **Language**: TypeScript for type safety and better AI-assisted development
- **Styling**: Tailwind CSS for rapid, responsive UI development
- **State Management**: Zustand for lightweight, scalable global state management
- **Shadcn UI**: Shadcn UI for rapid, responsive UI development
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Authentication UI**: Supabase Auth UI components + custom styling
- **API Communication**: Axios with interceptors for authenticated requests
- **Deployment**: Vercel for frontend hosting with automatic CI/CD

**Architecture Pattern**: Component-based architecture with clear separation between presentation components, container components, and business logic hooks.

### Backend Specifications 
- **Framework**: FastAPI (Python) for high-performance RESTful API development
- **Language**: Python for AI integration compatibility and rapid development
- **Database**: Supabase (PostgreSQL) for managed database and real-time capabilities
- **Authentication**: Supabase Auth for built-in user management, JWT tokens, and email verification
- **Authorization**: Row Level Security (RLS) policies in Supabase - ensures users only access their own data. 
- **ORM**: SQLAlchemy for database operations and type safety
- **Database Migrations**: Alembic for version-controlled schema changes
- **AI Integration**:Gemini 2.5 Pro/Flash - used to generate summaries, quizzes and feedback. 
- **Email Service**: Supabase Auth for authentication emails + SendGrid for custom transactional emails
- **Real-time Communication**: Supabase Realtime for live game monitoring and updates
- **API Documentation**: FastAPI automatic OpenAPI/Swagger documentation
- **Testing**: Pytest for unit and integration tests
- **Deployment**: Vercel (FastAPI supports Vercel deployment)

### Database Specifications
- **Database Type**: Supabase (PostgreSQL-based relational database)
- **ORM**: SQLAlchemy for database access and schema definition
- **Migrations**: Alembic for version control of schema updates
- **Hosting**: Supabase Cloud – includes automatic backups, scaling, and monitoring
- **Schema Design**:
  - **Users**: Managed by Supabase Auth; stores user metadata (student, teacher)
  - **LectureNotes**: Stores uploaded files, extracted text, and metadata
  - **Summaries**: AI-generated summaries linked to user and lecture notes
  - **Quizzes**: Stores AI-generated questions, answers, and configurations (difficulty, type)
  - **QuizAttempts**: Records user answers, scores, and time spent per quiz
- **Security**: Row Level Security (RLS) policies ensure users can only access their own data

### AI Integration Specifications
- **AI Model**: Gemini 2.5 Pro/Flash – selected for accuracy, cost-efficiency, and speed
- **Use Cases**:
  - **Lecture Note Summarization**: Extracts key points and provides a short paragraph summary
  - **Quiz Generation**: Creates contextual questions and answers based on lecture content and summary
  - **Feedback Generation (optional)**: Evaluates user answers and provides personalized feedback
- **Prompt Design**:
  - **Summarization**: AI receives parsed text from uploaded lecture notes
  - **Quiz Generation**: AI receives summary, original text, and quiz type parameters (e.g., multiple-choice or written)
  - **Feedback**: AI evaluates user-submitted answers and provides explanation or score
- **Error Handling**: Implements retry logic for failed requests and validation for AI responses
- **Cost Management**: Implements basic rate limiting and usage tracking for AI API calls.

### User Authentication Specifications
- **Authentication Method**: Supabase Auth with JWT-based authentication
- **Features**:
  - Email/password registration with built-in validation
  - Automatic email verification via Supabase Auth templates
  - Password reset using secure magic link flow
  - Session management with automatic refresh token rotation
  - Role-based metadata (student, teacher)
- **Security Measures**:
  - HTTPS enforced by Supabase and Vercel
  - Passwords securely hashed by Supabase (bcrypt)
  - JWTs automatically managed by Supabase
  - Row Level Security (RLS) ensures users can only access their own data
  - CSRF protection and input validation on all authentication forms


### Platform Specifications
- **Primary Platform**: Web application (browser-based)
- **Target Devices**:
  - **Primary**: Desktop and laptop devices (Windows, macOS, Linux)
  - **Secondary**: Tablets (iPad, Android tablets in landscape mode)
  - **Future**: Mobile phones (responsive UI or dedicated app)
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge (latest two versions)
- **Responsive Design**: Optimized for 1024px+ viewports; adaptable for tablets and smaller screens

### Security & Compliance Specifications
- **Data Encryption**: All sensitive data encrypted in transit (HTTPS/TLS) and at rest (managed by Supabase)
- **GDPR Compliance**: Data storage and deletion policies aligned with GDPR requirements
- **Session Management**: JWT-based sessions to prevent unauthorized access
- **Data Access Control**: Row Level Security (RLS) ensures users can only read/write their own data records



## Timeline and milestones 
**Total Duration**: 5 weeks following BMAD-methodology (4-phase model)

This timeline follows the 4-phase model of the BMAD-methodology, where phases 1 and 2 are done in 1 week, phase 3 is done in 2 weeks, and phase 4 is done in 2 weeks.

| Phase | Duration | Week | Focus |
|-------|----------|------|-------|
| Phase 1 & 2: Analyze and Planning | 1 week | Week 44 | Requirements analysis, project planning, stakeholder alignment |
| Phase 3: Solution Architecture and UI/UX Design | 2 weeks | Week 45-46 | Technical architecture, database design, UI/UX mockups, API design |
| Phase 4: Development and Deployment | 2 weeks | Week 47-48 | Implementation, testing, deployment |

---
