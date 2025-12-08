// frontend/src/services/history.ts

import axios from 'axios'

export type HistoryItemType = 'summary' | 'quiz'

export interface SummaryHistoryItem {
  id: string
  document_id: string
  document_title: string
  summary_preview: string | null
  generated_at: string
  ai_model: string
  type: 'summary'
}

export interface QuizHistoryItem {
  id: string
  document_id: string
  document_title: string
  title: string
  status: string
  total_questions: number
  created_at: string
  ai_model: string
  type: 'quiz'
}

export interface CombinedHistoryItem {
  id: string
  document_id: string
  document_title: string
  title: string | null
  preview: string | null
  type: HistoryItemType
  status: string | null
  total_questions: number | null
  created_at: string
  ai_model: string
}

export interface SummaryHistoryResponse {
  data: SummaryHistoryItem[]
  message: string
  status: string
  total: number
}

export interface QuizHistoryResponse {
  data: QuizHistoryItem[]
  message: string
  status: string
  total: number
}

export interface CombinedHistoryResponse {
  data: CombinedHistoryItem[]
  message: string
  status: string
  total: number
}

/**
 * Get summary history for authenticated user
 */
export const getSummaryHistory = async (
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<SummaryHistoryResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const response = await axios.get<SummaryHistoryResponse>(
      `/api/v1/history/summaries?limit=${limit}&offset=${offset}`,
      { headers }
    )
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to fetch summary history: ${errorMessage}`)
    }
    throw new Error(`An unexpected error occurred: ${error.message}`)
  }
}

/**
 * Get quiz history for authenticated user
 */
export const getQuizHistory = async (
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<QuizHistoryResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const response = await axios.get<QuizHistoryResponse>(
      `/api/v1/history/quizzes?limit=${limit}&offset=${offset}`,
      { headers }
    )
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to fetch quiz history: ${errorMessage}`)
    }
    throw new Error(`An unexpected error occurred: ${error.message}`)
  }
}

/**
 * Get combined history (summaries + quizzes) for authenticated user
 */
export const getCombinedHistory = async (
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<CombinedHistoryResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const response = await axios.get<CombinedHistoryResponse>(
      `/api/v1/history?limit=${limit}&offset=${offset}`,
      { headers }
    )
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to fetch history: ${errorMessage}`)
    }
    throw new Error(`An unexpected error occurred: ${error.message}`)
  }
}

// ============================================================================
// Quiz Review Types and Functions (Story 5.2)
// ============================================================================

export interface QuestionReviewItem {
  id: string
  question_text: string
  question_type: string
  options: string[] | null
  correct_answer: string
  explanation: string | null
  user_answer: string | null
  is_correct: boolean | null
  order_index: number
}

export interface QuizReviewDetail {
  id: string
  document_id: string
  document_title: string
  title: string
  status: string
  total_questions: number
  score: number
  score_percentage: number
  ai_model: string
  created_at: string
  questions: QuestionReviewItem[]
}

export interface QuizReviewResponse {
  data: QuizReviewDetail
  message: string
  status: string
}

/**
 * Get detailed quiz review with user's answers
 */
export const getQuizReview = async (
  accessToken: string,
  quizId: string
): Promise<QuizReviewResponse> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const response = await axios.get<QuizReviewResponse>(
      `/api/v1/history/quizzes/${quizId}`,
      { headers }
    )
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to fetch quiz review: ${errorMessage}`)
    }
    throw new Error(`An unexpected error occurred: ${error.message}`)
  }
}
