// frontend/src/app/quizzes/[quiz_id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuizView, ResultsView } from '@/components/quiz'
import { useQuizStore } from '@/lib/quizStore'
import { getQuiz, submitQuiz } from '@/services/quizzes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import type { Session } from '@supabase/supabase-js'

type ViewState = 'loading' | 'quiz' | 'results' | 'error'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.quiz_id as string
  
  const [viewState, setViewState] = useState<ViewState>('loading')
  const [session, setSession] = useState<Session | null>(null)

  // Get session for feedback
  useEffect(() => {
    const getSession = async () => {
      try {
        const { createBrowserClient } = await import('@/utils/supabase')
        const supabase = createBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (error) {
        console.error('Error getting session:', error)
      }
    }
    getSession()
  }, [])

  const accessToken = session?.access_token || undefined
  
  const {
    currentQuiz,
    userAnswers,
    results,
    error,
    setCurrentQuiz,
    setResults,
    setIsSubmitting,
    setIsLoading,
    setError,
    resetQuiz,
    clearUserAnswers,
  } = useQuizStore()

  // Load quiz on mount
  useEffect(() => {
    const loadQuiz = async () => {
      // If quiz is already in store with questions, use it
      if (currentQuiz?.id === quizId && currentQuiz.questions) {
        setViewState(results ? 'results' : 'quiz')
        return
      }

      setIsLoading(true)
      try {
        const quiz = await getQuiz(quizId)
        setCurrentQuiz(quiz)
        setViewState('quiz')
      } catch (err) {
        console.error('Failed to load quiz:', err)
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
        setViewState('error')
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [quizId])

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!currentQuiz) return

    setIsSubmitting(true)
    try {
      const quizResults = await submitQuiz(currentQuiz.id, userAnswers)
      setResults(quizResults)
      setViewState('results')
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle retake quiz
  const handleRetakeQuiz = () => {
    clearUserAnswers()
    setResults(null)
    setViewState('quiz')
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    resetQuiz()
    router.push('/dashboard')
  }

  // Render based on state
  if (viewState === 'loading') {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center p-12">
            <Spinner />
            <span className="ml-3 text-lg">Loading quiz...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewState === 'error') {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Error Loading Quiz</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleBackToDashboard}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToDashboard}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        {currentQuiz && (
          <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
        )}
      </div>

      {/* Quiz or Results view */}
      {viewState === 'quiz' && <QuizView onSubmit={handleSubmit} />}
      {viewState === 'results' && (
        <ResultsView
          onRetakeQuiz={handleRetakeQuiz}
          onBackToDashboard={handleBackToDashboard}
          accessToken={accessToken}
        />
      )}
    </div>
  )
}
