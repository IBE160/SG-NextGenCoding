// frontend/__tests__/quizzes/quizStore.test.ts

import { useQuizStore } from '../../src/lib/quizStore'
import type { Quiz, Question, QuizResults } from '../../src/lib/quizStore'

// Mock quiz data
const mockQuestions: Question[] = [
  {
    id: 'q1',
    question_type: 'multiple_choice',
    question_text: 'What is 2 + 2?',
    options: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
    order_index: 0,
  },
  {
    id: 'q2',
    question_type: 'true_false',
    question_text: 'The sky is blue.',
    options: ['True', 'False'],
    order_index: 1,
  },
  {
    id: 'q3',
    question_type: 'short_answer',
    question_text: 'What is the capital of France?',
    options: null,
    order_index: 2,
  },
]

const mockQuiz: Quiz = {
  id: 'quiz-123',
  document_id: 'doc-456',
  title: 'Test Quiz',
  status: 'ready',
  total_questions: 3,
  created_at: '2025-12-07T12:00:00Z',
  questions: mockQuestions,
}

const mockResults: QuizResults = {
  quiz_id: 'quiz-123',
  score: 2,
  total: 3,
  percentage: 66.7,
  results: [
    { question_id: 'q1', is_correct: true, user_answer: 'B', correct_answer: 'B', explanation: null },
    { question_id: 'q2', is_correct: true, user_answer: 'True', correct_answer: 'True', explanation: null },
    { question_id: 'q3', is_correct: false, user_answer: 'London', correct_answer: 'Paris', explanation: null },
  ],
}

describe('Quiz Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useQuizStore.getState().resetQuiz()
  })

  describe('Initial state', () => {
    it('should have correct initial values', () => {
      const state = useQuizStore.getState()
      expect(state.currentQuiz).toBeNull()
      expect(state.currentQuestionIndex).toBe(0)
      expect(state.userAnswers).toEqual({})
      expect(state.results).toBeNull()
      expect(state.isGenerating).toBe(false)
      expect(state.isSubmitting).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setCurrentQuiz', () => {
    it('should set the current quiz and reset question index', () => {
      useQuizStore.getState().setCurrentQuestionIndex(2)
      useQuizStore.getState().setCurrentQuiz(mockQuiz)
      
      const state = useQuizStore.getState()
      expect(state.currentQuiz).toEqual(mockQuiz)
      expect(state.currentQuestionIndex).toBe(0)
    })
  })

  describe('User answers', () => {
    it('should set user answer for a question', () => {
      useQuizStore.getState().setUserAnswer('q1', 'B')
      
      const state = useQuizStore.getState()
      expect(state.userAnswers['q1']).toBe('B')
    })

    it('should update existing answer', () => {
      useQuizStore.getState().setUserAnswer('q1', 'A')
      useQuizStore.getState().setUserAnswer('q1', 'B')
      
      const state = useQuizStore.getState()
      expect(state.userAnswers['q1']).toBe('B')
    })

    it('should clear all answers', () => {
      useQuizStore.getState().setUserAnswer('q1', 'B')
      useQuizStore.getState().setUserAnswer('q2', 'True')
      useQuizStore.getState().clearUserAnswers()
      
      const state = useQuizStore.getState()
      expect(state.userAnswers).toEqual({})
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      useQuizStore.getState().setCurrentQuiz(mockQuiz)
    })

    it('should go to next question', () => {
      useQuizStore.getState().nextQuestion()
      expect(useQuizStore.getState().currentQuestionIndex).toBe(1)
    })

    it('should not go past last question', () => {
      useQuizStore.getState().setCurrentQuestionIndex(2)
      useQuizStore.getState().nextQuestion()
      expect(useQuizStore.getState().currentQuestionIndex).toBe(2)
    })

    it('should go to previous question', () => {
      useQuizStore.getState().setCurrentQuestionIndex(1)
      useQuizStore.getState().previousQuestion()
      expect(useQuizStore.getState().currentQuestionIndex).toBe(0)
    })

    it('should not go before first question', () => {
      useQuizStore.getState().previousQuestion()
      expect(useQuizStore.getState().currentQuestionIndex).toBe(0)
    })

    it('should go to specific question', () => {
      useQuizStore.getState().goToQuestion(2)
      expect(useQuizStore.getState().currentQuestionIndex).toBe(2)
    })
  })

  describe('Computed helpers', () => {
    beforeEach(() => {
      useQuizStore.getState().setCurrentQuiz(mockQuiz)
    })

    it('should get current question', () => {
      const question = useQuizStore.getState().getCurrentQuestion()
      expect(question).toEqual(mockQuestions[0])
    })

    it('should return correct isFirstQuestion', () => {
      expect(useQuizStore.getState().isFirstQuestion()).toBe(true)
      useQuizStore.getState().setCurrentQuestionIndex(1)
      expect(useQuizStore.getState().isFirstQuestion()).toBe(false)
    })

    it('should return correct isLastQuestion', () => {
      expect(useQuizStore.getState().isLastQuestion()).toBe(false)
      useQuizStore.getState().setCurrentQuestionIndex(2)
      expect(useQuizStore.getState().isLastQuestion()).toBe(true)
    })

    it('should count answered questions', () => {
      expect(useQuizStore.getState().getAnsweredCount()).toBe(0)
      useQuizStore.getState().setUserAnswer('q1', 'B')
      expect(useQuizStore.getState().getAnsweredCount()).toBe(1)
      useQuizStore.getState().setUserAnswer('q2', 'True')
      expect(useQuizStore.getState().getAnsweredCount()).toBe(2)
    })

    it('should check if can submit', () => {
      expect(useQuizStore.getState().canSubmit()).toBe(false)
      
      useQuizStore.getState().setUserAnswer('q1', 'B')
      expect(useQuizStore.getState().canSubmit()).toBe(false)
      
      useQuizStore.getState().setUserAnswer('q2', 'True')
      expect(useQuizStore.getState().canSubmit()).toBe(false)
      
      useQuizStore.getState().setUserAnswer('q3', 'Paris')
      expect(useQuizStore.getState().canSubmit()).toBe(true)
    })
  })

  describe('Results', () => {
    it('should set results', () => {
      useQuizStore.getState().setResults(mockResults)
      expect(useQuizStore.getState().results).toEqual(mockResults)
    })
  })

  describe('Loading states', () => {
    it('should set generating state and clear error', () => {
      useQuizStore.getState().setError('Previous error')
      useQuizStore.getState().setIsGenerating(true)
      
      const state = useQuizStore.getState()
      expect(state.isGenerating).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set error and clear loading states', () => {
      useQuizStore.getState().setIsGenerating(true)
      useQuizStore.getState().setError('Something went wrong')
      
      const state = useQuizStore.getState()
      expect(state.error).toBe('Something went wrong')
      expect(state.isGenerating).toBe(false)
    })
  })

  describe('resetQuiz', () => {
    it('should reset all state to initial values', () => {
      useQuizStore.getState().setCurrentQuiz(mockQuiz)
      useQuizStore.getState().setUserAnswer('q1', 'B')
      useQuizStore.getState().setResults(mockResults)
      useQuizStore.getState().setIsGenerating(true)
      
      useQuizStore.getState().resetQuiz()
      
      const state = useQuizStore.getState()
      expect(state.currentQuiz).toBeNull()
      expect(state.userAnswers).toEqual({})
      expect(state.results).toBeNull()
      expect(state.isGenerating).toBe(false)
    })
  })
})
