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
   -  Type of quiz-questions like Multiple-choise, text or flashcards. (optional MVP)
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

### Backend Specifications 
- **Framework**: FastAPI (Python) for high-performance RESTful API development
- **Language**: Python for AI integration compatibility and rapid development
- **Authentication**: Supabase Auth for built-in user management, JWT tokens, and email verification
- **Email Service**: Supabase Auth for authentication emails + SendGrid for custom transactional emails

### Database Specification
- **Database Type**: Supabase (PostgreSQL-based relational database)
- **ORM**: SQLAlchemy for Python-based type-safe database access

### AI Integration Specification
**AI Use cases**:
1. **Note summaries**: Generate summaries based on the notes provided by the user. 
2. **Question Generation**: Generate questions based on the provided notes, the Answer should also be generated. Type of questions is based of what the user selects. (Multiple-choise, text-questions...)
3. **Feedback Generation**: Provide feedback and score based on the answers the user has given to the generated questions. 

**Implementation**:
- **Model**: Gemini 2.5 pro/flash
- **Prompt Design**:
  - AI recieves the lecture notes by the user to generate the summary.
  - Question generator uses the lecture notes and generated summary, as well as the users chosen type of questions. 
  - AI recieves the answers the user have given, to provide feedback. 

### Platform Type
**Primary Platform**: Web application (browser-based)

**Target Devices**:
- Desktop computers (primary): Windows, macOS, Linux
- Laptops (primary): All operating systems
- Tablets (secondary): iPad, Android tablets (landscape orientation recommended)
- Mobile phones (future): iOS and Android via responsive design or dedicated apps

### User Authentication Specification
**Authentication Method**: Supabase Auth with JWT-based authentication

**Features**:
- Email/password registration with built-in validation
- Automatic email verification via Supabase Auth email templates
- Secure password reset flow with magic links
- Session management with automatic refresh token rotation


## Timeline and milestones 
**Total Duration**: 5 weeks following BMAD-methodology (4-phase model)

This timeline follows the 4-phase model of the BMAD-methodology, where phases 1 and 2 are done in 1 week, phase 3 is done in 2 weeks, and phase 4 is done in 2 weeks.

| Phase | Duration | Week | Focus |
|-------|----------|------|-------|
| Phase 1 & 2: Analyze and Planning | 1 week | Week 44 | Requirements analysis, project planning, stakeholder alignment |
| Phase 3: Solution Architecture and UI/UX Design | 2 weeks | Week 45-46 | Technical architecture, database design, UI/UX mockups, API design |
| Phase 4: Development and Deployment | 2 weeks | Week 47-48 | Implementation, testing, deployment |

---
