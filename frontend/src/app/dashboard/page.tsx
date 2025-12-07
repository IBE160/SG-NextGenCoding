// frontend/src/app/dashboard/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUploadZone from '@/app/upload/components/FileUploadZone'
import { uploadDocument } from '@/services/documents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const MAX_GUEST_UPLOADS = 2
const GUEST_UPLOAD_KEY = 'guest_uploads_count'

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const [userSession, setUserSession] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(true)
  const [guestUploadsCount, setGuestUploadsCount] = useState(0)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  useEffect(() => {
    const checkUserStatus = () => {
      const hasAccessToken = document.cookie
        .split(';')
        .some((cookie) => cookie.trim().startsWith('access_token='))

      if (hasAccessToken) {
        setUserSession({ authenticated: true })
        setIsGuest(false)
        setShowLoginPrompt(false)
        setGuestUploadsCount(0)
        localStorage.removeItem(GUEST_UPLOAD_KEY)
      } else {
        setUserSession(null)
        setIsGuest(true)
        const count = parseInt(localStorage.getItem(GUEST_UPLOAD_KEY) || '0', 10)
        setGuestUploadsCount(count)
        if (count >= MAX_GUEST_UPLOADS) {
          setShowLoginPrompt(true)
        }
      }
      setSessionLoaded(true)
    }

    checkUserStatus()
  }, [])

  const handleFileSelect = async (file: File) => {
    if (isGuest && guestUploadsCount >= MAX_GUEST_UPLOADS) {
      alert('Please log in or register to continue uploading.')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const userId = userSession?.user?.id
      const accessToken = userSession?.access_token
      const response = await uploadDocument(file, userId, accessToken)
      setUploadSuccess(`File uploaded successfully!`)
      
      // Use window.location for full page reload to ensure backend has processed
      window.location.href = `/summaries/${response.document_id}`

      if (isGuest) {
        const newCount = guestUploadsCount + 1
        localStorage.setItem(GUEST_UPLOAD_KEY, newCount.toString())
        setGuestUploadsCount(newCount)
        if (newCount >= MAX_GUEST_UPLOADS) {
          setShowLoginPrompt(true)
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const acceptedFileTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  const maxFileSizeMB = 20

  if (!sessionLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {isGuest 
            ? `Welcome, Guest! You have ${MAX_GUEST_UPLOADS - guestUploadsCount} free uploads remaining.`
            : 'Welcome back! You have unlimited access to all features.'
          }
        </p>
      </div>

      {/* Login prompt for guests who reached limit */}
      {showLoginPrompt && isGuest && (
        <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
          <p className="font-bold">Free Upload Limit Reached!</p>
          <p>
            You have used {MAX_GUEST_UPLOADS} free uploads. Please log in or register to continue.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => router.push('/login')}>Log In</Button>
            <Button variant="outline" onClick={() => router.push('/register')}>Register</Button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upload Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>📄 Upload Notes</CardTitle>
            <CardDescription>
              Upload your lecture notes to generate AI-powered summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploading && (
              <p className="mb-4 text-center text-blue-500">Uploading file...</p>
            )}
            {uploadError && (
              <p className="mb-4 text-center text-red-500">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="mb-4 text-center text-green-500">{uploadSuccess}</p>
            )}
            {!showLoginPrompt && (
              <FileUploadZone
                onFileSelect={handleFileSelect}
                acceptedFileTypes={acceptedFileTypes}
                maxFileSizeMB={maxFileSizeMB}
              />
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Supported formats: PDF, TXT, DOCX (max {maxFileSizeMB}MB)
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" disabled>
              📝 Generate Quiz (Coming Soon)
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              🎯 Create Flashcards (Coming Soon)
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              📊 Study Analytics (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Recent Summaries Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>📚 Recent Summaries</CardTitle>
            <CardDescription>Your recently generated summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-muted-foreground">
                {isGuest 
                  ? 'Log in to see your summary history'
                  : 'No summaries yet. Upload a document to get started!'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quiz History Card */}
        <Card>
          <CardHeader>
            <CardTitle>🧠 Quiz History</CardTitle>
            <CardDescription>Your past quizzes and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-sm text-muted-foreground">Coming Soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
