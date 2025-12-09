// frontend/src/app/dashboard/page.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUploadZone from '@/app/upload/components/FileUploadZone'
import { uploadDocument, generateSummary, getSummaryStatus } from '@/services/documents'
import { generateQuiz } from '@/services/quizzes'
import { getSummaryHistory, getQuizHistory, type SummaryHistoryItem, type QuizHistoryItem } from '@/services/history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActionSelectionDialog } from '@/components/upload/ActionSelectionDialog'
import { Spinner } from '@/components/ui/spinner'
import { FileText, HelpCircle, Clock, ChevronRight, History } from 'lucide-react'

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

  // History state
  const [recentSummaries, setRecentSummaries] = useState<SummaryHistoryItem[]>([])
  const [recentQuizzes, setRecentQuizzes] = useState<QuizHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

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

  // Fetch history for authenticated users
  const fetchHistory = useCallback(async () => {
    if (!accessToken) return
    
    setHistoryLoading(true)
    try {
      const [summariesResponse, quizzesResponse] = await Promise.all([
        getSummaryHistory(accessToken, 5, 0),
        getQuizHistory(accessToken, 5, 0)
      ])
      setRecentSummaries(summariesResponse.data)
      setRecentQuizzes(quizzesResponse.data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (sessionLoaded && !isGuest && accessToken) {
      fetchHistory()
    }
  }, [sessionLoaded, isGuest, accessToken, fetchHistory])

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
    <div className="container mx-auto px-6 py-8">
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
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {isGuest 
            ? `Welcome, Guest! You have ${MAX_GUEST_UPLOADS - guestUploadsCount} free uploads remaining.`
            : 'Welcome back! You have unlimited access to all features.'
          }
        </p>
      </div>

      {/* Login prompt for guests who reached limit */}
      {showLoginPrompt && isGuest && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="font-semibold text-amber-800 dark:text-amber-200">Free Upload Limit Reached</p>
          <p className="mt-1 text-amber-700 dark:text-amber-300">
            You have used {MAX_GUEST_UPLOADS} free uploads. Please sign in or create an account to continue.
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => router.push('/login')}>Sign In</Button>
            <Button variant="outline" onClick={() => router.push('/register')}>Create Account</Button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Upload Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload Notes
            </CardTitle>
            <CardDescription>
              Upload your lecture notes to generate AI-powered summaries or quizzes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploading && (
              <div className="mb-4 text-center">
                <Spinner className="mx-auto mb-2" />
                <p className="text-primary animate-pulse">Uploading file...</p>
              </div>
            )}
            {uploadError && (
              <p className="mb-4 text-center text-destructive">{uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="mb-4 text-center text-green-600 dark:text-green-400">{uploadSuccess}</p>
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
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Three simple steps to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-all duration-200 hover:bg-accent/50 hover:border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Upload Your Notes</p>
                <p className="text-sm text-muted-foreground">Drop a PDF, TXT, or DOCX file</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-all duration-200 hover:bg-accent/50 hover:border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Choose Your Action</p>
                <p className="text-sm text-muted-foreground">Generate a summary or quiz</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-lg border border-border/50 p-4 transition-all duration-200 hover:bg-accent/50 hover:border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Learn & Study</p>
                <p className="text-sm text-muted-foreground">Review your AI-generated content</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Summaries Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Summaries
              </CardTitle>
              <CardDescription>Your recently generated summaries</CardDescription>
            </div>
            {!isGuest && recentSummaries.length > 0 && (
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {isGuest ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <p className="text-muted-foreground">Log in to see your summary history</p>
              </div>
            ) : historyLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : recentSummaries.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <p className="text-muted-foreground">No summaries yet. Upload a document to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSummaries.slice(0, 3).map((summary) => (
                  <Link key={summary.id} href={`/summaries/${summary.document_id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 hover:shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 transition-transform duration-200 group-hover:scale-110">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{summary.document_title}</p>
                        <p className="text-xs text-muted-foreground truncate">{summary.summary_preview}</p>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(summary.generated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz History Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Quiz History
              </CardTitle>
              <CardDescription>Your past quizzes</CardDescription>
            </div>
            {!isGuest && recentQuizzes.length > 0 && (
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {isGuest ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">Log in to see your quiz history</p>
              </div>
            ) : historyLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner className="h-6 w-6" />
              </div>
            ) : recentQuizzes.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">No quizzes yet. Upload a document to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentQuizzes.slice(0, 3).map((quiz) => (
                  <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/50 hover:shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                      <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/50">
                        <HelpCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.total_questions} questions</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
