// frontend/__tests__/services/history.quizReview.test.ts

import axios from 'axios'
import {
  getQuizReview,
  type QuizReviewResponse,
} from '../../src/services/history'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Helper to create proper axios error mock
const createAxiosError = (detail: string, statusCode: number) => {
  const error = new Error(`Request failed with status code ${statusCode}`) as any
  error.isAxiosError = true
  error.response = { data: { detail } }
  return error
}

describe('getQuizReview', () => {
  const mockAccessToken = 'test-access-token'

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.isAxiosError = jest.fn((error: any) => error?.isAxiosError === true)
  })

  const mockQuizReviewResponse: QuizReviewResponse = {
    data: {
      id: 'quiz-123',
      document_id: 'doc-456',
      document_title: 'Test Document.pdf',
      title: 'Test Quiz',
      status: 'ready',
      total_questions: 3,
      score: 2,
      score_percentage: 66.7,
      ai_model: 'gemini-2.5-flash',
      created_at: '2025-12-08T10:00:00Z',
      questions: [
        {
          id: 'q1',
          question_text: 'What is 2 + 2?',
          question_type: 'multiple_choice',
          options: ['3', '4', '5', '6'],
          correct_answer: '4',
          explanation: 'Basic math',
          user_answer: '4',
          is_correct: true,
          order_index: 0,
        },
        {
          id: 'q2',
          question_text: 'Is the sky blue?',
          question_type: 'true_false',
          options: ['True', 'False'],
          correct_answer: 'True',
          explanation: 'The sky appears blue due to light scattering',
          user_answer: 'False',
          is_correct: false,
          order_index: 1,
        },
        {
          id: 'q3',
          question_text: 'Name the capital of France',
          question_type: 'short_answer',
          options: null,
          correct_answer: 'Paris',
          explanation: 'Paris is the capital',
          user_answer: 'Paris',
          is_correct: true,
          order_index: 2,
        },
      ],
    },
    message: 'Quiz review retrieved successfully',
    status: 'success',
  }

  it('should fetch quiz review successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockQuizReviewResponse })

    const result = await getQuizReview(mockAccessToken, 'quiz-123')

    expect(result).toEqual(mockQuizReviewResponse)
    expect(result.data.id).toBe('quiz-123')
    expect(result.data.score).toBe(2)
    expect(result.data.total_questions).toBe(3)
    expect(result.data.questions).toHaveLength(3)
    expect(mockedAxios.get).toHaveBeenCalledWith(
      '/api/v1/history/quizzes/quiz-123',
      { headers: { Authorization: `Bearer ${mockAccessToken}` } }
    )
  })

  it('should handle 404 not found error', async () => {
    mockedAxios.get.mockRejectedValueOnce(
      createAxiosError('Quiz not found', 404)
    )

    await expect(getQuizReview(mockAccessToken, 'invalid-id')).rejects.toThrow(
      'Failed to fetch quiz review: Quiz not found'
    )
  })

  it('should handle 403 forbidden error', async () => {
    mockedAxios.get.mockRejectedValueOnce(
      createAxiosError("You don't have permission to view this quiz", 403)
    )

    await expect(getQuizReview(mockAccessToken, 'other-user-quiz')).rejects.toThrow(
      "Failed to fetch quiz review: You don't have permission to view this quiz"
    )
  })

  it('should handle 401 unauthorized error', async () => {
    mockedAxios.get.mockRejectedValueOnce(
      createAxiosError('Authentication required to view quiz review', 401)
    )

    await expect(getQuizReview(mockAccessToken, 'quiz-123')).rejects.toThrow(
      'Failed to fetch quiz review: Authentication required to view quiz review'
    )
  })

  it('should handle network error', async () => {
    const networkError = new Error('Network Error')
    mockedAxios.get.mockRejectedValueOnce(networkError)

    await expect(getQuizReview(mockAccessToken, 'quiz-123')).rejects.toThrow()
  })

  it('should correctly parse questions with correct and incorrect answers', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockQuizReviewResponse })

    const result = await getQuizReview(mockAccessToken, 'quiz-123')
    const questions = result.data.questions

    // First question is correct
    expect(questions[0].is_correct).toBe(true)
    expect(questions[0].user_answer).toBe('4')
    expect(questions[0].correct_answer).toBe('4')

    // Second question is incorrect
    expect(questions[1].is_correct).toBe(false)
    expect(questions[1].user_answer).toBe('False')
    expect(questions[1].correct_answer).toBe('True')

    // Third question is correct
    expect(questions[2].is_correct).toBe(true)
  })

  it('should handle questions without user answers', async () => {
    const responseWithNoAnswers: QuizReviewResponse = {
      ...mockQuizReviewResponse,
      data: {
        ...mockQuizReviewResponse.data,
        score: 0,
        score_percentage: 0,
        questions: mockQuizReviewResponse.data.questions.map((q) => ({
          ...q,
          user_answer: null,
          is_correct: null,
        })),
      },
    }

    mockedAxios.get.mockResolvedValueOnce({ data: responseWithNoAnswers })

    const result = await getQuizReview(mockAccessToken, 'quiz-123')

    expect(result.data.score).toBe(0)
    expect(result.data.score_percentage).toBe(0)
    result.data.questions.forEach((q) => {
      expect(q.user_answer).toBeNull()
      expect(q.is_correct).toBeNull()
    })
  })

  it('should include score percentage in response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockQuizReviewResponse })

    const result = await getQuizReview(mockAccessToken, 'quiz-123')

    expect(result.data.score_percentage).toBe(66.7)
  })
})
