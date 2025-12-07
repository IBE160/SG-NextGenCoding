// frontend/__tests__/services/documents.test.ts
import axios from 'axios'
import { getSummary, getSummaryStatus } from '@/services/documents'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Document Service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getSummary', () => {
    it('should fetch the summary successfully', async () => {
      const summaryData = { summary_text: 'This is a test summary.' }
      mockedAxios.get.mockResolvedValue({ data: summaryData })

      const result = await getSummary('123', 'test-token')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/documents/123/summary',
        {
          headers: { Authorization: 'Bearer test-token' },
        },
      )
      expect(result).toEqual(summaryData)
    })

    it('should handle errors when fetching the summary', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'))

      await expect(getSummary('123', 'test-token')).rejects.toThrow(
        'An unexpected error occurred while getting summary: Failed to fetch',
      )
    })
  })

  describe('getSummaryStatus', () => {
    it('should fetch the summary status successfully', async () => {
      const statusData = { status: 'completed' }
      mockedAxios.get.mockResolvedValue({ data: statusData })

      const result = await getSummaryStatus('123', 'test-token')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/v1/documents/123/status',
        {
          headers: { Authorization: 'Bearer test-token' },
        },
      )
      expect(result).toEqual(statusData)
    })

    it('should handle errors when fetching the summary status', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'))

      await expect(getSummaryStatus('123', 'test-token')).rejects.toThrow(
        'An unexpected error occurred while getting summary status: Failed to fetch',
      )
    })
  })
})
