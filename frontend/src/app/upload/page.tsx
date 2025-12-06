// frontend/src/app/upload/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploadZone from './components/FileUploadZone';
import { uploadDocument } from '@/services/documents'; // Import the uploadDocument service

const MAX_GUEST_UPLOADS = 2;
const GUEST_UPLOAD_KEY = 'guest_uploads_count';

const UploadPage: React.FC = () => {
  const router = useRouter();
  const [userSession, setUserSession] = useState<any>(null); // User info from backend /auth/me
  const [isGuest, setIsGuest] = useState(true);
  const [guestUploadsCount, setGuestUploadsCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setError] = useState<string | null>(null); // Renamed setUploadError to setError
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);


  useEffect(() => {
    const checkUserStatus = () => {
      // Check if access_token cookie exists (simple client-side check)
      const hasAccessToken = document.cookie.split(';').some(cookie => cookie.trim().startsWith('access_token='));
      
      if (hasAccessToken) {
        console.log('Auth check: authenticated (access_token cookie found)');
        setUserSession({ authenticated: true }); // Minimal session object
        setIsGuest(false);
        setShowLoginPrompt(false);
        setGuestUploadsCount(0);
        localStorage.removeItem(GUEST_UPLOAD_KEY);
      } else {
        // Treat as guest
        console.log('Auth check: guest (no access_token cookie)');
        setUserSession(null);
        setIsGuest(true);
        const count = parseInt(localStorage.getItem(GUEST_UPLOAD_KEY) || '0', 10);
        setGuestUploadsCount(count);
        if (count >= MAX_GUEST_UPLOADS) {
          setShowLoginPrompt(true);
        }
      }
      setSessionLoaded(true);
    };

    checkUserStatus();
  }, []);

  const handleFileSelect = async (file: File) => {
    if (isGuest && guestUploadsCount >= MAX_GUEST_UPLOADS) {
      alert('Please log in or register to continue uploading.');
      return;
    }

    console.log('File selected:', file.name);
    console.log('Is guest:', isGuest);
    console.log('User session:', userSession);

    setUploading(true);
    setError(null); // Use setError
    setUploadSuccess(null);

    try {
      const userId = userSession?.user?.id;
      const accessToken = userSession?.access_token;
      console.log('Uploading with userId:', userId, 'accessToken:', accessToken ? 'present' : 'absent');
      // Assuming uploadDocument will get access_token from cookie/local storage
      const response = await uploadDocument(file, userId, accessToken);
      setUploadSuccess(`File uploaded successfully! Document ID: ${response.document_id}`);
      router.push(`/summaries/${response.document_id}`);

      if (isGuest) {
        const newCount = guestUploadsCount + 1;
        localStorage.setItem(GUEST_UPLOAD_KEY, newCount.toString());
        setGuestUploadsCount(newCount);
        if (newCount >= MAX_GUEST_UPLOADS) {
          setShowLoginPrompt(true);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message); // Use setError
    } finally {
      setUploading(false);
    }
  };

  const acceptedFileTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSizeMB = 20;

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const resetGuestUploads = () => {
    localStorage.removeItem(GUEST_UPLOAD_KEY);
    setGuestUploadsCount(0);
    setShowLoginPrompt(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Your Lecture Notes</h1>

      {!sessionLoaded ? (
        <p className="text-center text-gray-500 mb-4">Loading...</p>
      ) : showLoginPrompt && isGuest ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Free Upload Limit Reached!</p>
          <p>You have used {MAX_GUEST_UPLOADS} free uploads. Please <a href="/login" className="font-semibold underline">log in</a> or <a href="/register" className="font-semibold underline">register</a> to continue uploading files.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <>
          {isGuest && (
            <p className="text-center text-gray-600 mb-4">
              As a guest, you have {MAX_GUEST_UPLOADS - guestUploadsCount} free uploads remaining.
            </p>
          )}
          {!isGuest && (
            <p className="text-center text-green-600 mb-4">
              Logged in - you have unlimited uploads!
            </p>
          )}
          {uploading && <p className="text-center text-blue-500 mb-4">Uploading file...</p>}
          {uploadError && <p className="text-center text-red-500 mb-4">{uploadError}</p>}
          {uploadSuccess && <p className="text-center text-green-500 mb-4">{uploadSuccess}</p>}
          <FileUploadZone
            onFileSelect={handleFileSelect}
            acceptedFileTypes={acceptedFileTypes}
            maxFileSizeMB={maxFileSizeMB}
          />
          <div className="text-center mt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md text-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            {isGuest && (
              <button
                onClick={resetGuestUploads}
                className="ml-4 px-6 py-3 bg-red-500 text-white rounded-md text-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Reset Guest Uploads
              </button>
            )}
          </div>
        </>
      )}

      {/* TODO: Add display for uploaded file status and summary */}
    </div>
  );
};

export default UploadPage;