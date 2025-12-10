import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import { useRouter } from 'next/navigation'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams('')), // Add useSearchParams mock
}))

// Mock the cookies from next/headers for middleware testing (though this test focuses on form)
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}))

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

  let fetchSpy: jest.SpyInstance
  const originalLocation = window.location

  beforeEach(() => {
    jest.clearAllMocks()
    fetchSpy = jest.spyOn(global, 'fetch')
    // Mock NEXT_PUBLIC_BACKEND_URL for the API route fetch
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:8000'
    
    // Mock window.location
    delete (window as any).location
    window.location = { ...originalLocation, href: '' } as any
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    delete process.env.NEXT_PUBLIC_BACKEND_URL
    window.location = originalLocation
  })

  it('renders the login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/password must be at least 6 characters/i),
    ).toBeInTheDocument()
  })

  it('submits the form successfully and redirects to dashboard', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, token_type: 'bearer' }),
    })

    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      // Expect fetch to have been called on the local Next.js API route
      expect(fetchSpy).toHaveBeenCalledWith('/api/login', expect.any(Object))
      // The page uses window.location.href for redirect
      expect(window.location.href).toBe('/dashboard')
    })
  })

  it('shows an error message on failed submission', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid credentials' }),
    })

    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fail@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledWith('/api/login', expect.any(Object))
  })
})
