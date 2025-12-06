// frontend/src/services/documents.ts

import axios from 'axios';

interface UploadResponse {
  document_id: string;
  message: string;
}

export const uploadDocument = async (file: File, userId?: string, accessToken?: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('user_id', userId);
  }

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    const response = await axios.post<UploadResponse>(
      '/api/v1/documents/upload',
      formData,
      {
        headers: headers,
        // Let axios set the correct Content-Type with boundary
      }
    );
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      console.error('Upload error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Upload failed: ${errorMessage}`);
    } else {
      // Handle other potential errors
      console.error('Unexpected upload error:', error);
      throw new Error(`An unexpected error occurred during upload: ${error.message}`);
    }
  }
};

export const getSummary = async (documentId: string, accessToken?: string) => {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.get(`/api/v1/documents/${documentId}/summary`, { headers });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Get summary error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Failed to get summary: ${errorMessage}`);
    } else {
      console.error('Unexpected get summary error:', error);
      throw new Error(`An unexpected error occurred while getting summary: ${error.message}`);
    }
  }
};

export const getSummaryStatus = async (documentId: string, accessToken?: string) => {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.get(`/api/v1/documents/${documentId}/status`, { headers });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Get summary status error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Failed to get summary status: ${errorMessage}`);
    } else {
      console.error('Unexpected get summary status error:', error);
      throw new Error(`An unexpected error occurred while getting summary status: ${error.message}`);
    }
  }
};
