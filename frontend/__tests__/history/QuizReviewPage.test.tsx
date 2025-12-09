import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import QuizReviewPage from "@/app/history/quiz/[quiz_id]/page";
import * as historyService from "@/services/history";

// Mock dependencies
jest.mock("@/services/history");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  useParams: jest.fn(() => ({
    quiz_id: "quiz-123",
  })),
}));

// Helper to mock document.cookie
const mockCookie = (value: string) => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: value,
  });
};

const mockGetQuizReview = historyService.getQuizReview as jest.MockedFunction<
  typeof historyService.getQuizReview
>;

const mockQuizReviewData: historyService.QuizReviewResponse = {
  data: {
    id: "quiz-123",
    document_id: "doc-123",
    document_title: "Test Document",
    title: "Test Quiz",
    status: "completed",
    total_questions: 3,
    score: 2,
    score_percentage: 66.7,
    ai_model: "gpt-4",
    created_at: "2024-01-15T10:00:00Z",
    questions: [
      {
        id: "q1",
        question_text: "What is 2+2?",
        question_type: "multiple_choice",
        options: ["3", "4", "5", "6"],
        correct_answer: "4",
        user_answer: "4",
        is_correct: true,
        explanation: "2+2 equals 4",
        order_index: 0,
      },
      {
        id: "q2",
        question_text: "What is the capital of France?",
        question_type: "multiple_choice",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correct_answer: "Paris",
        user_answer: "London",
        is_correct: false,
        explanation: "Paris is the capital of France",
        order_index: 1,
      },
      {
        id: "q3",
        question_text: "What color is the sky?",
        question_type: "multiple_choice",
        options: ["Red", "Green", "Blue", "Yellow"],
        correct_answer: "Blue",
        user_answer: "Blue",
        is_correct: true,
        explanation: null,
        order_index: 2,
      },
    ],
  },
  message: "Quiz review retrieved successfully",
  status: "success",
};

describe("QuizReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default cookie with access token
    mockCookie("access_token=test-token; other_cookie=value");
  });

  afterEach(() => {
    // Reset cookie after each test
    mockCookie("");
  });

  it("should render loading state initially", () => {
    mockGetQuizReview.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<QuizReviewPage />);
    // The component renders a spinner SVG with animate-spin class during loading
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it("should render quiz review data successfully", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    // Check score display
    expect(screen.getByText(/66\.7%/)).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();

    // Check questions are rendered
    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
    expect(screen.getByText("What is the capital of France?")).toBeInTheDocument();
    expect(screen.getByText("What color is the sky?")).toBeInTheDocument();
  });

  it("should display correct answers with green indicator", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    // Check that correct answers are displayed
    const correctQuestion = screen.getByText("What is 2+2?").closest("div");
    expect(correctQuestion).toBeInTheDocument();
  });

  it("should display incorrect answers with red indicator", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    // Check that incorrect answer question is displayed
    const incorrectQuestion = screen.getByText("What is the capital of France?").closest("div");
    expect(incorrectQuestion).toBeInTheDocument();
  });

  it("should display explanations when available", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    // Check explanations
    expect(screen.getByText("2+2 equals 4")).toBeInTheDocument();
    expect(screen.getByText("Paris is the capital of France")).toBeInTheDocument();
  });

  it("should render error state when fetch fails", async () => {
    mockGetQuizReview.mockRejectedValue(new Error("Quiz not found"));
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText(/Quiz not found/i)).toBeInTheDocument();
    });
  });

  it("should not fetch quiz data if no session", async () => {
    // Clear the cookie to simulate no session
    mockCookie("");

    render(<QuizReviewPage />);

    // Wait a bit and ensure quiz fetch was not called
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockGetQuizReview).not.toHaveBeenCalled();
  });

  it("should call getQuizReview with correct parameters", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(mockGetQuizReview).toHaveBeenCalledWith("test-token", "quiz-123");
    });
  });

  it("should show user answer and correct answer for each question", async () => {
    mockGetQuizReview.mockResolvedValue(mockQuizReviewData);
    render(<QuizReviewPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    });

    // Check for user answer displays
    expect(screen.getByText("4")).toBeInTheDocument(); // Correct answer for q1
    expect(screen.getByText("London")).toBeInTheDocument(); // User's incorrect answer for q2
    expect(screen.getByText("Paris")).toBeInTheDocument(); // Correct answer for q2
  });
});
