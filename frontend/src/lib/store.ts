// frontend/src/lib/store.ts
import { create } from 'zustand'

interface SummaryData {
  text: string | null
  summaryId: string | null
  loading: boolean
  error: string | null
}

interface SummaryState {
  summaries: Record<string, SummaryData>
  addSummary: (documentId: string, text: string | null, summaryId?: string | null) => void
  setSummaryLoading: (documentId: string, loading: boolean) => void
  setSummaryError: (documentId: string, error: string | null) => void
  getSummaryById: (documentId: string) => SummaryData | undefined
}

export const useSummaryStore = create<SummaryState>((set, get) => ({
  summaries: {},
  addSummary: (documentId, text, summaryId = null) =>
    set((state) => ({
      summaries: {
        ...state.summaries,
        [documentId]: { text, summaryId, loading: false, error: null },
      },
    })),
  setSummaryLoading: (documentId, loading) =>
    set((state) => ({
      summaries: {
        ...state.summaries,
        [documentId]: {
          ...state.summaries[documentId],
          loading,
          error: loading ? null : state.summaries[documentId]?.error, // Clear error on new load
        },
      },
    })),
  setSummaryError: (documentId, error) =>
    set((state) => ({
      summaries: {
        ...state.summaries,
        [documentId]: {
          ...state.summaries[documentId],
          error,
          loading: false,
        },
      },
    })),
  getSummaryById: (documentId) => get().summaries[documentId],
}))
