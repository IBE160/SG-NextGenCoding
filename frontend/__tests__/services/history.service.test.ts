// frontend/__tests__/services/history.service.test.ts

import axios from 'axios'
import {
  getSummaryHistory,
  getQuizHistory,
  getCombinedHistory,
  type SummaryHistoryResponse,
  type QuizHistoryResponse,
  type CombinedHistoryResponse,
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

describe('history service', () => {
  const mockAccessToken = 'test-access-token'

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.isAxiosError = jest.fn((error: any) => error?.isAxiosError === true)
  })

  describe('getSummaryHistory', () => {
    it('should fetch summary history successfully', async () => {
      const mockResponse: SummaryHistoryResponse = {
        data: [
          {
            id: 'summary-1',
            document_id: 'doc-1',
            document_title: 'Test Document.pdf',
            summary_preview: 'This is a test summary preview...',
            generated_at: '2025-12-08T10:00:00Z',
            ai_model: 'gemini-1.5-flash',
            type: 'summary',
          },
        ],
        message: 'Retrieved 1 summaries',
        status: 'success',
        total: 1,
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getSummaryHistory(mockAccessToken)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/history/summaries?limit=50&offset=0',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle pagination parameters', async () => {
      const mockResponse: SummaryHistoryResponse = {
        data: [],
        message: 'Retrieved 0 summaries',
        status: 'success',
        total: 0,
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse })

      await getSummaryHistory(mockAccessToken, 10, 20)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/history/summaries?limit=10&offset=20',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
    })

    it('should throw error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(createAxiosError('Unauthorized', 401))

      await expect(getSummaryHistory(mockAccessToken)).rejects.toThrow(
        'Failed to fetch summary history: Unauthorized'
      )
    })
  })

  describe('getQuizHistory', () => {
    it('should fetch quiz history successfully', async () => {
      const mockResponse: QuizHistoryResponse = {
        data: [
          {
            id: 'quiz-1',
            document_id: 'doc-1',
            document_title: 'Test Document.pdf',
            title: 'Quiz for Test Document',
            status: 'ready',
            total_questions: 5,
            created_at: '2025-12-08T11:00:00Z',
            ai_model: 'gemini-2.5-flash',
            type: 'quiz',
          },
        ],
        message: 'Retrieved 1 quizzes',
        status: 'success',
        total: 1,
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getQuizHistory(mockAccessToken)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/history/quizzes?limit=50&offset=0',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(createAxiosError('Server error', 500))

      await expect(getQuizHistory(mockAccessToken)).rejects.toThrow(
        'Failed to fetch quiz history: Server error'
      )
    })
  })

  describe('getCombinedHistory', () => {
    it('should fetch combined history successfully', async () => {
      const mockResponse: CombinedHistoryResponse = {
        data: [
          {
            id: 'summary-1',
            document_id: 'doc-1',
            document_title: 'Test Document.pdf',
            title: null,
            preview: 'This is a test summary preview...',
            type: 'summary',
            status: null,
            total_questions: null,
            created_at: '2025-12-08T12:00:00Z',
            ai_model: 'gemini-1.5-flash',
          },
          {
            id: 'quiz-1',
            document_id: 'doc-1',
            document_title: 'Test Document.pdf',
            title: 'Quiz for Test Document',
            preview: null,
            type: 'quiz',
            status: 'ready',
            total_questions: 5,
            created_at: '2025-12-08T11:00:00Z',
            ai_model: 'gemini-2.5-flash',
          },
        ],
        message: 'Retrieved 2 history items',
        status: 'success',
        total: 2,
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getCombinedHistory(mockAccessToken)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/history?limit=50&offset=0',
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle empty history', async () => {
      const mockResponse: CombinedHistoryResponse = {
        data: [],
        message: 'Retrieved 0 history items',
        status: 'success',
        total: 0,
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getCombinedHistory(mockAccessToken)

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should throw error on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(createAxiosError('Authentication required', 401))

      await expect(getCombinedHistory(mockAccessToken)).rejects.toThrow(
        'Failed to fetch history: Authentication required'
      )
    })
  })
})
