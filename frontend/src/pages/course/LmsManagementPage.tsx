import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { LmsModal } from './LmsModal';
import { useLmsData } from './useLmsData';
import {
  CourseRow,
  CourseResponse,
  LmsItem,
  LmsModalMode,
  LmsFormState,
  DEFAULT_LMS_FORM,
} from './types';

type LmsViewType = 'content' | 'assignments' | 'checking' | 'testSeries';

interface LmsManagementPageProps {
  view?: LmsViewType;
}

export const LmsManagementPage = ({ view = 'content' }: LmsManagementPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(courseId ? Number(courseId) : null);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const {
    lmsLoading,
    lmsSaving,
    setLmsSaving,
    contentRows,
    assignmentRows,
    submissionRows,
    testSeriesRows,
    courseSummary,
    loadLmsData,
    loadContent,
    saveLmsContent,
    saveLmsAssignment,
    checkSubmission,
    saveLmsTestSeries,
    deleteContent,
    deleteAssignment,
    deleteTestSeries,
  } = useLmsData();

  const [lmsModalMode, setLmsModalMode] = useState<LmsModalMode | null>(null);
  const [lmsEditing, setLmsEditing] = useState<LmsItem | null>(null);
  const [lmsForm, setLmsForm] = useState<LmsFormState>(DEFAULT_LMS_FORM);

  // Load courses on mount
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get<CourseResponse>('/training', {
          params: { limit: 100 },
        });
        setCourses(response.data.data || []);
        if (!selectedCourseId && response.data.data?.[0]) {
          setSelectedCourseId(response.data.data[0].id);
        }
      } catch {
        toast.error('Unable to load courses');
      } finally {
        setCoursesLoading(false);
      }
    };
    void loadCourses();
  }, []);

  // Load LMS data when component mounts
  useEffect(() => {
    void loadLmsData();
  }, [loadLmsData]);

  // Load content when selected course changes
  useEffect(() => {
    if (selectedCourseId) {
      void loadContent(selectedCourseId);
      setSearchParams({ courseId: String(selectedCourseId) });
    }
  }, [selectedCourseId, loadContent, setSearchParams]);

  const openLmsModal = (mode: LmsModalMode, item?: LmsItem | null) => {
    const courseId = selectedCourseId || courses[0]?.id || 0;
    setLmsModalMode(mode);
    setLmsEditing(item || null);
    setLmsForm(createLmsFormState(mode, item, courseId));
  };

  const closeLmsModal = () => {
    setLmsModalMode(null);
    setLmsEditing(null);
    setLmsForm(DEFAULT_LMS_FORM);
  };

  const saveLmsModal = async () => {
    if (!lmsModalMode) {
      return;
    }

    if (!lmsForm.courseId && lmsModalMode !== 'submission') {
      toast.error('Select a course first');
      return;
    }

    setLmsSaving(true);
    try {
      switch (lmsModalMode) {
        case 'content':
          await saveLmsContent(lmsForm, lmsEditing);
          break;
        case 'assignment':
          await saveLmsAssignment(lmsForm, lmsEditing);
          break;
        case 'submission':
          await checkSubmission(lmsForm, lmsEditing);
          break;
        case 'testSeries':
          await saveLmsTestSeries(lmsForm, lmsEditing);
          break;
      }
      closeLmsModal();
    } catch (err) {
      // show server error message when available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e: any = err;
      if (e && e.response && e.response.data) {
        const msg = e.response.data.message || e.response.data.error || e.response.data || e.message;
        toast.error(String(msg));
      } else {
        toast.error('Unable to save LMS item');
      }
    } finally {
      setLmsSaving(false);
    }
  };

  const deleteLmsItem = async (mode: LmsModalMode, item: LmsItem) => {
    try {
      switch (mode) {
        case 'content':
          await deleteContent(item, selectedCourseId);
          break;
        case 'assignment':
          await deleteAssignment(item);
          break;
        case 'testSeries':
          await deleteTestSeries(item);
          break;
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e: any = err;
      if (e && e.response && e.response.data) {
        const msg = e.response.data.message || e.response.data.error || e.response.data || e.message;
        toast.error(String(msg));
      } else {
        toast.error('Unable to delete item');
      }
    }
  };

  // Memoized columns for each view type
  const contentColumns = useMemo(
    () => [
      { key: 'title', label: 'Content Title' },
      { key: 'contentType', label: 'Type' },
      { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
      { key: 'displayOrder', label: 'Order' },
      { key: 'isRequired', label: 'Required', render: (item: Record<string, unknown>) => String(item.isRequired ? 'Yes' : 'No') },
    ],
    []
  );

  const assignmentColumns = useMemo(
    () => [
      { key: 'title', label: 'Assignment' },
      { key: 'course', label: 'Course', render: (item: Record<string, unknown>) => String((item as any).course?.title || '-') },
      { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
      { key: 'maxMarks', label: 'Marks' },
      { key: 'dueDate', label: 'Due' },
      { key: 'submittedCount', label: 'Submitted' },
      { key: 'checkedCount', label: 'Checked' },
    ],
    []
  );

  const submissionColumns = useMemo(
    () => [
      { key: 'assignment', label: 'Assignment', render: (item: Record<string, unknown>) => String((item as any).assignment?.title || '-') },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'submitted')} /> },
      { key: 'submittedAt', label: 'Submitted At' },
      { key: 'marksObtained', label: 'Marks' },
    ],
    []
  );

  const testColumns = useMemo(
    () => [
      { key: 'title', label: 'Test Series' },
      { key: 'course', label: 'Course', render: (item: Record<string, unknown>) => String((item as any).course?.title || '-') },
      { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
      { key: 'totalQuestions', label: 'Questions' },
      { key: 'totalMarks', label: 'Marks' },
      { key: 'durationMinutes', label: 'Duration' },
    ],
    []
  );

  const getViewTitle = (view: LmsViewType): string => {
    switch (view) {
      case 'content':
        return 'Course Content';
      case 'assignments':
        return 'Assignments';
      case 'checking':
        return 'Assignment Checking';
      case 'testSeries':
        return 'Test Series';
    }
  };

  const getAddButtonLabel = (view: LmsViewType): string => {
    switch (view) {
      case 'content':
        return 'Add Content';
      case 'assignments':
        return 'Add Assignment';
      case 'checking':
        return 'Add Submission Review';
      case 'testSeries':
        return 'Add Test Series';
    }
  };

  const getLmsMode = (view: LmsViewType): LmsModalMode => {
    switch (view) {
      case 'content':
        return 'content';
      case 'assignments':
        return 'assignment';
      case 'checking':
        return 'submission';
      case 'testSeries':
        return 'testSeries';
    }
  };

  const getRows = (view: LmsViewType): LmsItem[] => {
    switch (view) {
      case 'content':
        return contentRows;
      case 'assignments':
        return assignmentRows;
      case 'checking':
        return submissionRows;
      case 'testSeries':
        return testSeriesRows;
    }
  };

  const getColumns = (view: LmsViewType) => {
    switch (view) {
      case 'content':
        return contentColumns;
      case 'assignments':
        return assignmentColumns;
      case 'checking':
        return submissionColumns;
      case 'testSeries':
        return testColumns;
    }
  };

  const canDelete = (view: LmsViewType): boolean => {
    return view !== 'checking';
  };

  const rows = getRows(view);
  const columns = getColumns(view);
  const lmsMode = getLmsMode(view);

  return (
    <div className="space-y-4 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            type="button"
            className="mb-2 inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => navigate('/course/list')}
          >
            <span className="text-base leading-none">←</span>
            Back to Courses
          </button>
          <div className="text-[18px] font-semibold text-slate-900">{getViewTitle(view)}</div>
          <p className="text-sm text-slate-500">Manage {getViewTitle(view).toLowerCase()} for the selected course.</p>
        </div>

        <div className="min-w-[240px]">
          <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
          <select
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={selectedCourseId || ''}
            onChange={(event) => setSelectedCourseId(Number(event.target.value))}
            disabled={coursesLoading}
          >
            {coursesLoading ? (
              <option>Loading courses...</option>
            ) : courses.length === 0 ? (
              <option>No courses available</option>
            ) : (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.code || `Course ${course.id}`}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9e0e4] bg-white px-4 py-3">
        <div className="text-sm text-slate-600">
          Manage {getViewTitle(view).toLowerCase()} for the selected course.
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => void loadLmsData()}
          >
            Refresh
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={() => openLmsModal(lmsMode)}
          >
            {getAddButtonLabel(view)}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns as never}
        rows={rows}
        loading={lmsLoading}
        onEdit={(row) => openLmsModal(lmsMode, row)}
        onDelete={canDelete(view) ? (row) => void deleteLmsItem(lmsMode, row) : undefined}
      />

      <LmsModal
        open={Boolean(lmsModalMode)}
        mode={lmsModalMode}
        form={lmsForm}
        editing={lmsEditing}
        saving={lmsSaving}
        courses={courses}
        onClose={closeLmsModal}
        onSave={saveLmsModal}
        onFormChange={(key, value) => setLmsForm((current) => ({ ...current, [key]: value }))}
      />
    </div>
  );
};

