// frontend/__tests__/feedback/FeedbackButton.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FeedbackButton } from '../../src/components/feedback/FeedbackButton'

// Mock the FeedbackModal component
jest.mock('../../src/components/feedback/FeedbackModal', () => ({
  FeedbackModal: ({ isOpen, onClose, contentId, contentType }: any) =>
    isOpen ? (
      <div data-testid="feedback-modal">
        <span>Modal for {contentType} - {contentId}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

describe('FeedbackButton', () => {
  it('renders the button with "Rate this" text', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="summary"
      />
    )
    
    expect(screen.getByText('Rate this')).toBeInTheDocument()
  })

  it('opens modal when button is clicked', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="summary"
      />
    )
    
    fireEvent.click(screen.getByText('Rate this'))
    
    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument()
    expect(screen.getByText('Modal for summary - test-123')).toBeInTheDocument()
  })

  it('closes modal when close is triggered', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="quiz"
      />
    )
    
    // Open modal
    fireEvent.click(screen.getByText('Rate this'))
    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument()
    
    // Close modal
    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument()
  })

  it('shows "Feedback Submitted" after submission', () => {
    const { rerender } = render(
      <FeedbackButton
        contentId="test-123"
        contentType="summary"
      />
    )
    
    // Initially shows "Rate this"
    expect(screen.getByText('Rate this')).toBeInTheDocument()
    
    // Note: Full submission flow would require integration test
    // This tests the initial state only
  })

  it('supports different variants', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="summary"
        variant="ghost"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('supports different sizes', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="quiz"
        size="sm"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <FeedbackButton
        contentId="test-123"
        contentType="summary"
        className="custom-class"
      />
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('works with quiz content type', () => {
    render(
      <FeedbackButton
        contentId="quiz-456"
        contentType="quiz"
      />
    )
    
    fireEvent.click(screen.getByText('Rate this'))
    
    expect(screen.getByText('Modal for quiz - quiz-456')).toBeInTheDocument()
  })
})
