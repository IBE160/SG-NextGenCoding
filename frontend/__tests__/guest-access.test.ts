import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Import userEvent
import '@testing-library/jest-dom';
import Page from '@/app/notes/page'; // Adjust path as necessary
import { cookies } from 'next/headers'; // This will be mocked by jest.mock('next/headers')

// Mock useRouter for navigation and cookies for server components
jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => { throw new Error('redirected'); }), // Make redirect throw an error
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isReady: true,
    asPath: '',
    pathname: '',
    query: {},
    route: '',
  })),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock @/lib/guest-usage module at the top level
jest.mock('@/lib/guest-usage', () => ({
  getUsageCount: jest.fn(),
  incrementUsageCount: jest.fn(),
  checkUsageLimit: jest.fn(),
  resetUsageCount: jest.fn(),
  GUEST_LIMIT: 2,
}));

// Define mocks here, outside of jest.mock callback scope
const mockAuth = {
  getUser: jest.fn<any, any[]>(() => Promise.resolve({ data: { user: null } })),
};
const mockSelect = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

// Mock @/utils/supabase module at the top level
jest.mock('@/utils/supabase', () => {
  return {
    createServerClient: jest.fn(() => ({
      auth: mockAuth,
      from: mockFrom,
    })),
    // We no longer need to expose them as __mockAuth or __mockSelect via the module mock
    // as they are directly accessible in this file's scope.
  };
});

// Import the mocked functions directly from the mocked module
import { getUsageCount, incrementUsageCount, checkUsageLimit, GUEST_LIMIT } from '@/lib/guest-usage';
// Removed: import { __mockAuth, __mockSelect } from '@/utils/supabase'; // Also directly import the exposed mocks

describe('Guest Access for Core Features', () => {
  // const mockRedirect = require('next/navigation').redirect; // This is no longer directly used for redirection

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset guest-usage mocks
    (getUsageCount as jest.Mock).mockClear();
    (incrementUsageCount as jest.Mock).mockClear();
    (checkUsageLimit as jest.Mock).mockClear();

    // Reset supabase mocks
    mockAuth.getUser.mockResolvedValue({ data: { user: null } });
    mockSelect.mockResolvedValue({ data: [], error: null });

    // mockRedirect.mockClear(); // Clear this if still used for other tests, but not for guest access now.
  });

  it('should allow guest access for the first use and increment usage', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } }); // Simulate guest user
    mockSelect.mockResolvedValue({ data: [{ id: 1, title: 'Guest Note 1' }], error: null });

    (getUsageCount as jest.Mock).mockReturnValue(0); // Set initial usage for this test
    (checkUsageLimit as jest.Mock).mockReturnValue(false); // Assume not limited initially
    (incrementUsageCount as jest.Mock).mockImplementation(() => {
      (getUsageCount as jest.Mock).mockReturnValue((getUsageCount() as number) + 1); // Simulate actual increment
    });

    render(await Page());

    expect(screen.getByText(/Guest Mode - Limited Access/i)).toBeInTheDocument();
    expect(screen.getByText(/You have 0 out of 2 free uses./i)).toBeInTheDocument(); // Initial state is 0

    // Simulate clicking the feature button
    await userEvent.click(screen.getByRole('button', { name: /Use Core Feature/i }));

    expect(incrementUsageCount).toHaveBeenCalledTimes(1);
    await waitFor(() => {
        expect(screen.getByText(/You have 1 out of 2 free uses./i)).toBeInTheDocument(); // After click, it's 1
    });
    expect(checkUsageLimit).toHaveBeenCalled();
  });

  it('should allow guest access up to the limit and increment usage', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } }); // Simulate guest user
    mockSelect.mockResolvedValue({ data: [{ id: 1, title: 'Guest Note 1' }], error: null });

    let currentUsage = 0;
    (getUsageCount as jest.Mock).mockImplementation(() => currentUsage);
    (incrementUsageCount as jest.Mock).mockImplementation(() => {
      currentUsage++;
      (getUsageCount as jest.Mock).mockReturnValue(currentUsage); // Update return value after increment
    });
    (checkUsageLimit as jest.Mock).mockImplementation(() => currentUsage >= GUEST_LIMIT);

    render(await Page()); // Render initially with 0 uses

    // First use
    await userEvent.click(screen.getByRole('button', { name: /Use Core Feature/i }));
    await waitFor(() => {
      expect(screen.getByText(/You have 1 out of 2 free uses./i)).toBeInTheDocument();
      expect(incrementUsageCount).toHaveBeenCalledTimes(1);
    });

    // Second use, which reaches the limit and blocks access
    await userEvent.click(screen.getByRole('button', { name: /Use Core Feature/i }));
    await waitFor(() => {
      expect(screen.getByText(/Guest Mode - Access Blocked/i)).toBeInTheDocument();
      expect(screen.getByText(/You have used your 2 free accesses./i)).toBeInTheDocument();
      expect(incrementUsageCount).toHaveBeenCalledTimes(2);
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // Check if modal is present
    });
  });


  it('should show registration modal when usage limit is reached', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null } }); // Simulate guest user
    mockSelect.mockResolvedValue({ data: [], error: null });

    (getUsageCount as jest.Mock).mockReturnValue(GUEST_LIMIT); // Usage already at limit
    (checkUsageLimit as jest.Mock).mockReturnValue(true); // Limit reached
    (incrementUsageCount as jest.Mock).mockClear(); // Should not be called if limit reached on initial load

    render(await Page());

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // Check if modal is present
      expect(screen.getByText(/Unlock Full Access/i)).toBeInTheDocument(); // Check modal title
    });
    expect(incrementUsageCount).not.toHaveBeenCalled(); // Should not increment if limit reached
  });

  it('should not affect authenticated users by guest limit', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } } }); // Simulate authenticated user
    mockSelect.mockResolvedValue({ data: [{ id: 1, title: 'Auth Note 1' }], error: null });

    // These should not be called for an authenticated user
    (getUsageCount as jest.Mock).mockClear();
    (incrementUsageCount as jest.Mock).mockClear();
    (checkUsageLimit as jest.Mock).mockClear();

    render(await Page());

    expect(screen.queryByText(/Guest Mode - Limited Access/i)).not.toBeInTheDocument();
    expect(getUsageCount).not.toHaveBeenCalled(); // Guest usage functions should not be called
    expect(incrementUsageCount).not.toHaveBeenCalled();
    expect(checkUsageLimit).not.toHaveBeenCalled();
    expect(screen.getByText(/Auth Note 1/i)).toBeInTheDocument(); // Expect output from authenticated path
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Modal should not be present
  });
});