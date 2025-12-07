// frontend/__tests__/quizzes/quizzes.service.test.ts

import axios from 'axios'
import {
  generateQuiz,
  getQuiz,
  submitQuiz,
  getQuizzesForDocument,
} from '../../src/services/quizzes'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Quizzes Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateQuiz', () => {
    const mockQuizResponse = {
      data: {
        data: {
          id: 'quiz-123',
          document_id: 'doc-456',
          title: 'Test Quiz',
          status: 'ready',
          total_questions: 5,
          created_at: '2025-12-07T12:00:00Z',
        },
        message: 'Quiz generated successfully.',
        status: 'success',
      },
    }

    it('should generate a quiz successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockQuizResponse)

      const result = await generateQuiz('doc-456', 5)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/quizzes/generate',
        { document_id: 'doc-456', num_questions: 5 },
        { headers: {} }
      )
      expect(result.id).toBe('quiz-123')
      expect(result.status).toBe('ready')
    })

    it('should include authorization header when token provided', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockQuizResponse)

      await generateQuiz('doc-456', 5, undefined, 'test-token')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/quizzes/generate',
        expect.any(Object),
        { headers: { Authorization: 'Bearer test-token' } }
      )
    })

    it('should throw error on failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { detail: 'Document not found' } },
      })
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true)

      await expect(generateQuiz('invalid-doc')).rejects.toThrow(
        'Failed to generate quiz: Document not found'
      )
    })
  })

  describe('getQuiz', () => {
    const mockQuizWithQuestions = {
      data: {
        id: 'quiz-123',
        document_id: 'doc-456',
        title: 'Test Quiz',
        status: 'ready',
        total_questions: 2,
        created_at: '2025-12-07T12:00:00Z',
        questions: [
          {
            id: 'q1',
            question_type: 'multiple_choice',
            question_text: 'What is 2 + 2?',
            options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
            order_index: 0,
          },
        ],
      },
    }

    it('should fetch quiz with questions', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockQuizWithQuestions)

      const result = await getQuiz('quiz-123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/quizzes/quiz-123',
        { headers: {} }
      )
      expect(result.id).toBe('quiz-123')
      expect(result.questions).toHaveLength(1)
    })

    it('should throw error when quiz not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { detail: 'Quiz not found' } },
      })
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true)

      await expect(getQuiz('invalid-quiz')).rejects.toThrow(
        'Failed to get quiz: Quiz not found'
      )
    })
  })

  describe('submitQuiz', () => {
    const mockSubmitResponse = {
      data: {
        data: {
          quiz_id: 'quiz-123',
          score: 4,
          total: 5,
          percentage: 80,
          results: [
            { question_id: 'q1', is_correct: true, user_answer: 'B', correct_answer: 'B', explanation: null },
          ],
        },
        message: 'Quiz submitted successfully.',
        status: 'success',
      },
    }

    it('should submit quiz answers and return results', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockSubmitResponse)

      const answers = { q1: 'B', q2: 'True' }
      const result = await submitQuiz('quiz-123', answers)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/quizzes/quiz-123/submit',
        {
          answers: [
            { question_id: 'q1', user_answer: 'B' },
            { question_id: 'q2', user_answer: 'True' },
          ],
        },
        { headers: {} }
      )
      expect(result.score).toBe(4)
      expect(result.percentage).toBe(80)
    })
  })

  describe('getQuizzesForDocument', () => {
    const mockQuizzesList = {
      data: [
        { id: 'quiz-1', document_id: 'doc-456', title: 'Quiz 1', status: 'ready', total_questions: 5 },
        { id: 'quiz-2', document_id: 'doc-456', title: 'Quiz 2', status: 'ready', total_questions: 10 },
      ],
    }

    it('should fetch all quizzes for a document', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockQuizzesList)

      const result = await getQuizzesForDocument('doc-456')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/documents/doc-456/quizzes',
        { headers: {} }
      )
      expect(result).toHaveLength(2)
    })
  })
})
