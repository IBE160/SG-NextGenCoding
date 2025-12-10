// frontend/src/services/quizzes.ts

import axios from 'axios'
import { Quiz, QuizResults, QuestionType } from '@/lib/quizStore'

interface GenerateQuizRequest {
  document_id: string
  num_questions?: number
  question_types?: QuestionType[]
}

interface GenerateQuizResponse {
  data: Quiz
  message: string
  status: string
}

interface QuizWithQuestionsResponse extends Quiz {
  questions: Array<{
    id: string
    question_type: QuestionType
    question_text: string
    options: string[] | null
    order_index: number
  }>
}

interface SubmitQuizRequest {
  answers: Array<{
    question_id: string
    user_answer: string
  }>
}

interface SubmitQuizResponse {
  data: QuizResults
  message: string
  status: string
}

/**
 * Generate a quiz from a document using AI
 */
export const generateQuiz = async (
  documentId: string,
  numQuestions: number = 5,
  questionTypes?: QuestionType[],
  accessToken?: string
): Promise<Quiz> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const requestBody: GenerateQuizRequest = {
    document_id: documentId,
    num_questions: numQuestions,
  }
  
  if (questionTypes && questionTypes.length > 0) {
    requestBody.question_types = questionTypes
  }

  try {
    console.log('Generating quiz for document:', documentId)
    const response = await axios.post<GenerateQuizResponse>(
      '/api/v1/quizzes/generate',
      requestBody,
      { headers }
    )
    console.log('Quiz generation response:', response.data)
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Quiz generation error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to generate quiz: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while generating the quiz')
  }
}

/**
 * Get a quiz with its questions (for taking the quiz)
 */
export const getQuiz = async (
  quizId: string,
  accessToken?: string
): Promise<QuizWithQuestionsResponse> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await axios.get<QuizWithQuestionsResponse>(
      `/api/v1/quizzes/${quizId}`,
      { headers }
    )
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Get quiz error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to get quiz: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while fetching the quiz')
  }
}

/**
 * Submit quiz answers and get results
 */
export const submitQuiz = async (
  quizId: string,
  answers: Record<string, string>, // question_id -> answer
  accessToken?: string
): Promise<QuizResults> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const requestBody: SubmitQuizRequest = {
    answers: Object.entries(answers).map(([question_id, user_answer]) => ({
      question_id,
      user_answer,
    })),
  }

  try {
    console.log('Submitting quiz:', quizId)
    const response = await axios.post<SubmitQuizResponse>(
      `/api/v1/quizzes/${quizId}/submit`,
      requestBody,
      { headers }
    )
    console.log('Quiz submission response:', response.data)
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Quiz submission error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to submit quiz: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while submitting the quiz')
  }
}

/**
 * Get all quizzes for a document
 */
export const getQuizzesForDocument = async (
  documentId: string,
  accessToken?: string
): Promise<Quiz[]> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await axios.get<Quiz[]>(
      `/api/v1/documents/${documentId}/quizzes`,
      { headers }
    )
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Get quizzes error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to get quizzes: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while fetching quizzes')
  }
}
