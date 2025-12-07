import { render, screen, waitFor } from '@testing-library/react'
import AuthCallbackPage from '@/app/auth/callback/page'
import { useRouter } from 'next/navigation'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('AuthCallbackPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders the verification message', () => {
    render(<AuthCallbackPage />)
    expect(screen.getByText('Email Verified!')).toBeInTheDocument()
    expect(
      screen.getByText('Your email address has been successfully verified.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('You will be redirected to the login page shortly.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Click here to login now')).toBeInTheDocument()
  })

  it('redirects to the login page after 5 seconds', async () => {
    render(<AuthCallbackPage />)

    expect(mockRouter.push).not.toHaveBeenCalled()

    // Fast-forward time by 5 seconds
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  it('clears the timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const { unmount } = render(<AuthCallbackPage />)

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
