// frontend/src/components/quiz/ResultsView.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuestionCard } from './QuestionCard'
import { useQuizStore, QuizResults, Question } from '@/lib/quizStore'
import { Trophy, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultsViewProps {
  onRetakeQuiz?: () => void
  onBackToDashboard?: () => void
}

export function ResultsView({ onRetakeQuiz, onBackToDashboard }: ResultsViewProps) {
  const { currentQuiz, results, userAnswers } = useQuizStore()
  const [showDetails, setShowDetails] = React.useState(false)

  if (!results) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>No results available</p>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreEmoji = (percentage: number) => {
    if (percentage === 100) return '🏆'
    if (percentage >= 80) return '🎉'
    if (percentage >= 60) return '👍'
    if (percentage >= 40) return '📚'
    return '💪'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage === 100) return 'Perfect score! Amazing!'
    if (percentage >= 80) return 'Great job! You really know this material!'
    if (percentage >= 60) return 'Good effort! Keep studying to improve.'
    if (percentage >= 40) return 'Not bad, but there\'s room for improvement.'
    return 'Keep studying! You\'ll get there!'
  }

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="text-6xl mb-4">{getScoreEmoji(results.percentage)}</div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className={cn('w-8 h-8', getScoreColor(results.percentage))} />
            <span className={cn('text-5xl font-bold', getScoreColor(results.percentage))}>
              {results.percentage}%
            </span>
          </div>
          
          <p className="text-lg text-muted-foreground">
            You got {results.score} out of {results.total} questions correct
          </p>
          
          <p className="text-muted-foreground">
            {getScoreMessage(results.percentage)}
          </p>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center pt-4">
            {onRetakeQuiz && (
              <Button variant="outline" onClick={onRetakeQuiz}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            )}
            {onBackToDashboard && (
              <Button onClick={onBackToDashboard}>
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review toggle */}
      <div className="w-full max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full justify-between"
        >
          <span>Review Answers</span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Detailed results */}
      {showDetails && currentQuiz?.questions && (
        <div className="space-y-4">
          {currentQuiz.questions.map((question, index) => {
            const result = results.results.find(
              (r) => r.question_id === question.id
            )
            
            return (
              <QuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={currentQuiz.questions!.length}
                selectedAnswer={userAnswers[question.id] || null}
                onAnswerSelect={() => {}} // Read-only
                showResult
                correctAnswer={result?.correct_answer}
                isCorrect={result?.is_correct}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
