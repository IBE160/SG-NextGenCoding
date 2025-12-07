// frontend/__tests__/integration/upload.test.tsx

import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadPage from '@/app/upload/page'
import { MAX_GUEST_UPLOADS } from '@/app/upload/page'

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}))

// Mock the documents service directly
jest.mock('@/services/documents', () => ({
  uploadDocument: jest.fn(),
}))

// Mock Supabase session for testing
jest.mock('@/lib/supabase', () => ({
  getSession: jest.fn(() => Promise.resolve(null)), // Default to guest user
}))

// Mock window.alert
const mockAlert = jest.fn()
window.alert = mockAlert

import { uploadDocument } from '@/services/documents'
const mockUploadDocument = uploadDocument as jest.MockedFunction<typeof uploadDocument>

describe('UploadPage Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Clear localStorage and set default guest count
    localStorage.clear()
    localStorage.setItem('guest_uploads_count', '0')
    
    // Mock successful upload by default
    mockUploadDocument.mockResolvedValue({
      document_id: 'mock-uuid-v4',
      message: 'File upload initiated successfully. Processing will begin shortly.',
    })
  })

  afterEach(() => {
    localStorage.clear()
    mockAlert.mockClear()
    mockUploadDocument.mockClear()
  })

  it('renders the upload zone and handles file selection for a guest user', async () => {
    render(<UploadPage />)

    // Initial state for guest user
    expect(screen.getByLabelText(/file upload area/i)).toBeInTheDocument()
    expect(
      screen.getByText(/As a guest, you have 2 free uploads remaining/i),
    ).toBeInTheDocument()

    const fileInput = screen
      .getByLabelText(/file upload area/i)
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    // Simulate file selection
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(
        screen.getByText(/File uploaded successfully!/i),
      ).toBeInTheDocument()
    })

    // Check guest count update
    await waitFor(() => {
      expect(
        screen.getByText(/As a guest, you have 1 free uploads remaining/i),
      ).toBeInTheDocument()
    })
  })

  it('displays an error for unsupported file types', async () => {
    render(<UploadPage />)
    const fileInput = screen
      .getByLabelText(/file upload area/i)
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement

    const file = new File(['<svg></svg>'], 'image.svg', {
      type: 'image/svg+xml',
    })
    await user.upload(fileInput, file)

    // Unsupported file type validation happens on the frontend before upload
    await waitFor(() => {
      expect(
        screen.getByText(/Unsupported file type/i),
      ).toBeInTheDocument()
    })
  })

  it('displays an error for oversized files', async () => {
    render(<UploadPage />)
    const fileInput = screen
      .getByLabelText(/file upload area/i)
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement

    const oversizedContent = new Blob([new ArrayBuffer(21 * 1024 * 1024)], {
      type: 'application/pdf',
    }) // 21MB
    const file = new File([oversizedContent], 'large.pdf', {
      type: 'application/pdf',
    })

    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(
        screen.getByText(/File size exceeds limit. Max size is 20MB./i),
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/File uploaded successfully!/i),
      ).not.toBeInTheDocument()
    })
  })

  it('shows login prompt after guest limit is reached', async () => {
    // Set initial guest count to MAX_GUEST_UPLOADS - 1
    localStorage.setItem(
      'guest_uploads_count',
      (MAX_GUEST_UPLOADS - 1).toString(),
    )

    render(<UploadPage />)

    const fileInput = screen
      .getByLabelText(/file upload area/i)
      .closest('div')
      ?.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    // Upload once to reach limit
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(
        screen.getByText(/Free Upload Limit Reached!/i),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /Please log in or register to continue uploading files./i,
        ),
      ).toBeInTheDocument()
    })

    // Ensure the upload zone is no longer interactive for new uploads
    const newFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, newFile) // Try to upload again

    // Expect the alert from page.tsx to pop up
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Please log in or register to continue uploading.',
      ) // Alert for trying to upload again
    })
    expect(screen.getByText(/File uploaded successfully!/i)).toBeInTheDocument() // Previous upload success
  })
})
