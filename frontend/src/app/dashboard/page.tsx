// frontend/src/app/dashboard/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FileUploadZone from '@/app/upload/components/FileUploadZone'
import { uploadDocument, generateSummary, getSummaryStatus } from '@/services/documents'
import { generateQuiz } from '@/services/quizzes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActionSelectionDialog } from '@/components/upload/ActionSelectionDialog'

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
  
  // New state for action selection
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [processingAction, setProcessingAction] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const checkUserStatus = () => {
      const cookies = document.cookie.split(';')
      const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='))
      
      if (accessTokenCookie) {
        const token = accessTokenCookie.split('=')[1]
        setAccessToken(token)
        setUserSession({ authenticated: true })
        setIsGuest(false)
        setShowLoginPrompt(false)
        setGuestUploadsCount(0)
        localStorage.removeItem(GUEST_UPLOAD_KEY)
      } else {
        setAccessToken(null)
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
      // Upload without auto-generating summary - user will choose
      const response = await uploadDocument(file, userId, accessToken || undefined, {
        autoGenerateSummary: false
      })
      setUploadSuccess(`File uploaded successfully!`)
      setUploadedDocumentId(response.document_id)
      setUploadedFileName(file.name)
      
      // Wait a moment for text extraction to complete, then show dialog
      // We'll poll for status or just show dialog after a delay
      setTimeout(() => {
        setShowActionDialog(true)
      }, 1500) // Give time for text extraction to start

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

  const handleSelectSummary = async () => {
    if (!uploadedDocumentId) return
    
    setProcessingAction(true)
    try {
      // Wait for text extraction to complete, then generate summary
      let retries = 0
      const maxRetries = 30
      let status = null
      
      while (retries < maxRetries) {
        try {
          status = await getSummaryStatus(uploadedDocumentId, accessToken || undefined)
          if (status.status === 'text-extracted' || status.status === 'summary-ready') {
            break
          }
        } catch (e) {
          // Status endpoint might fail if document not ready
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        retries++
      }
      
      // Trigger summary generation
      await generateSummary(uploadedDocumentId, accessToken || undefined)
      
      // Navigate to summary page
      window.location.href = `/summaries/${uploadedDocumentId}`
    } catch (error: any) {
      console.error('Summary generation error:', error)
      // Check for quota-related errors
      const errorMsg = error.message || ''
      if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setUploadError('AI service quota exceeded. Please try again later (quota resets daily).')
      } else {
        setUploadError(error.message)
      }
      setShowActionDialog(false)
    } finally {
      setProcessingAction(false)
    }
  }

  const handleSelectQuiz = async () => {
    if (!uploadedDocumentId) return
    
    setProcessingAction(true)
    try {
      // Wait for text extraction to complete
      let retries = 0
      const maxRetries = 30
      let status = null
      
      while (retries < maxRetries) {
        try {
          status = await getSummaryStatus(uploadedDocumentId, accessToken || undefined)
          if (status.status === 'text-extracted' || status.status === 'summary-ready') {
            break
          }
        } catch (e) {
          // Status endpoint might fail if document not ready
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        retries++
      }
      
      // Generate quiz
      const quiz = await generateQuiz(uploadedDocumentId, 5, undefined, accessToken || undefined)
      
      // Navigate to quiz page
      window.location.href = `/quizzes/${quiz.id}`
    } catch (error: any) {
      console.error('Quiz generation error:', error)
      // Check for quota-related errors
      const errorMsg = error.message || ''
      if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setUploadError('AI service quota exceeded. Please try again later (quota resets daily).')
      } else {
        setUploadError(error.message)
      }
      setShowActionDialog(false)
    } finally {
      setProcessingAction(false)
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
      {/* Action Selection Dialog */}
      <ActionSelectionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        documentId={uploadedDocumentId}
        fileName={uploadedFileName}
        onSelectSummary={handleSelectSummary}
        onSelectQuiz={handleSelectQuiz}
        isLoading={processingAction}
      />
      
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
              Upload your lecture notes to generate summaries or quizzes
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
            <CardTitle>✨ How It Works</CardTitle>
            <CardDescription>Upload a file, then choose your action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-medium">Upload Your Notes</p>
                <p className="text-sm text-muted-foreground">Drop a PDF, TXT, or DOCX file</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-medium">Choose Your Action</p>
                <p className="text-sm text-muted-foreground">Generate a summary or quiz</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-medium">Learn & Study</p>
                <p className="text-sm text-muted-foreground">Review your AI-generated content</p>
              </div>
            </div>
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
              <p className="text-sm text-muted-foreground">
                {isGuest 
                  ? 'Log in to see your quiz history'
                  : 'No quizzes yet. Upload a document to get started!'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
