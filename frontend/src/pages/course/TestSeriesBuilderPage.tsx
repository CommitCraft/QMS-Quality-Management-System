import { useEffect, useMemo, useRef, useState } from 'react';
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

export const TestSeriesBuilderPage = () => {
  const navigate = useNavigate();
  const { testSeriesId } = useParams();
  const [testSeries, setTestSeries] = useState<TestSeries | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('General');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [formData, setFormData] = useState<Question>({
    questionText: '',
    questionType: 'mcq',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    marks: 1,
    section: 'General',
  });

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
      const sections = [...new Set(normalizedQuestions.map((q: Question) => q.section || 'General'))];
      if (sections.length > 0) {
        setSelectedSection((sections as string[])[0]);
      }
    } catch (error) {
      toast.error('Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  const groupedQuestions = useMemo(() => {
    const groups = new Map<string, Question[]>();
    questions.forEach((q) => {
      const section = q.section || 'General';
      if (!groups.has(section)) {
        groups.set(section, []);
      }
      groups.get(section)!.push(q);
    });
    return groups;
  }, [questions]);

  const sections = useMemo(() => {
    const sectionArray = Array.from(groupedQuestions.keys()).sort();
    if (selectedSection && !sectionArray.includes(selectedSection)) {
      return [selectedSection, ...sectionArray];
    }
    return sectionArray;
  }, [groupedQuestions, selectedSection]);

  const openQuestionForm = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData(question);
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: '',
        questionType: 'mcq',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        marks: 1,
        section: selectedSection,
      });
    }
    setShowQuestionForm(true);
  };

  const closeQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
  };

  const saveQuestion = async () => {
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (formData.questionType === 'mcq' && !formData.correctAnswer) {
      toast.error('Please select a correct answer');
      return;
    }

    if (formData.questionType === 'true_false' && !formData.correctAnswer) {
      toast.error('Please select correct answer (True/False)');
      return;
    }

    try {
      if (editingQuestion && editingQuestion.id) {
        // Update existing question
        const updatedQuestions = questions.map((q) =>
          q.id === editingQuestion.id ? { ...formData, id: editingQuestion.id, testSeriesId: testSeriesId ? Number(testSeriesId) : undefined } : q,
        );
        setQuestions(updatedQuestions);
        toast.success('Question updated');
      } else {
        // Add new question
        const newQuestion: Question = {
          ...formData,
          id: Date.now(),
          testSeriesId: testSeriesId ? Number(testSeriesId) : undefined,
        };
        setQuestions([...questions, newQuestion]);
        toast.success('Question added');
      }
      closeQuestionForm();
    } catch (error) {
      toast.error('Failed to save question');
    }
  };

  const deleteQuestion = async (questionId?: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setQuestions(questions.filter((q) => q.id !== questionId));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const publishTestSeries = async () => {
    if (questions.length === 0) {
      toast.error('Add at least one question before publishing');
      return;
    }

    try {
      // Save all questions first
      const payload = {
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
        })),
        totalQuestions: questions.length,
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
      };

      if (testSeriesId) {
        await api.put(`/test-series/${testSeriesId}`, payload);
        toast.success('Test series published successfully');
        loadTestSeries();
      }
    } catch (error) {
      toast.error('Failed to publish test series');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading Test Series...</div>
        </div>
      </div>
    );
  }

  if (!testSeries) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Test Series Not Found</div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-purple-600 text-white rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const selectedSectionQuestions = groupedQuestions.get(selectedSection) || [];
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
          >
            ← Back
          </button>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{testSeries.title}</h1>
            {testSeries.description && <p className="text-gray-600 mb-4">{testSeries.description}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">{totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{testSeries.durationMinutes} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-2xl font-bold text-gray-900">{testSeries.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections and Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Sections</h2>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setSelectedSection(section)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedSection === section
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{section}</div>
                    <div className="text-xs mt-1">
                      {groupedQuestions.get(section)?.length || 0} questions • {groupedQuestions.get(section)?.reduce((sum, q) => sum + q.marks, 0) || 0} marks
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => {
                    const newSection = `Section ${sections.length + 1}`;
                    setSelectedSection(newSection);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 transition"
                >
                  + New Section
                </button>
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{selectedSection}</h2>
                <button
                  onClick={() => openQuestionForm()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  + Add Question
                </button>
              </div>

              {selectedSectionQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No questions in this section yet</p>
                  <button
                    onClick={() => openQuestionForm()}
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSectionQuestions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                              Q{index + 1}
                            </span>
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">
                              {question.questionType === 'mcq'
                                ? 'MCQ'
                                : question.questionType === 'true_false'
                                  ? 'True/False'
                                  : 'Short Answer'}
                            </span>
                            <span className="ml-auto px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              {question.marks} Mark{question.marks > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium">{question.questionText}</p>
                        </div>
                        <div className="flex gap-2 ml-4 shrink-0">
                          <button
                            onClick={() => openQuestionForm(question)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Display Options */}
                      {question.questionType === 'mcq' && (
                        <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded">
                          {[
                            { label: 'A', value: question.optionA },
                            { label: 'B', value: question.optionB },
                            { label: 'C', value: question.optionC },
                            { label: 'D', value: question.optionD },
                          ]
                            .filter(({ value }) => value)
                            .map(({ label, value }) => (
                              <div
                                key={label}
                                className={`p-2 rounded text-sm ${
                                  question.correctAnswer === label
                                    ? 'bg-green-100 text-green-900 font-semibold'
                                    : 'text-gray-700'
                                }`}
                              >
                                <span className="font-semibold">{label}.</span> {value}
                                {question.correctAnswer === label && <span className="ml-2">✓ Correct</span>}
                              </div>
                            ))}
                        </div>
                      )}

                      {question.questionType === 'true_false' && (
                        <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded">
                          {['True', 'False'].map((option) => (
                            <div
                              key={option}
                              className={`p-2 rounded text-sm ${
                                question.correctAnswer === option
                                  ? 'bg-green-100 text-green-900 font-semibold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {option}
                              {question.correctAnswer === option && <span className="ml-2">✓ Correct</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={publishTestSeries}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Publish Test Series
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Question Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'mcq', label: 'MCQ (Multiple Choice)' },
                    { value: 'true_false', label: 'True/False' },
                    { value: 'short_answer', label: 'Short Answer' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, questionType: value as QuestionType })}
                      className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                        formData.questionType === value
                          ? 'border-purple-600 bg-purple-50 text-purple-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                <select
                  value={formData.section || selectedSection}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                  <option value={`Section ${sections.length + 1}`}>New Section</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter the complete question text here..."
                  className="w-full px-3 py-2 border text-white border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition resize-vertical"
                  rows={3}
                />
              </div>

              {/* MCQ Options */}
              {formData.questionType === 'mcq' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {[
                    { key: 'optionA', label: 'A' },
                    { key: 'optionB', label: 'B' },
                    { key: 'optionC', label: 'C' },
                    { key: 'optionD', label: 'D' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={label}
                        checked={formData.correctAnswer === label}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        className="mt-2.5"
                      />
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Option {label}</label>
                        <input
                          type="text"
                          value={(formData as any)[key] || ''}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          placeholder={`Enter option ${label}...`}
                          className="w-full px-3 py-2 text-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False Options */}
              {formData.questionType === 'true_false' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                  <div className="flex gap-4">
                    {['True', 'False'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={option}
                          checked={formData.correctAnswer === option}
                          onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Short Answer Note */}
              {formData.questionType === 'short_answer' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <strong>Short Answer Question:</strong> Students will provide text answers. No options needed.
                </div>
              )}

              {/* Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  placeholder="Enter marks for this question"
                  className="w-full px-3 py-2 text-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={closeQuestionForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingQuestion ? 'Update' : 'Add'} Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
