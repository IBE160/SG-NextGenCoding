// frontend/__tests__/SummaryDisplayPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies BEFORE importing the component
jest.mock('next/navigation', () => ({
  useParams: () => ({ document_id: 'test-doc-id' }),
}));

jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  };
});

jest.mock('react-copy-to-clipboard', () => ({
  CopyToClipboard: ({ children, onCopy }: any) => <div onClick={onCopy}>{children}</div>,
}));

jest.mock('../src/services/documents');
jest.mock('../src/utils/supabase');

import SummaryDisplayPage from '../src/app/summaries/[document_id]/page';
import { useSummaryStore } from '../src/lib/store';
import * as docService from '../src/services/documents';
import * as supabaseUtils from '../src/utils/supabase';

const mockGetSummary = docService.getSummary as jest.Mock;
const mockGetSummaryStatus = docService.getSummaryStatus as jest.Mock;
const mockCreateBrowserClient = supabaseUtils.createBrowserClient as jest.Mock;

// Mock initial state for Zustand store
const initialStoreState = useSummaryStore.getState();

describe('SummaryDisplayPage', () => {
  beforeEach(() => {
    // Reset store before each test
    useSummaryStore.setState(initialStoreState);
    jest.clearAllMocks();

    // Mock Supabase client
    mockCreateBrowserClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { access_token: 'test-token' } },
        }),
      },
    });
  });

  it('shows loading state initially', async () => {
    mockGetSummaryStatus.mockResolvedValue({ status: 'processing' });
    render(<SummaryDisplayPage />);
    expect(screen.getByText('Loading summary...')).toBeInTheDocument();
  });

  it('shows error message on failed status fetch', async () => {
    mockGetSummaryStatus.mockRejectedValue(new Error('API Error'));
    render(<SummaryDisplayPage />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch summary status.')).toBeInTheDocument();
    });
  });

  it('shows error message on failed summary generation', async () => {
    mockGetSummaryStatus.mockResolvedValue({ status: 'failed' });
    render(<SummaryDisplayPage />);
    await waitFor(() => {
      expect(screen.getByText('Summary generation failed.')).toBeInTheDocument();
    });
  });

  it('fetches and displays summary when status is completed', async () => {
    mockGetSummaryStatus.mockResolvedValue({ status: 'completed' });
    mockGetSummary.mockResolvedValue({ summary_text: '# Test Summary\n\n- Point 1\n- Point 2' });

    render(<SummaryDisplayPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary')).toBeInTheDocument();
      expect(screen.getByText('Point 1')).toBeInTheDocument();
    });
  });

  it('copies summary to clipboard', async () => {
    mockGetSummaryStatus.mockResolvedValue({ status: 'completed' });
    mockGetSummary.mockResolvedValue({ summary_text: 'This is a summary.' });
    
    // Mocking navigator.clipboard
    Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

    render(<SummaryDisplayPage />);

    await waitFor(() => {
        expect(screen.getByText('This is a summary.')).toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: 'Copy Summary' });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('This is a summary.');
      expect(copyButton.textContent).toBe('Copied!');
    });
  });
});