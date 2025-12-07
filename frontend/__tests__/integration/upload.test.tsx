// frontend/__tests__/integration/upload.test.tsx

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server'; // Use server for Node.js tests
import { http, HttpResponse } from 'msw'; // Import http and HttpResponse
import UploadPage from '@/app/upload/page';
import { MAX_GUEST_UPLOADS } from '@/app/upload/page';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}));

// Mock Supabase session for testing
jest.mock('@/lib/supabase', () => ({
  getSession: jest.fn(() => Promise.resolve(null)), // Default to guest user
  // Add other exports if needed, e.g., getUser, createSupabaseBrowserClient
}));

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

// Use worker.use() for test-specific handlers
// The global worker is started/stopped in jest.setup.ts
// Test-specific handlers can be added using worker.use()

describe('UploadPage Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.use( // Use server.use for handlers
      http.post('http://localhost/api/v1/documents/upload', async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
          return HttpResponse.json({ detail: 'No file provided' }, { status: 400 });
        }

        const ALLOWED_FILE_TYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          return HttpResponse.json({ detail: `Unsupported file type: ${file.type}` }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return HttpResponse.json({ detail: `File size exceeds limit. Max size is 20MB.` }, { status: 400 });
        }

        const document_id = uuidv4();
        return HttpResponse.json({
          document_id: document_id,
          message: 'File upload initiated successfully. Processing will begin shortly.',
        }, { status: 202 });
      }),
    );
  });

  afterEach(() => {
    localStorage.clear();
    mockAlert.mockClear();
  });

  it('renders the upload zone and handles file selection for a guest user', async () => {
    render(<UploadPage />);

    // Initial state for guest user
    expect(screen.getByLabelText(/file upload area/i)).toBeInTheDocument();
    expect(screen.getByText(/As a guest, you have 2 free uploads remaining/i)).toBeInTheDocument();

    const fileInput = screen.getByLabelText(/file upload area/i).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    
    // Simulate file selection
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/File uploaded successfully!/i)).toBeInTheDocument();
    });

    // Check guest count update (local storage is not mocked, so just check UI reflection)
    expect(screen.getByText(/As a guest, you have 1 free uploads remaining/i)).toBeInTheDocument();
  });

  it('displays an error for unsupported file types', async () => {
    render(<UploadPage />);
    const fileInput = screen.getByLabelText(/file upload area/i).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['<svg></svg>'], 'image.svg', { type: 'image/svg+xml' });
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Unsupported file type: image\/svg\+xml/i)).toBeInTheDocument();
      expect(screen.queryByText(/File uploaded successfully!/i)).not.toBeInTheDocument();
    });
  });

  it('displays an error for oversized files', async () => {
    render(<UploadPage />);
    const fileInput = screen.getByLabelText(/file upload area/i).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;

    const oversizedContent = new Blob([new ArrayBuffer(21 * 1024 * 1024)], { type: 'application/pdf' }); // 21MB
    const file = new File([oversizedContent], 'large.pdf', { type: 'application/pdf' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/File size exceeds limit. Max size is 20MB./i)).toBeInTheDocument();
      expect(screen.queryByText(/File uploaded successfully!/i)).not.toBeInTheDocument();
    });
  });

  it('shows login prompt after guest limit is reached', async () => {
    // Set initial guest count to MAX_GUEST_UPLOADS - 1
    localStorage.setItem('guest_uploads_count', (MAX_GUEST_UPLOADS - 1).toString());

    render(<UploadPage />);

    const fileInput = screen.getByLabelText(/file upload area/i).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    
    // Upload once to reach limit
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/Free Upload Limit Reached!/i)).toBeInTheDocument();
      expect(screen.getByText(/Please log in or register to continue uploading files./i)).toBeInTheDocument();
    });

    // Ensure the upload zone is no longer interactive for new uploads
    const newFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, newFile); // Try to upload again

    // Expect the alert from page.tsx to pop up
    await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Please log in or register to continue uploading.'); // Alert for trying to upload again
    })
    expect(screen.getByText(/File uploaded successfully!/i)).toBeInTheDocument(); // Previous upload success
  });
});