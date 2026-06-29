import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:5000/api";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  fullName: "Test User",
  role: "User" as const,
  isActive: true,
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00Z",
  lastLoginAt: "2024-06-01T00:00:00Z",
};

const mockAdminUser = {
  ...mockUser,
  id: "admin-1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  fullName: "Admin User",
  role: "Admin" as const,
};

const mockExams = [
  {
    id: "exam-1",
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of core JavaScript concepts including closures, prototypes, and async patterns.",
    status: "Active",
    passingPercentage: 70,
    durationMinutes: 30,
    maxAttempts: 3,
    questionCount: 10,
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "exam-2",
    title: "React Advanced Patterns",
    description: "Deep dive into React hooks, context, render optimization, and component composition patterns.",
    status: "Active",
    passingPercentage: 75,
    durationMinutes: 45,
    maxAttempts: 2,
    questionCount: 15,
    createdAt: "2024-04-01T00:00:00Z",
  },
  {
    id: "exam-3",
    title: "TypeScript Mastery",
    description: "Advanced TypeScript type system including generics, conditional types, and mapped types.",
    status: "Active",
    passingPercentage: 80,
    durationMinutes: 60,
    maxAttempts: 2,
    questionCount: 20,
    createdAt: "2024-05-01T00:00:00Z",
  },
];

const mockQuestions = [
  {
    id: "q-1",
    examId: "exam-1",
    questionText: "What is a closure in JavaScript?",
    option1: "A function that has access to variables in its outer scope",
    option2: "A way to close a browser window",
    option3: "A method to end a loop",
    option4: "A type of error handling",
    correctOptionIndex: 0,
    sortOrder: 1,
    explanation: "A closure is a function that retains access to its lexical scope.",
  },
  {
    id: "q-2",
    examId: "exam-1",
    questionText: "Which keyword declares a block-scoped variable?",
    option1: "var",
    option2: "let",
    option3: "function",
    option4: "global",
    correctOptionIndex: 1,
    sortOrder: 2,
    explanation: "let declares a block-scoped variable.",
  },
  {
    id: "q-3",
    examId: "exam-1",
    questionText: "What does the '===' operator check?",
    option1: "Value equality only",
    option2: "Type equality only",
    option3: "Value and type equality",
    option4: "Reference equality",
    correctOptionIndex: 2,
    sortOrder: 3,
  },
];

const mockAttempt = {
  attemptId: "attempt-1",
  startedAt: "2024-06-01T10:00:00Z",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  questions: mockQuestions.map(({ correctOptionIndex: _ci, explanation: _ex, ...q }) => q),
};

const mockAttemptHistory = [
  {
    id: "attempt-1",
    examId: "exam-1",
    examTitle: "JavaScript Fundamentals",
    startedAt: "2024-06-01T10:00:00Z",
    completedAt: "2024-06-01T10:25:00Z",
    status: "Completed",
    score: 80,
    isPassed: true,
  },
  {
    id: "attempt-2",
    examId: "exam-2",
    examTitle: "React Advanced Patterns",
    startedAt: "2024-06-02T14:00:00Z",
    completedAt: "2024-06-02T14:40:00Z",
    status: "Completed",
    score: 60,
    isPassed: false,
  },
];

const mockResult = {
  attemptId: "attempt-1",
  examId: "exam-1",
  examTitle: "JavaScript Fundamentals",
  score: 80,
  isPassed: true,
  passingPercentage: 70,
  totalQuestions: 3,
  correctAnswers: 2,
  startedAt: "2024-06-01T10:00:00Z",
  completedAt: "2024-06-01T10:25:00Z",
  questionResults: [
    {
      questionId: "q-1",
      questionText: "What is a closure in JavaScript?",
      option1: "A function that has access to variables in its outer scope",
      option2: "A way to close a browser window",
      option3: "A method to end a loop",
      option4: "A type of error handling",
      selectedOptionIndex: 0,
      correctOptionIndex: 0,
      isCorrect: true,
      explanation: "A closure is a function that retains access to its lexical scope.",
    },
    {
      questionId: "q-2",
      questionText: "Which keyword declares a block-scoped variable?",
      option1: "var",
      option2: "let",
      option3: "function",
      option4: "global",
      selectedOptionIndex: 1,
      correctOptionIndex: 1,
      isCorrect: true,
      explanation: "let declares a block-scoped variable.",
    },
    {
      questionId: "q-3",
      questionText: "What does the '===' operator check?",
      option1: "Value equality only",
      option2: "Type equality only",
      option3: "Value and type equality",
      option4: "Reference equality",
      selectedOptionIndex: 0,
      correctOptionIndex: 2,
      isCorrect: false,
    },
  ],
};

export const handlers = [
  // Auth
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "bad@example.com") {
      return HttpResponse.json(
        { success: false, message: "Invalid credentials", data: null, errors: ["Invalid credentials"] },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: "Login successful",
      data: { user: mockUser, accessToken: "mock-access-token", expiresIn: 3600 },
    });
  }),

  http.post(`${BASE_URL}/auth/register`, async () => {
    return HttpResponse.json({
      success: true,
      message: "Registration successful",
      data: { user: mockUser, accessToken: "mock-access-token", expiresIn: 3600 },
    });
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true, message: "Logged out", data: null });
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      message: "Token refreshed",
      data: { accessToken: "new-access-token", expiresIn: 3600 },
    });
  }),

  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json({ success: true, message: "OK", data: mockUser });
  }),

  // CMS - Feature Flags
  http.get(`${BASE_URL}/cms/features`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: [
        { key: "enable_exams", isEnabled: true },
        { key: "enable_payments", isEnabled: true },
        { key: "enable_certificates", isEnabled: true },
        { key: "maintenance_mode", isEnabled: false },
      ],
    });
  }),

  // Resources
  http.get(`${BASE_URL}/resources`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  }),

  // ── Exam Endpoints ──────────────────────────────────────────────────────

  http.get(`${BASE_URL}/user/exams`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: {
        items: mockExams,
        totalCount: mockExams.length,
        pageNumber: 1,
        pageSize: 12,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  }),

  http.get(`${BASE_URL}/user/exams/:examId`, ({ params }) => {
    const exam = mockExams.find((e) => e.id === params.examId);
    if (!exam) {
      return HttpResponse.json(
        { success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: { ...exam, userAttemptCount: 1 },
    });
  }),

  http.post(`${BASE_URL}/user/exams/:examId/start`, () => {
    return HttpResponse.json({
      success: true,
      message: "Attempt started",
      data: mockAttempt,
    });
  }),

  http.post(`${BASE_URL}/user/exams/attempts/:attemptId/submit`, () => {
    return HttpResponse.json({
      success: true,
      message: "Exam submitted",
      data: {
        score: 80,
        isPassed: true,
        passingPercentage: 70,
        totalQuestions: 3,
        correctAnswers: 2,
      },
    });
  }),

  http.get(`${BASE_URL}/user/exams/attempts`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: {
        items: mockAttemptHistory,
        totalCount: mockAttemptHistory.length,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  }),

  http.get(`${BASE_URL}/user/exams/attempts/:attemptId/result`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: { ...mockResult, attemptId: params.attemptId },
    });
  }),

  // Admin exam endpoints
  http.get(`${BASE_URL}/admin/exams`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: {
        items: mockExams,
        totalCount: mockExams.length,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  }),

  http.get(`${BASE_URL}/admin/exams/:examId/questions`, () => {
    return HttpResponse.json({
      success: true,
      message: "OK",
      data: mockQuestions,
    });
  }),
];

export { mockUser, mockAdminUser, mockExams, mockQuestions, mockAttempt, mockResult };
