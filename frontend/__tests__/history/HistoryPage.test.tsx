// frontend/__tests__/history/HistoryPage.test.tsx

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HistoryPage from '../../src/app/history/page'
import * as historyService from '../../src/services/history'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock history service
jest.mock('../../src/services/history')
const mockedHistoryService = historyService as jest.Mocked<typeof historyService>

// Mock document.cookie
const mockCookie = (token: string | null) => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: token ? `access_token=${token}` : '',
  })
}

describe('HistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockCookie(null)
    })

    it('should show sign in prompt for unauthenticated users', async () => {
      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByText('Sign in to view your learning history')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe('when user is authenticated', () => {
    const mockToken = 'test-access-token'

    beforeEach(() => {
      mockCookie(mockToken)
    })

    it('should show loading state initially', async () => {
      mockedHistoryService.getCombinedHistory.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByText('Loading your learning history...')).toBeInTheDocument()
      })
    })

    it('should display history items when loaded', async () => {
      const mockHistoryData: historyService.CombinedHistoryResponse = {
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
            created_at: '2025-12-08T10:00:00Z',
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
            created_at: '2025-12-08T09:00:00Z',
            ai_model: 'gemini-2.5-flash',
          },
        ],
        message: 'Retrieved 2 history items',
        status: 'success',
        total: 2,
      }

      mockedHistoryService.getCombinedHistory.mockResolvedValueOnce(mockHistoryData)

      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByText('2 items in your history')).toBeInTheDocument()
      })

      // Check summary item is displayed
      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(screen.getByText('This is a test summary preview...')).toBeInTheDocument()

      // Check quiz item is displayed
      expect(screen.getByText('Quiz')).toBeInTheDocument()
      expect(screen.getByText('Quiz for Test Document')).toBeInTheDocument()
      expect(screen.getByText('5 questions')).toBeInTheDocument()
    })

    it('should display empty state when no history', async () => {
      mockedHistoryService.getCombinedHistory.mockResolvedValueOnce({
        data: [],
        message: 'Retrieved 0 history items',
        status: 'success',
        total: 0,
      })

      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByText('Your history is empty. Start by uploading a document to generate summaries and quizzes.')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument()
    })

    it('should display error state on API failure', async () => {
      mockedHistoryService.getCombinedHistory.mockRejectedValueOnce(
        new Error('Failed to fetch history')
      )

      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch history')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should refresh history when refresh button is clicked', async () => {
      mockedHistoryService.getCombinedHistory.mockResolvedValue({
        data: [],
        message: 'Retrieved 0 history items',
        status: 'success',
        total: 0,
      })

      render(<HistoryPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /refresh/i }))

      await waitFor(() => {
        expect(mockedHistoryService.getCombinedHistory).toHaveBeenCalledTimes(2)
      })
    })
  })
})
