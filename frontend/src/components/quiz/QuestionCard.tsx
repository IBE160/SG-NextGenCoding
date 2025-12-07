// frontend/src/components/quiz/QuestionCard.tsx
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Question, QuestionType } from '@/lib/quizStore'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string | null
  onAnswerSelect: (answer: string) => void
  showResult?: boolean
  correctAnswer?: string
  isCorrect?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  correctAnswer,
  isCorrect,
}: QuestionCardProps) {
  const renderMultipleChoice = () => {
    if (!question.options) return null

    return (
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLetter = option.charAt(0) // Get "A", "B", etc.
          const isSelected = selectedAnswer === optionLetter
          const isCorrectOption = showResult && correctAnswer === optionLetter
          const isWrongSelected = showResult && isSelected && !isCorrect

          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(optionLetter)}
              disabled={showResult}
              className={cn(
                'w-full p-4 text-left rounded-lg border-2 transition-all',
                'hover:border-primary hover:bg-primary/5',
                isSelected && !showResult && 'border-primary bg-primary/10',
                isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950',
                isWrongSelected && 'border-red-500 bg-red-50 dark:bg-red-950',
                showResult && !isCorrectOption && !isWrongSelected && 'opacity-50'
              )}
            >
              <span className="font-medium">{option}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const renderTrueFalse = () => {
    const options = ['True', 'False']

    return (
      <div className="flex gap-4 justify-center">
        {options.map((option) => {
          const isSelected = selectedAnswer === option
          const isCorrectOption = showResult && correctAnswer === option
          const isWrongSelected = showResult && isSelected && !isCorrect

          return (
            <Button
              key={option}
              variant={isSelected && !showResult ? 'default' : 'outline'}
              size="lg"
              onClick={() => !showResult && onAnswerSelect(option)}
              disabled={showResult}
              className={cn(
                'flex-1 max-w-[200px] h-16 text-lg',
                isCorrectOption && 'border-green-500 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
                isWrongSelected && 'border-red-500 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              )}
            >
              {option}
            </Button>
          )
        })}
      </div>
    )
  }

  const renderShortAnswer = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={selectedAnswer || ''}
          onChange={(e) => !showResult && onAnswerSelect(e.target.value)}
          disabled={showResult}
          placeholder="Type your answer here..."
          className={cn(
            'w-full p-4 text-lg border-2 rounded-lg',
            'focus:outline-none focus:border-primary',
            showResult && isCorrect && 'border-green-500 bg-green-50',
            showResult && !isCorrect && 'border-red-500 bg-red-50'
          )}
        />
        {showResult && correctAnswer && (
          <p className="text-sm text-muted-foreground">
            Correct answer: <span className="font-medium text-green-600">{correctAnswer}</span>
          </p>
        )}
      </div>
    )
  }

  const renderQuestion = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return renderMultipleChoice()
      case 'true_false':
        return renderTrueFalse()
      case 'short_answer':
        return renderShortAnswer()
      default:
        return <p>Unknown question type</p>
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary">
            {question.question_type.replace('_', ' ')}
          </span>
        </div>
        <CardTitle className="text-xl">{question.question_text}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderQuestion()}
        {showResult && (
          <div className={cn(
            'mt-4 p-3 rounded-lg',
            isCorrect ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
          )}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
