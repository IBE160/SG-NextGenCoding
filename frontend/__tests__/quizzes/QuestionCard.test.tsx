// frontend/__tests__/quizzes/QuestionCard.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QuestionCard } from '../../src/components/quiz/QuestionCard'
import type { Question } from '../../src/lib/quizStore'

const mockMultipleChoiceQuestion: Question = {
  id: 'q1',
  question_type: 'multiple_choice',
  question_text: 'What is 2 + 2?',
  options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
  order_index: 0,
}

const mockTrueFalseQuestion: Question = {
  id: 'q2',
  question_type: 'true_false',
  question_text: 'The sky is blue.',
  options: ['True', 'False'],
  order_index: 1,
}

const mockShortAnswerQuestion: Question = {
  id: 'q3',
  question_type: 'short_answer',
  question_text: 'What is the capital of France?',
  options: null,
  order_index: 2,
}

describe('QuestionCard', () => {
  const mockOnAnswerSelect = jest.fn()

  beforeEach(() => {
    mockOnAnswerSelect.mockClear()
  })

  describe('Multiple Choice Question', () => {
    it('renders question text and options', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
      expect(screen.getByText('A. 3')).toBeInTheDocument()
      expect(screen.getByText('B. 4')).toBeInTheDocument()
      expect(screen.getByText('C. 5')).toBeInTheDocument()
      expect(screen.getByText('D. 6')).toBeInTheDocument()
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument()
    })

    it('calls onAnswerSelect when option is clicked', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      fireEvent.click(screen.getByText('B. 4'))
      expect(mockOnAnswerSelect).toHaveBeenCalledWith('B')
    })

    it('shows selected answer with highlight', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer="B"
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      const selectedOption = screen.getByText('B. 4').closest('button')
      expect(selectedOption).toHaveClass('border-primary')
    })
  })

  describe('True/False Question', () => {
    it('renders True and False buttons', () => {
      render(
        <QuestionCard
          question={mockTrueFalseQuestion}
          questionNumber={2}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      expect(screen.getByText('The sky is blue.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'True' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'False' })).toBeInTheDocument()
    })

    it('calls onAnswerSelect when True is clicked', () => {
      render(
        <QuestionCard
          question={mockTrueFalseQuestion}
          questionNumber={2}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'True' }))
      expect(mockOnAnswerSelect).toHaveBeenCalledWith('True')
    })
  })

  describe('Short Answer Question', () => {
    it('renders input field', () => {
      render(
        <QuestionCard
          question={mockShortAnswerQuestion}
          questionNumber={3}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Type your answer here...')).toBeInTheDocument()
    })

    it('calls onAnswerSelect when typing', () => {
      render(
        <QuestionCard
          question={mockShortAnswerQuestion}
          questionNumber={3}
          totalQuestions={3}
          selectedAnswer={null}
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      const input = screen.getByPlaceholderText('Type your answer here...')
      fireEvent.change(input, { target: { value: 'Paris' } })
      expect(mockOnAnswerSelect).toHaveBeenCalledWith('Paris')
    })

    it('shows typed answer in input', () => {
      render(
        <QuestionCard
          question={mockShortAnswerQuestion}
          questionNumber={3}
          totalQuestions={3}
          selectedAnswer="Paris"
          onAnswerSelect={mockOnAnswerSelect}
        />
      )

      const input = screen.getByPlaceholderText('Type your answer here...')
      expect(input).toHaveValue('Paris')
    })
  })

  describe('Results mode', () => {
    it('shows correct indicator for correct answer', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer="B"
          onAnswerSelect={mockOnAnswerSelect}
          showResult
          correctAnswer="B"
          isCorrect={true}
        />
      )

      expect(screen.getByText('✓ Correct!')).toBeInTheDocument()
    })

    it('shows incorrect indicator for wrong answer', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer="A"
          onAnswerSelect={mockOnAnswerSelect}
          showResult
          correctAnswer="B"
          isCorrect={false}
        />
      )

      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument()
    })

    it('disables options in result mode', () => {
      render(
        <QuestionCard
          question={mockMultipleChoiceQuestion}
          questionNumber={1}
          totalQuestions={3}
          selectedAnswer="B"
          onAnswerSelect={mockOnAnswerSelect}
          showResult
          correctAnswer="B"
          isCorrect={true}
        />
      )

      const option = screen.getByText('A. 3').closest('button')
      expect(option).toBeDisabled()
    })
  })
})
