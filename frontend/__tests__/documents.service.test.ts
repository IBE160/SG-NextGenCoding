import axios from 'axios'
import {
  getSummary,
  getSummaryStatus,
  uploadDocument,
} from '../src/services/documents'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('documents service', () => {
  const mockDocumentId = 'test-doc-id-123'
  const mockAccessToken = 'test-access-token'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('uploadDocument', () => {
    it('should upload a file successfully with user ID and access token', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      })
      const mockUserId = 'user-id-456'
      const mockResponse = {
        document_id: mockDocumentId,
        message: 'Upload initiated',
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await uploadDocument(mockFile, mockUserId, mockAccessToken)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/documents/upload',
        expect.any(FormData),
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        },
      )
      expect(result).toEqual(mockResponse)
    })

    it('should upload a file successfully without user ID or access token', async () => {
      const mockFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      })
      const mockResponse = {
        document_id: mockDocumentId,
        message: 'Upload initiated',
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const result = await uploadDocument(mockFile)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/v1/documents/upload',
        expect.any(FormData),
        {
          headers: {},
        },
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw an error if upload fails', async () => {
      const mockFile = new File(['test content'], 'test.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const errorMessage = 'Upload failed due to server error'
      mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { detail: errorMessage } },
        message: 'Request failed with status code 500',
      })

      await expect(uploadDocument(mockFile)).rejects.toThrow(
        `Upload failed: ${errorMessage}`,
      )
    })
  })

  describe('getSummary', () => {
    it('should fetch summary successfully', async () => {
      const mockSummary = {
        document_id: mockDocumentId,
        summary_text: 'Summary content',
      }
      mockedAxios.get.mockResolvedValueOnce({ data: mockSummary })

      const result = await getSummary(mockDocumentId, mockAccessToken)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/v1/documents/${mockDocumentId}/summary`,
        { headers: { Authorization: `Bearer ${mockAccessToken}` } },
      )
      expect(result).toEqual(mockSummary)
    })

    it('should throw an error if fetching summary fails', async () => {
      const errorMessage = 'Summary not found'
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { detail: errorMessage } },
        message: 'Request failed with status code 404',
      })

      await expect(getSummary(mockDocumentId)).rejects.toThrow(
        `Failed to get summary: ${errorMessage}`,
      )
    })
  })

  describe('getSummaryStatus', () => {
    it('should fetch summary status successfully', async () => {
      const mockStatus = { document_id: mockDocumentId, status: 'summarized' }
      mockedAxios.get.mockResolvedValueOnce({ data: mockStatus })

      const result = await getSummaryStatus(mockDocumentId, mockAccessToken)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/v1/documents/${mockDocumentId}/status`,
        { headers: { Authorization: `Bearer ${mockAccessToken}` } },
      )
      expect(result).toEqual(mockStatus)
    })

    it('should throw an error if fetching summary status fails', async () => {
      const errorMessage = 'Document not found'
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { detail: errorMessage } },
        message: 'Request failed with status code 404',
      })

      await expect(getSummaryStatus(mockDocumentId)).rejects.toThrow(
        `Failed to get summary status: ${errorMessage}`,
      )
    })
  })
})
