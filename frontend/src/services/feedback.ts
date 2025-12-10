// frontend/src/services/feedback.ts

import axios from 'axios'

export type ContentType = 'summary' | 'quiz'

export interface FeedbackRequest {
  content_id: string
  content_type: ContentType
  rating: number
  comment?: string
}

export interface FeedbackResponse {
  id: string
  content_id: string
  content_type: ContentType
  rating: number
  comment: string | null
  created_at: string
}

export interface FeedbackCreateResponse {
  data: FeedbackResponse
  message: string
  status: string
}

export interface FeedbackListResponse {
  data: FeedbackResponse[]
  message: string
  status: string
}

/**
 * Submit feedback for a summary or quiz
 */
export const submitFeedback = async (
  feedback: FeedbackRequest,
  accessToken?: string
): Promise<FeedbackResponse> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    console.log('Submitting feedback:', feedback)
    const response = await axios.post<FeedbackCreateResponse>(
      '/api/v1/feedback',
      feedback,
      { headers }
    )
    console.log('Feedback submission response:', response.data)
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Feedback submission error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to submit feedback: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while submitting feedback')
  }
}

/**
 * Get feedback for a specific content
 */
export const getFeedback = async (
  contentType: ContentType,
  contentId: string,
  accessToken?: string
): Promise<FeedbackResponse[]> => {
  const headers: Record<string, string> = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    console.log(`Getting feedback for ${contentType}:`, contentId)
    const response = await axios.get<FeedbackListResponse>(
      `/api/v1/feedback/${contentType}/${contentId}`,
      { headers }
    )
    console.log('Feedback retrieval response:', response.data)
    return response.data.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Feedback retrieval error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message
      throw new Error(`Failed to get feedback: ${errorMessage}`)
    }
    throw new Error('An unexpected error occurred while getting feedback')
  }
}
