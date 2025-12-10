// frontend/src/components/quiz/QuizView.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { QuestionCard } from './QuestionCard'
import { useQuizStore } from '@/lib/quizStore'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'

interface QuizViewProps {
  onSubmit: () => void
}

export function QuizView({ onSubmit }: QuizViewProps) {
  const {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    isSubmitting,
    setUserAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    getCurrentQuestion,
    isFirstQuestion,
    isLastQuestion,
    getAnsweredCount,
    canSubmit,
  } = useQuizStore()

  const currentQuestion = getCurrentQuestion()

  if (!currentQuiz || !currentQuiz.questions) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8">
        <CardContent className="flex items-center justify-center">
          <Spinner />
          <span className="ml-2">Loading quiz...</span>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto p-8">
        <CardContent className="text-center">
          <p>No questions available</p>
        </CardContent>
      </Card>
    )
  }

  const handleAnswerSelect = (answer: string) => {
    setUserAnswer(currentQuestion.id, answer)
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {getAnsweredCount()} of {currentQuiz.questions.length} answered
          </span>
        </div>
        <div className="flex gap-1">
          {currentQuiz.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary'
                  : userAnswers[q.id]
                    ? 'bg-green-500'
                    : 'bg-secondary'
              }`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={currentQuiz.questions.length}
        selectedAnswer={userAnswers[currentQuestion.id] || null}
        onAnswerSelect={handleAnswerSelect}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={isFirstQuestion()}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-2">
          {isLastQuestion() ? (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Submit hint */}
      {!canSubmit() && (
        <p className="text-center text-sm text-muted-foreground">
          Answer all questions to submit the quiz
        </p>
      )}
    </div>
  )
}
