// frontend/src/app/history/quiz/[quiz_id]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getQuizReview, QuizReviewDetail, QuestionReviewItem } from '@/services/history'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { FeedbackButton } from '@/components/feedback'
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, FileText, Clock } from 'lucide-react'

export default function QuizReviewPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [quiz, setQuiz] = useState<QuizReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication status using cookies (same pattern as history page)
  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';')
      const accessTokenCookie = cookies.find((cookie) => 
        cookie.trim().startsWith('access_token=')
      )
      
      if (accessTokenCookie) {
        const token = accessTokenCookie.split('=')[1]
        setAccessToken(token)
        setIsAuthenticated(true)
      } else {
        setAccessToken(null)
        setIsAuthenticated(false)
      }
      setSessionLoaded(true)
    }

    checkAuth()
  }, [])

  // Fetch quiz review
  const fetchQuizReview = useCallback(async () => {
    if (!accessToken || !quizId) return

    setLoading(true)
    setError(null)

    try {
      const response = await getQuizReview(accessToken, quizId)
      setQuiz(response.data)
    } catch (err: any) {
      console.error('Error fetching quiz review:', err)
      setError(err.message || 'Failed to load quiz review')
    } finally {
      setLoading(false)
    }
  }, [accessToken, quizId])

  useEffect(() => {
    if (sessionLoaded && isAuthenticated && accessToken) {
      fetchQuizReview()
    } else if (sessionLoaded && !isAuthenticated) {
      setLoading(false)
    }
  }, [sessionLoaded, isAuthenticated, accessToken, fetchQuizReview])

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get score color
  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Get score badge background
  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30'
    if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  // Render authentication required message
  if (sessionLoaded && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Review</CardTitle>
            <CardDescription>Sign in to view your quiz results</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your quiz review.
            </p>
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Review</CardTitle>
            <CardDescription>Loading your quiz results...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Review</CardTitle>
            <CardDescription>Something went wrong</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchQuizReview} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.push('/history')} variant="default">
                Back to History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render quiz not found
  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/history')}>Back to History</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          href="/history"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to History
        </Link>
      </div>

      {/* Quiz Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {quiz.document_title}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(quiz.created_at)}
                  </span>
                </div>
              </CardDescription>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(quiz.score_percentage)}`}>
              <div className={`text-3xl font-bold ${getScoreColor(quiz.score_percentage)}`}>
                {quiz.score_percentage}%
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {quiz.score}/{quiz.total_questions}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Generated with {quiz.ai_model}
            </div>
            <FeedbackButton
              contentId={quiz.id}
              contentType="quiz"
              accessToken={accessToken || undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Questions & Answers</h2>
        
        {quiz.questions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Question details are not available for this quiz.
              </p>
              <p className="text-sm text-muted-foreground">
                This may be an older quiz created before detailed question tracking was implemented.
              </p>
            </CardContent>
          </Card>
        ) : (
          quiz.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
            />
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/history')}>
          Back to History
        </Button>
        <Button onClick={() => router.push(`/quizzes/${quiz.id}`)}>
          Retake Quiz
        </Button>
      </div>
    </div>
  )
}

// Question Card Component
interface QuestionCardProps {
  question: QuestionReviewItem
  questionNumber: number
}

function QuestionCard({ question, questionNumber }: QuestionCardProps) {
  const hasAnswer = question.user_answer !== null
  const isCorrect = question.is_correct === true
  const isIncorrect = question.is_correct === false

  const getStatusIcon = () => {
    if (!hasAnswer) return <HelpCircle className="h-5 w-5 text-gray-400" />
    if (isCorrect) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBorder = () => {
    if (!hasAnswer) return 'border-gray-200 dark:border-gray-700'
    if (isCorrect) return 'border-green-200 dark:border-green-700'
    return 'border-red-200 dark:border-red-700'
  }

  return (
    <Card className={`border-2 ${getStatusBorder()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Question {questionNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {question.question_type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-lg font-medium">{question.question_text}</p>
          </div>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Options for multiple choice */}
        {question.options && question.options.length > 0 && (
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isUserChoice = question.user_answer === option
              const isCorrectOption = question.correct_answer === option
              
              let optionClass = 'p-3 rounded-lg border transition-colors '
              if (isCorrectOption) {
                optionClass += 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 '
              } else if (isUserChoice && !isCorrectOption) {
                optionClass += 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 '
              } else {
                optionClass += 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 '
              }

              return (
                <div key={idx} className={optionClass}>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">{option}</span>
                    <div className="flex items-center gap-2">
                      {isUserChoice && (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          Your answer
                        </span>
                      )}
                      {isCorrectOption && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Short answer display */}
        {!question.options && (
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
                <div className={`p-3 rounded-lg border ${
                  isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700' : 
                  isIncorrect ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700' : 
                  'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}>
                  <span className="text-foreground">{question.user_answer || <span className="text-muted-foreground italic">Not answered</span>}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700">
                  <span className="text-foreground">{question.correct_answer}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explanation */}
        {question.explanation && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Explanation:</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
