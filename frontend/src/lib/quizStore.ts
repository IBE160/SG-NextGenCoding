// frontend/src/lib/quizStore.ts
import { create } from 'zustand'

// Types matching backend schemas
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'
export type QuizStatus = 'generating' | 'ready' | 'failed'

export interface Question {
  id: string
  question_type: QuestionType
  question_text: string
  options: string[] | null
  order_index: number
}

export interface Quiz {
  id: string
  document_id: string
  title: string
  status: QuizStatus
  total_questions: number
  created_at: string
  questions?: Question[]
}

export interface AnswerResult {
  question_id: string
  is_correct: boolean
  user_answer: string
  correct_answer: string
  explanation: string | null
}

export interface QuizResults {
  quiz_id: string
  score: number
  total: number
  percentage: number
  results: AnswerResult[]
}

interface QuizState {
  // Current quiz being taken
  currentQuiz: Quiz | null
  currentQuestionIndex: number
  userAnswers: Record<string, string> // question_id -> answer
  
  // Quiz results after submission
  results: QuizResults | null
  
  // Loading states
  isGenerating: boolean
  isSubmitting: boolean
  isLoading: boolean
  
  // Error state
  error: string | null
  
  // Actions
  setCurrentQuiz: (quiz: Quiz | null) => void
  setCurrentQuestionIndex: (index: number) => void
  setUserAnswer: (questionId: string, answer: string) => void
  clearUserAnswers: () => void
  setResults: (results: QuizResults | null) => void
  setIsGenerating: (isGenerating: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  resetQuiz: () => void
  
  // Navigation helpers
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  
  // Computed helpers
  getCurrentQuestion: () => Question | null
  isFirstQuestion: () => boolean
  isLastQuestion: () => boolean
  getAnsweredCount: () => number
  canSubmit: () => boolean
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  currentQuiz: null,
  currentQuestionIndex: 0,
  userAnswers: {},
  results: null,
  isGenerating: false,
  isSubmitting: false,
  isLoading: false,
  error: null,
  
  // Actions
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, currentQuestionIndex: 0 }),
  
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  
  setUserAnswer: (questionId, answer) =>
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questionId]: answer,
      },
    })),
  
  clearUserAnswers: () => set({ userAnswers: {} }),
  
  setResults: (results) => set({ results }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating, error: isGenerating ? null : get().error }),
  
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isGenerating: false, isSubmitting: false, isLoading: false }),
  
  resetQuiz: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      userAnswers: {},
      results: null,
      isGenerating: false,
      isSubmitting: false,
      isLoading: false,
      error: null,
    }),
  
  // Navigation helpers
  nextQuestion: () => {
    const { currentQuiz, currentQuestionIndex } = get()
    if (currentQuiz?.questions && currentQuestionIndex < currentQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },
  
  previousQuestion: () => {
    const { currentQuestionIndex } = get()
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 })
    }
  },
  
  goToQuestion: (index) => {
    const { currentQuiz } = get()
    if (currentQuiz?.questions && index >= 0 && index < currentQuiz.questions.length) {
      set({ currentQuestionIndex: index })
    }
  },
  
  // Computed helpers
  getCurrentQuestion: () => {
    const { currentQuiz, currentQuestionIndex } = get()
    if (!currentQuiz?.questions) return null
    return currentQuiz.questions[currentQuestionIndex] || null
  },
  
  isFirstQuestion: () => get().currentQuestionIndex === 0,
  
  isLastQuestion: () => {
    const { currentQuiz, currentQuestionIndex } = get()
    if (!currentQuiz?.questions) return true
    return currentQuestionIndex === currentQuiz.questions.length - 1
  },
  
  getAnsweredCount: () => Object.keys(get().userAnswers).length,
  
  canSubmit: () => {
    const { currentQuiz, userAnswers } = get()
    if (!currentQuiz?.questions) return false
    // All questions must be answered
    return currentQuiz.questions.every((q) => userAnswers[q.id])
  },
}))
