// frontend/__tests__/summaries/SummaryPage.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SummaryPage from '@/app/summaries/[document_id]/page'
import { usePolling } from '@/hooks/use-polling'

// Mock the necessary hooks and components
jest.mock('next/navigation', () => ({
  useParams: () => ({ document_id: '123' }),
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('../../src/providers/AuthProvider', () => ({
  useAuth: () => ({ session: { access_token: 'test-token' } }),
}))

const mockStore = {
  summary: null,
  loading: false,
  error: null,
  setSummary: jest.fn(),
  setLoading: jest.fn(),
  setError: jest.fn(),
}

jest.mock('@/lib/store', () => ({
  useSummaryStore: (selector: (state: any) => any) => selector(mockStore),
}))

jest.mock('@/hooks/use-polling', () => ({
  usePolling: jest.fn(() => ({
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    isPolling: false,
  })),
}))

jest.mock('@/services/documents', () => ({
  getSummary: jest.fn(),
  getSummaryStatus: jest.fn(),
}))

describe('SummaryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStore.summary = null
    mockStore.loading = false
    mockStore.error = null
  })

  it('renders the loading state correctly', () => {
    mockStore.loading = true
    render(<SummaryPage />)
    expect(
      screen.getByText('Processing your summary, please wait...'),
    ).toBeInTheDocument()
  })

  it('renders the error state correctly', () => {
    mockStore.error = 'Failed to generate summary.'
    render(<SummaryPage />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to generate summary.')).toBeInTheDocument()
  })

  it('renders the "not available" state correctly', () => {
    render(<SummaryPage />)
    expect(screen.getByText('Summary Not Available')).toBeInTheDocument()
  })

  it('renders the summary and handles copy to clipboard', async () => {
    mockStore.summary = 'This is a test summary.'
    render(<SummaryPage />)

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('This is a test summary.')).toBeInTheDocument()

    const copyButton = screen.getByText('Copy to Clipboard')
    fireEvent.click(copyButton)

    expect(screen.getByText('Copied!')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
      },
      { timeout: 2100 },
    )
  })
})
