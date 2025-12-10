# backend/app/services/ai_generation/quiz_generator.py

import json
import logging
import asyncio
from typing import Optional, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.models import Document, Quiz, Question
from app.services.ai_generation.gemini_client import genai
from app.schemas.quiz import QuestionType

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Quiz generation prompt template
QUIZ_GENERATION_PROMPT = """You are an educational quiz generator. Based on the following lecture notes or document content, generate a quiz with {num_questions} questions.

Include a mix of question types as specified: {question_types}

For each question, provide the following in a valid JSON format:
- "question_type": one of "multiple_choice", "true_false", or "short_answer"
- "question_text": the question itself
- "options": for multiple_choice, provide exactly 4 options as an array ["A. ...", "B. ...", "C. ...", "D. ..."]. For true_false, use ["True", "False"]. For short_answer, set to null.
- "correct_answer": the correct answer (for multiple_choice use the letter like "A", for true_false use "True" or "False", for short_answer provide the expected answer)
- "explanation": a brief explanation of why this is the correct answer

Return ONLY a valid JSON array of question objects, no additional text or markdown formatting.

Example format:
[
  {{
    "question_type": "multiple_choice",
    "question_text": "What is the capital of France?",
    "options": ["A. London", "B. Paris", "C. Berlin", "D. Madrid"],
    "correct_answer": "B",
    "explanation": "Paris is the capital and largest city of France."
  }},
  {{
    "question_type": "true_false",
    "question_text": "The Earth is flat.",
    "options": ["True", "False"],
    "correct_answer": "False",
    "explanation": "The Earth is an oblate spheroid, approximately spherical in shape."
  }},
  {{
    "question_type": "short_answer",
    "question_text": "What year did World War II end?",
    "options": null,
    "correct_answer": "1945",
    "explanation": "World War II ended in 1945 with the surrender of Germany and Japan."
  }}
]

Document content:
{document_content}
"""


async def call_gemini_quiz(full_prompt: str) -> str:
    """
    Calls the Gemini API to generate quiz questions.
    Expects a fully formatted prompt.
    """
    if not genai:
        logger.error("Gemini API client is not configured.")
        raise ConnectionError("Gemini API client is not configured.")

    try:
        logger.info("Initializing Gemini model for quiz generation...")
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        logger.info("Generating quiz content from Gemini model...")
        response = await asyncio.to_thread(model.generate_content, full_prompt)

        if response and response.text:
            logger.info("Successfully received quiz data from Gemini.")
            return response.text
        else:
            logger.warning("Gemini API returned an empty response for quiz generation.")
            return ""

    except Exception as e:
        logger.error(f"An unexpected error occurred during Gemini API call for quiz: {e}")
        raise


def parse_quiz_response(response_text: str) -> List[dict]:
    """
    Parse the JSON response from Gemini into a list of question dictionaries.
    Handles potential formatting issues.
    """
    try:
        # Try to extract JSON from response if it contains markdown code blocks
        cleaned_text = response_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        cleaned_text = cleaned_text.strip()
        questions = json.loads(cleaned_text)
        
        if not isinstance(questions, list):
            logger.error("Parsed response is not a list")
            raise ValueError("Expected a list of questions")
        
        return questions
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse quiz response as JSON: {e}")
        logger.error(f"Response text: {response_text[:500]}...")
        raise ValueError(f"Failed to parse AI response: {e}")


