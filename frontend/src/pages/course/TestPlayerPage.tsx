import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

type QuestionType = 'mcq' | 'true_false' | 'short_answer';

type Question = {
  id?: number;
  testSeriesId?: number;
  questionText: string;
  questionType: QuestionType;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string | null;
  marks: number;
  section?: string;
};

type StudentAnswer = {
  questionId: number;
  answer: string;
};

type TestAttempt = {
  id?: number;
  time: string;
  score: number;
  passed: boolean;
};

type TestSeries = {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  questions?: Question[];
};

export const TestPlayerPage = () => {
  const navigate = useNavigate();
  const { testSeriesId } = useParams();
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (testSeriesId) {
      loadTestSeries();
    }
  }, [testSeriesId]);

  const loadTestSeries = async () => {
    if (!testSeriesId) return;
    setLoading(true);
    try {
      const response = await api.get(`/test-series/${testSeriesId}`);
      const data = response.data.data;
      setTestSeries(data);
      const normalizedQuestions = (data.questions || []).map((q: any) => ({
        ...q,
        testSeriesId: Number(q.testSeriesId) || undefined,
        id: Number(q.id),
        marks: Number(q.marks),
      }));
      setQuestions(normalizedQuestions);
      setTimeRemaining(data.durationMinutes * 60); // Convert to seconds
      const attemptsResponse = await api.get(`/test-series/${data.id}/attempts`);
      const attemptsData = Array.isArray(attemptsResponse.data?.data) ? attemptsResponse.data.data : [];
      setAttempts(attemptsData);
    } catch (error) {
      toast.error('Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || submitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, submitted, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (answer: string) => {
    const existingIndex = answers.findIndex((a) => a.questionId === currentQuestion.id);
    const newAnswers = [...answers];

    if (existingIndex >= 0) {
      newAnswers[existingIndex].answer = answer;
    } else {
      newAnswers.push({ questionId: currentQuestion.id || 0, answer });
    }

    setAnswers(newAnswers);
  };

  const getCurrentAnswer = (): string => {
    const answer = answers.find((a) => a.questionId === currentQuestion.id);
    return answer?.answer || '';
  };

  const submitTest = async () => {
    try {
      // calculate score locally
      const totalMarks = answers.reduce((sum, a) => {
        const q = questions.find((q) => q.id === a.questionId);
        return sum + (q && q.correctAnswer === a.answer ? q.marks : 0);
      }, 0);

      const passed = testSeries ? totalMarks >= testSeries.passingMarks : false;

      const response = await api.post(`/test-series/${testSeriesId}/attempts`, {
        score: totalMarks,
        passed,
      });

      const savedAttempt = response.data?.data as TestAttempt | undefined;
      if (savedAttempt) {
        setAttempts((prev) => [...prev, savedAttempt]);
      }

      toast.success('Test submitted successfully!');
      setSubmitted(true);
      setShowReview(true);
    } catch (error) {
      const message =
        (error as AxiosError<{ message?: string }>)?.response?.data?.message ||
        (error as Error)?.message ||
        'Failed to submit test';
      toast.error(message);

      if (testSeriesId) {
        try {
          const attemptsResponse = await api.get(`/test-series/${testSeriesId}/attempts`);
          const attemptsData = Array.isArray(attemptsResponse.data?.data) ? attemptsResponse.data.data : [];
          setAttempts(attemptsData);
        } catch {
          // Ignore refresh failures here.
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading Test...</div>
        </div>
      </div>
    );
  }

  if (!testSeries || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Test Not Found</div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 text-white rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{testSeries.title}</h1>
          {testSeries.description && <p className="text-gray-600 mb-6">{testSeries.description}</p>}

          <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Total Questions:</span>
              <span className="text-gray-900 font-bold">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Total Marks:</span>
              <span className="text-gray-900 font-bold">{testSeries.totalMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Duration:</span>
              <span className="text-gray-900 font-bold">{testSeries.durationMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Passing Marks:</span>
              <span className="text-gray-900 font-bold">{testSeries.passingMarks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Attempts:</span>
              <span className="text-gray-900 font-bold">{attempts.length}</span>
            </div>
            {attempts.length > 0 && (
              <div className="mt-2 text-sm text-slate-600">
                Last: {new Date(attempts[attempts.length - 1].time).toLocaleString()} — {attempts[attempts.length - 1].passed ? 'Passed' : `${attempts[attempts.length - 1].score} marks`}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setTestStarted(true)}
              disabled={attempts.some((a) => a.passed)}
              className={`w-full px-6 py-3 rounded-lg font-bold transition ${attempts.some((a) => a.passed) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              {attempts.some((a) => a.passed) ? 'Test Passed — No Retakes' : 'Start Test'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showReview && submitted) {
    const correctAnswers = answers.filter((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      return q && q.correctAnswer === a.answer;
    }).length;

    const totalMarks = answers.reduce((sum, a) => {
      const q = questions.find((q) => q.id === a.questionId);
      return sum + (q && q.correctAnswer === a.answer ? q.marks : 0);
    }, 0);

    const percentage = Math.round((totalMarks / testSeries.totalMarks) * 100);
    const passed = totalMarks >= testSeries.passingMarks;

    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Completed!</h1>

            <div className={`inline-block px-6 py-3 rounded-lg mb-8 ${passed ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              <p className="text-lg font-bold">{passed ? '✓ PASSED' : '✗ FAILED'}</p>
            </div>

            <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg">
              <div className="text-5xl font-bold text-purple-600 mb-2">{totalMarks}/{testSeries.totalMarks}</div>
              <div className="text-xl text-gray-700">
                You scored <span className="font-bold">{percentage}%</span>
              </div>
              <div className="text-sm text-gray-600">
                Correct Answers: <span className="font-bold">{correctAnswers}/{questions.length}</span>
              </div>
              {testSeries.passingMarks && (
                <div className="text-sm text-gray-600">
                  Passing Marks: <span className="font-bold">{testSeries.passingMarks}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition"
              >
                Close Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{testSeries.title}</h1>
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className={`text-2xl font-bold ${timeRemaining <= 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`aspect-square flex items-center justify-center rounded font-bold text-sm transition ${
                      idx === currentQuestionIndex
                        ? 'bg-purple-600 text-white'
                        : answers.find((a) => a.questionId === q.id)
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-6 text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>Not Answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              {/* Question Text */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex-1">
                    {currentQuestion.questionText}
                  </h2>
                  <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-900 rounded text-sm font-semibold">
                    {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                </div>
                {currentQuestion.section && (
                  <p className="text-sm text-gray-600">Section: {currentQuestion.section}</p>
                )}
              </div>

              {/* Question Type Badge */}
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded text-sm font-semibold">
                  {currentQuestion.questionType === 'mcq'
                    ? 'MCQ (Multiple Choice)'
                    : currentQuestion.questionType === 'true_false'
                      ? 'True/False'
                      : 'Short Answer'}
                </span>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.questionType === 'mcq' && (
                  <>
                    {[
                      { label: 'A', value: currentQuestion.optionA },
                      { label: 'B', value: currentQuestion.optionB },
                      { label: 'C', value: currentQuestion.optionC },
                      { label: 'D', value: currentQuestion.optionD },
                    ]
                      .filter(({ value }) => value)
                      .map(({ label, value }) => (
                        <label
                          key={label}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                            getCurrentAnswer() === label
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={label}
                            checked={getCurrentAnswer() === label}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="mr-3"
                          />
                          <span className="font-semibold text-gray-700 mr-3">{label}.</span>
                          <span className="text-gray-700">{value}</span>
                        </label>
                      ))}
                  </>
                )}

                {currentQuestion.questionType === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition text-center justify-center font-semibold ${
                          getCurrentAnswer() === option
                            ? 'border-purple-600 bg-purple-50 text-purple-900'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          checked={getCurrentAnswer() === option}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.questionType === 'short_answer' && (
                  <textarea
                    value={getCurrentAnswer()}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                ← Previous
              </button>

              <div className="flex gap-3">
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Next →
                  </button>
                )}
                {currentQuestionIndex === questions.length - 1 && (
                  <button
                    onClick={submitTest}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition"
                  >
                    Submit Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
