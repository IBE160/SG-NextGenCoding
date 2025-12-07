import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from '@/app/auth/register/page'
import { useRouter } from 'next/navigation'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('RegisterPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

  let fetchSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('renders the registration form', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    render(<RegisterPage />)
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/please enter a valid email address/i),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/password must be at least 6 characters/i),
    ).toBeInTheDocument()
  })

  it('shows validation error for mismatched passwords', async () => {
    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password456' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
  })

  it('submits the form successfully and redirects', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    })

    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost/api/v1/auth/register',
        expect.any(Object),
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/check-email')
    })
  })

  it('shows an error message on failed submission', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Registration failed' }),
    })

    render(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fail@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost/api/v1/auth/register',
      expect.any(Object),
    )
  })
})
