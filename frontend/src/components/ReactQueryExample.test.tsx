import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReactQueryExample from './ReactQueryExample'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Helper to render with fresh QueryClient
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { 
        retry: false,
        gcTime: 0, // Don't cache between tests
      } 
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('<ReactQueryExample/>', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Renders the loading screen', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})) // Never resolves
    renderWithQueryClient(<ReactQueryExample />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('Renders data from the handler', async () => {
    mockedAxios.get.mockResolvedValue({ data: { message: 'Hello from the handler!' } })
    renderWithQueryClient(<ReactQueryExample />)

    await screen.findByText('Hello from the handler!')
  })

  it('Renders data from overridden handler', async () => {
    mockedAxios.get.mockResolvedValue({ data: { message: 'Hello from the overridden handler!' } })

    renderWithQueryClient(<ReactQueryExample />)

    await screen.findByText('Hello from the overridden handler!')
  })
})
