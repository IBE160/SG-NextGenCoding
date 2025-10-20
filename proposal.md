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
- Feature 1: File upload - Users can upload lecture notes (PDF, Text-file, etc.)
- Feature 2: AI-generated summary - The system automatically summarizes the content into key points.
- Feature 3: Quiz generator - The system creates quiz questions based on the provided lecture notes. Answers will also be created. 

### Nice to Have (Optional Extensions)
- Feature 4: Difficulty setting - Users can select the difficulty of the questions. 
- Feature 5: Different quiz-options - Options to choose between multiple choise, written answers or flashcards. 
- Feature 6: Class feature - Users are able to join a class where the teacher can create summaries and quizzes for the students. (could also have a studygroup feature, which implements the same concepts.)

## Data Requirements

- Data entity 1: User data - Username, email, password (for login and saving summaries and results. Also to join classes)
- Data entity 2: Lecture note data - Uploaded documents, generated summaries. 
- Data entity 3: Quiz data - Questions, correct answers, user-score (number of correct answers), Time (time used on quizzes).

## User Stories (Optional)
[Brief scenarios describing how users will interact with the system]

1. As a student, I want to upload my lecture notes, so that I can get an automatic summary, that helps me pick out the most important concepts. 
2. As a Student, I want to take a quiz based on the topics in the lecture, so that I can test my understanding, and figure out what i need to work on. 
3. As a Teacher, I want to generate quizzes based on my lectures, so that i can allow my students to test their knowledge, and save some time creating every single question. 

## Technical Constraints
- Must support PDF and Text-file uploads. 
- Must include basic user authentication. 
- Should be Web-based and usable on mobile devices. 
- Must use AI to generate the summaries and questions. 

## Success Criteria
- Criterion 1: Users can successfully create and log into their account. 
- Criterion 2: Users can upload the lecture notes and receive accurate summaries. 
- Criterion 3: Generated quizzes provide questions that relate to the key points from the material, and include correct answers. 
- Criterion 4: Data (summaries and quizzes) persists between user sessions. 
- Criterion 5: Application runs smoothly and provides a clear and user-friendly interface

