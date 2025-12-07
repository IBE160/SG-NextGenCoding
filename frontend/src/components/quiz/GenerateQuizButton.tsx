// frontend/src/components/quiz/GenerateQuizButton.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useQuizStore } from '@/lib/quizStore'
import { generateQuiz, getQuiz } from '@/services/quizzes'
import { useRouter } from 'next/navigation'
import { FileQuestion } from 'lucide-react'

interface GenerateQuizButtonProps {
  documentId: string
  accessToken?: string
  numQuestions?: number
  className?: string
}

export function GenerateQuizButton({
  documentId,
  accessToken,
  numQuestions = 5,
  className,
}: GenerateQuizButtonProps) {
  const router = useRouter()
  const { setCurrentQuiz, setIsGenerating, setError, isGenerating } = useQuizStore()

  const handleGenerateQuiz = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Generate quiz via API
      const quiz = await generateQuiz(documentId, numQuestions, undefined, accessToken)
      
      // Fetch the full quiz with questions
      const quizWithQuestions = await getQuiz(quiz.id, accessToken)
      
      // Set in store
      setCurrentQuiz(quizWithQuestions)
      
      // Navigate to quiz page
      router.push(`/quizzes/${quiz.id}`)
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerateQuiz}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Spinner />
          <span className="ml-2">Generating Quiz...</span>
        </>
      ) : (
        <>
          <FileQuestion className="w-4 h-4 mr-2" />
          Generate Quiz
        </>
      )}
    </Button>
  )
}
