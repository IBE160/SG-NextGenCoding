// frontend/__tests__/services/feedback.test.ts
import axios from 'axios'
import { submitFeedback, getFeedback, ContentType } from '@/services/feedback'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Feedback Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const feedbackResponse = {
        data: {
          id: 'feedback-123',
          content_id: 'content-123',
          content_type: 'summary' as ContentType,
          rating: 5,
          comment: 'Great summary!',
          created_at: '2025-12-08T00:00:00Z',
        },
        message: 'Feedback submitted successfully',
        status: 'success',
      }
      mockedAxios.post.mockResolvedValue({ data: feedbackResponse })

      const result = await submitFeedback(
        {
          content_id: 'content-123',
          content_type: 'summary',
          rating: 5,
          comment: 'Great summary!',
        },
        'test-token'
      )

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/feedback',
        {
          content_id: 'content-123',
          content_type: 'summary',
          rating: 5,
          comment: 'Great summary!',
        },
        {
          headers: { Authorization: 'Bearer test-token' },
        }
      )
      expect(result).toEqual(feedbackResponse.data)
    })

    it('should submit feedback without access token (anonymous)', async () => {
      const feedbackResponse = {
        data: {
          id: 'feedback-123',
          content_id: 'content-123',
          content_type: 'quiz' as ContentType,
          rating: 4,
          comment: null,
          created_at: '2025-12-08T00:00:00Z',
        },
        message: 'Feedback submitted successfully',
        status: 'success',
      }
      mockedAxios.post.mockResolvedValue({ data: feedbackResponse })

      const result = await submitFeedback({
        content_id: 'content-123',
        content_type: 'quiz',
        rating: 4,
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/feedback',
        {
          content_id: 'content-123',
          content_type: 'quiz',
          rating: 4,
        },
        {
          headers: {},
        }
      )
      expect(result).toEqual(feedbackResponse.data)
    })

    it('should handle axios errors when submitting feedback', async () => {
      const errorResponse = {
        response: {
          data: {
            detail: 'Content not found',
          },
        },
      }
      mockedAxios.post.mockRejectedValue(errorResponse)
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true)

      await expect(
        submitFeedback({
          content_id: 'invalid-id',
          content_type: 'summary',
          rating: 5,
        })
      ).rejects.toThrow('Failed to submit feedback: Content not found')
    })

    it('should handle unexpected errors when submitting feedback', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'))
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false)

      await expect(
        submitFeedback({
          content_id: 'content-123',
          content_type: 'summary',
          rating: 5,
        })
      ).rejects.toThrow('An unexpected error occurred while submitting feedback')
    })
  })

  describe('getFeedback', () => {
    it('should get feedback successfully', async () => {
      const feedbackListResponse = {
        data: [
          {
            id: 'feedback-123',
            content_id: 'content-123',
            content_type: 'summary' as ContentType,
            rating: 5,
            comment: 'Great!',
            created_at: '2025-12-08T00:00:00Z',
          },
        ],
        message: 'Found 1 feedback entries',
        status: 'success',
      }
      mockedAxios.get.mockResolvedValue({ data: feedbackListResponse })

      const result = await getFeedback('summary', 'content-123', 'test-token')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/feedback/summary/content-123',
        {
          headers: { Authorization: 'Bearer test-token' },
        }
      )
      expect(result).toEqual(feedbackListResponse.data)
    })

    it('should get feedback for quiz', async () => {
      const feedbackListResponse = {
        data: [],
        message: 'Found 0 feedback entries',
        status: 'success',
      }
      mockedAxios.get.mockResolvedValue({ data: feedbackListResponse })

      const result = await getFeedback('quiz', 'quiz-123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/feedback/quiz/quiz-123',
        {
          headers: {},
        }
      )
      expect(result).toEqual([])
    })

    it('should handle axios errors when getting feedback', async () => {
      const errorResponse = {
        response: {
          data: {
            detail: 'Not found',
          },
        },
      }
      mockedAxios.get.mockRejectedValue(errorResponse)
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true)

      await expect(getFeedback('summary', 'invalid-id')).rejects.toThrow(
        'Failed to get feedback: Not found'
      )
    })

    it('should handle unexpected errors when getting feedback', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'))
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false)

      await expect(getFeedback('summary', 'content-123')).rejects.toThrow(
        'An unexpected error occurred while getting feedback'
      )
    })
  })
})