function createLmsFormState(mode: LmsModalMode, item: LmsItem | null | undefined, courseId: number): LmsFormState {
  const baseForm: LmsFormState = {
    ...DEFAULT_LMS_FORM,
    courseId,
  };

  if (!item) return baseForm;

  switch (mode) {
    case 'content':
      return {
        ...baseForm,
        courseId: Number(item.courseId || courseId),
        title: item.title || '',
        description: item.description || '',
        contentSourceType: item.contentSourceType || 'url',
        contentType: item.contentType || 'pdf',
        fileUrl: item.fileUrl || '',
        externalUrl: item.externalUrl || '',
        fileName: item.fileName || '',
        contentFile: null,
        displayOrder: String(item.displayOrder ?? 1),
        isRequired: Boolean(item.isRequired),
        status: item.status || 'Draft',
        dueDate: '',
        maxMarks: '100',
        passingMarks: '40',
        attachmentSourceType: 'url',
        attachmentType: 'pdf',
        attachmentUrl: '',
        attachmentFileName: '',
        assignmentFile: null,
        totalQuestions: '0',
        totalMarks: '0',
        durationMinutes: '0',
        startDate: '',
        endDate: '',
        submissionStatus: 'submitted',
        marksObtained: '',
        feedback: '',
      };

    case 'assignment':
      return {
        ...baseForm,
        courseId: Number(item.courseId || courseId),
        title: item.title || '',
        description: item.description || '',
        dueDate: item.dueDate ? String(item.dueDate).slice(0, 16) : '',
        maxMarks: String(item.maxMarks ?? 100),
        passingMarks: String(item.passingMarks ?? 40),
        attachmentSourceType: item.attachmentSourceType || 'url',
        attachmentType: item.attachmentType || 'pdf',
        attachmentUrl: item.attachmentUrl || '',
        attachmentFileName: item.attachmentFileName || '',
        assignmentFile: null,
        status: item.status || 'Draft',
        contentSourceType: 'url',
        contentType: 'pdf',
        fileUrl: '',
        externalUrl: '',
        fileName: '',
        contentFile: null,
        displayOrder: '1',
        isRequired: false,
        totalQuestions: '0',
        totalMarks: '0',
        durationMinutes: '0',
        startDate: '',
        endDate: '',
        submissionStatus: 'submitted',
        marksObtained: '',
        feedback: '',
      };

    case 'testSeries':
      return {
        ...baseForm,
        courseId: Number(item.courseId || courseId),
        title: item.title || '',
        description: item.description || '',
        totalQuestions: String(item.totalQuestions ?? 0),
        totalMarks: String(item.totalMarks ?? 0),
        passingMarks: String(item.passingMarks ?? 0),
        durationMinutes: String(item.durationMinutes ?? 0),
        startDate: item.startDate ? String(item.startDate).slice(0, 16) : '',
        endDate: item.endDate ? String(item.endDate).slice(0, 16) : '',
        status: item.status || 'Draft',
        contentSourceType: 'url',
        contentType: 'pdf',
        fileUrl: '',
        externalUrl: '',
        fileName: '',
        contentFile: null,
        displayOrder: '1',
        isRequired: false,
        dueDate: '',
        maxMarks: '100',
        attachmentSourceType: 'url',
        attachmentType: 'pdf',
        attachmentUrl: '',
        attachmentFileName: '',
        assignmentFile: null,
        submissionStatus: 'submitted',
        marksObtained: '',
        feedback: '',
      };

    case 'submission':
      return {
        ...baseForm,
        title: item.assignment?.title || 'Submission Review',
        submissionStatus: item.status || 'submitted',
        marksObtained: item.marksObtained !== null && item.marksObtained !== undefined ? String(item.marksObtained) : '',
        feedback: item.feedback || '',
        contentSourceType: 'url',
        contentType: 'pdf',
        fileUrl: '',
        externalUrl: '',
        fileName: '',
        contentFile: null,
        displayOrder: '1',
        isRequired: false,
        status: 'Draft',
        dueDate: '',
        maxMarks: '100',
        passingMarks: '40',
        attachmentSourceType: 'url',
        attachmentType: 'pdf',
        attachmentUrl: '',
        attachmentFileName: '',
        assignmentFile: null,
        totalQuestions: '0',
        totalMarks: '0',
        durationMinutes: '0',
        startDate: '',
        endDate: '',
      };

    default:
      return baseForm;
  }
}