async def generate_quiz(
    document_id: UUID,
    user_id: Optional[UUID],
    num_questions: int,
    question_types: Optional[List[QuestionType]],
    session: AsyncSession
) -> Quiz:
    """
    Generate a quiz for a document using Gemini AI.
    
    Args:
        document_id: The ID of the document to generate quiz from
        user_id: The user ID (optional for guests)
        num_questions: Number of questions to generate
        question_types: Types of questions to include
        session: Database session
    
    Returns:
        The created Quiz object
    """
    # Fetch the document
    document = await session.get(Document, document_id)
    if not document:
        raise ValueError(f"Document with id {document_id} not found")
    
    if not document.raw_content:
        raise ValueError(f"Document {document_id} has no extracted text content")
    
    # Capture document attributes before any commits (to avoid lazy loading issues)
    document_raw_content = document.raw_content
    document_filename = document.filename
    
    # Determine question types string for prompt
    if question_types:
        types_str = ", ".join([qt.value for qt in question_types])
    else:
        types_str = "multiple_choice, true_false, short_answer"
    
    # Create quiz record with "generating" status
    quiz = Quiz(
        document_id=document_id,
        user_id=user_id,
        title=f"Quiz for {document_filename}",
        status="generating",
        total_questions=0,
        ai_model="gemini-2.5-flash"
    )
    session.add(quiz)
    await session.commit()
    await session.refresh(quiz)
    
    try:
        # Format the prompt completely with all values
        full_prompt = QUIZ_GENERATION_PROMPT.format(
            num_questions=num_questions,
            question_types=types_str,
            document_content=document_raw_content
        )
        
        # Call Gemini API with fully formatted prompt
        response_text = await call_gemini_quiz(full_prompt)
        
        # Parse the response
        questions_data = parse_quiz_response(response_text)
        
        # Create question records
        for idx, q_data in enumerate(questions_data):
            question = Question(
                quiz_id=quiz.id,
                question_type=q_data.get("question_type", "multiple_choice"),
                question_text=q_data.get("question_text", ""),
                options=json.dumps(q_data.get("options")) if q_data.get("options") else None,
                correct_answer=q_data.get("correct_answer", ""),
                explanation=q_data.get("explanation"),
                order_index=idx
            )
            session.add(question)
        
        # Update quiz status
        quiz.status = "ready"
        quiz.total_questions = len(questions_data)
        await session.commit()
        await session.refresh(quiz)
        
        logger.info(f"Successfully generated quiz {quiz.id} with {len(questions_data)} questions")
        return quiz
        
    except Exception as e:
        logger.error(f"Failed to generate quiz for document {document_id}: {e}")
        quiz.status = "failed"
        await session.commit()
        raise


async def grade_quiz(
    quiz_id: UUID,
    answers: List[dict],  # List of {"question_id": UUID, "user_answer": str}
    user_id: Optional[UUID],
    session: AsyncSession
) -> dict:
    """
    Grade a quiz submission by comparing user answers to correct answers.
    
    Args:
        quiz_id: The ID of the quiz
        answers: List of user answers
        user_id: The user ID (optional for guests)
        session: Database session
    
    Returns:
        Dictionary with score, total, percentage, and detailed results
    """
    from app.db.models import UserAnswer
    
    # Fetch the quiz
    quiz = await session.get(Quiz, quiz_id)
    if not quiz:
        raise ValueError(f"Quiz with id {quiz_id} not found")
    
    # Fetch all questions for this quiz
    result = await session.execute(
        select(Question).where(Question.quiz_id == quiz_id).order_by(Question.order_index)
    )
    questions = result.scalars().all()
    questions_map = {str(q.id): q for q in questions}
    
    results = []
    correct_count = 0
    
    for answer in answers:
        question_id = str(answer["question_id"])
        user_answer = answer["user_answer"]
        
        question = questions_map.get(question_id)
        if not question:
            continue
        
        # Compare answers (case-insensitive for flexibility)
        is_correct = user_answer.strip().lower() == question.correct_answer.strip().lower()
        if is_correct:
            correct_count += 1
        
        # Save user answer
        user_answer_record = UserAnswer(
            quiz_id=quiz_id,
            question_id=question.id,
            user_id=user_id,
            user_answer=user_answer,
            is_correct=is_correct
        )
        session.add(user_answer_record)
        
        results.append({
            "question_id": question_id,
            "is_correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation
        })
    
    await session.commit()
    
    total = len(questions)
    percentage = (correct_count / total * 100) if total > 0 else 0
    
    return {
        "quiz_id": str(quiz_id),
        "score": correct_count,
        "total": total,
        "percentage": round(percentage, 1),
        "results": results
    }
