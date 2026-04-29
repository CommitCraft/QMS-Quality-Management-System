import { Fragment, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Modal } from '../../components/Modal';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { lmsService } from '../../services/lmsService';

type CourseRow = {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  instructor?: string;
  status?: string;
  createdAt?: string;
  autoAssignToNewEmployee?: boolean;
  autoAssign?: boolean;
};

type CourseResponse = {
  success: boolean;
  data?: CourseRow[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CourseFormState = {
  code: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  instructor: string;
  status: 'Active' | 'Inactive';
  autoAssignToNewEmployee: boolean;
};

type TabKey = 'Courses' | 'Content' | 'Assignments' | 'Checking' | 'Test Series';

type LmsItem = Record<string, any> & { id: number };

type LmsModalMode = 'content' | 'assignment' | 'submission' | 'testSeries';

type LmsFormState = {
  courseId: number;
  title: string;
  description: string;
  contentSourceType: 'file' | 'url';
  contentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  fileUrl: string;
  externalUrl: string;
  fileName: string;
  contentFile: File | null;
  displayOrder: string;
  isRequired: boolean;
  status: string;
  dueDate: string;
  maxMarks: string;
  passingMarks: string;
  attachmentSourceType: 'file' | 'url';
  attachmentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  attachmentUrl: string;
  attachmentFileName: string;
  assignmentFile: File | null;
  totalQuestions: string;
  totalMarks: string;
  durationMinutes: string;
  startDate: string;
  endDate: string;
  submissionStatus: string;
  marksObtained: string;
  feedback: string;
};

const tabs: TabKey[] = ['Courses', 'Content', 'Assignments', 'Checking', 'Test Series'];

const defaultLmsForm: LmsFormState = {
  courseId: 0,
  title: '',
  description: '',
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
  submissionStatus: 'submitted',
  marksObtained: '',
  feedback: '',
};

const initialForm: CourseFormState = {
  code: '',
  title: '',
  description: '',
  duration: '',
  category: '',
  instructor: '',
  status: 'Active',
  autoAssignToNewEmployee: true,
};

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const CoursePage = () => {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('Courses');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lmsLoading, setLmsLoading] = useState(true);
  const [lmsSaving, setLmsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [contentRows, setContentRows] = useState<LmsItem[]>([]);
  const [assignmentRows, setAssignmentRows] = useState<LmsItem[]>([]);
  const [submissionRows, setSubmissionRows] = useState<LmsItem[]>([]);
  const [testSeriesRows, setTestSeriesRows] = useState<LmsItem[]>([]);
  const [courseSummary, setCourseSummary] = useState<any | null>(null);
  const [lmsModalMode, setLmsModalMode] = useState<LmsModalMode | null>(null);
  const [lmsEditing, setLmsEditing] = useState<LmsItem | null>(null);
  const [lmsForm, setLmsForm] = useState<LmsFormState>(defaultLmsForm);
  const [form, setForm] = useState<CourseFormState>(initialForm);

  useEffect(() => {
    const handleCloseMenus = () => setOpenActionId(null);
    window.addEventListener('click', handleCloseMenus);
    return () => window.removeEventListener('click', handleCloseMenus);
  }, []);

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await api.get<CourseResponse>('/training', {
        params: { search: search || undefined, page, limit: 10 },
      });
      setRows(response.data.data || []);
      if (response.data.meta) {
        setMeta(response.data.meta);
      }
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status && status !== 404) {
        toast.error('Unable to load courses');
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, [search, page]);

  const loadLmsData = async () => {
    setLmsLoading(true);
    try {
      const [summaryResponse, assignmentsResponse, submissionsResponse, testsResponse] = await Promise.all([
        lmsService.courseSummary(),
        lmsService.listAssignments(),
        lmsService.listSubmissions(),
        lmsService.listTestSeries(),
      ]);

      setCourseSummary(summaryResponse.data || null);
      setAssignmentRows((assignmentsResponse.data || []) as LmsItem[]);
      setSubmissionRows((submissionsResponse.data || []) as LmsItem[]);
      setTestSeriesRows((testsResponse.data || []) as LmsItem[]);
    } catch {
      toast.error('Unable to load LMS panels');
    } finally {
      setLmsLoading(false);
    }
  };

  useEffect(() => {
    void loadLmsData();
  }, []);

  useEffect(() => {
    if (!selectedCourseId && rows.length > 0) {
      setSelectedCourseId(rows[0].id);
    }
  }, [rows, selectedCourseId]);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedCourseId) {
        setContentRows([]);
        return;
      }

      try {
        const response = await lmsService.listContent(selectedCourseId);
        setContentRows((response.data || []) as LmsItem[]);
      } catch {
        toast.error('Unable to load course content');
        setContentRows([]);
      }
    };

    void loadContent();
  }, [selectedCourseId]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (row: CourseRow) => {
    setEditing(row);
    setForm({
      code: row.code || '',
      title: row.title || '',
      description: row.description || '',
      duration: String(row.duration ?? ''),
      category: row.category || '',
      instructor: row.instructor || '',
      status: (row.status as 'Active' | 'Inactive') || 'Active',
      autoAssignToNewEmployee: Boolean(row.autoAssignToNewEmployee ?? row.autoAssign ?? true),
    });
    setModalOpen(true);
  };

  const handleDelete = async (row: CourseRow) => {
    if (!window.confirm(`Delete ${row.title || 'this course'}?`)) {
      return;
    }

    try {
      await api.delete(`/training/${row.id}`);
      toast.success('Course deleted');
      await loadRows();
    } catch {
      toast.error('Unable to delete course');
    }
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      toast.error('Code and title are required');
      return;
    }

    setSaving(true);
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      duration: Number(form.duration || 0),
      category: form.category.trim(),
      instructor: form.instructor.trim(),
      status: form.status,
      autoAssignToNewEmployee: form.autoAssignToNewEmployee,
    };

    try {
      if (editing) {
        await api.put(`/training/${editing.id}`, payload);
        toast.success('Course updated');
      } else {
        await api.post('/training', payload);
        toast.success('Course created');
      }
      setModalOpen(false);
      await loadRows();
    } catch {
      toast.error('Unable to save course');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof CourseFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openLmsModal = (mode: LmsModalMode, item?: LmsItem | null) => {
    const courseId = selectedCourseId || rows[0]?.id || 0;
    setLmsModalMode(mode);
    setLmsEditing(item || null);
    setLmsForm({
      ...defaultLmsForm,
      courseId,
      ...(mode === 'content' && item
        ? {
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
          }
        : {}),
      ...(mode === 'assignment' && item
        ? {
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
          }
        : {}),
      ...(mode === 'testSeries' && item
        ? {
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
          }
        : {}),
      ...(mode === 'submission' && item
        ? {
            title: item.assignment?.title || 'Submission Review',
            submissionStatus: item.status || 'submitted',
            marksObtained: item.marksObtained !== null && item.marksObtained !== undefined ? String(item.marksObtained) : '',
            feedback: item.feedback || '',
          }
        : {}),
    });
  };

  const closeLmsModal = () => {
    setLmsModalMode(null);
    setLmsEditing(null);
    setLmsForm(defaultLmsForm);
  };

  const saveLmsModal = async () => {
    if (!lmsModalMode) {
      return;
    }

    if (!lmsForm.courseId) {
      toast.error('Select a course first');
      return;
    }

    setLmsSaving(true);
    try {
      if (lmsModalMode === 'content') {
        const payload = {
          courseId: lmsForm.courseId,
          title: lmsForm.title.trim(),
          description: lmsForm.description.trim(),
          contentSourceType: lmsForm.contentSourceType,
          contentType: lmsForm.contentType,
          fileUrl: lmsForm.fileUrl.trim() || undefined,
          externalUrl: lmsForm.externalUrl.trim() || undefined,
          fileName: lmsForm.fileName.trim() || undefined,
          displayOrder: Number(lmsForm.displayOrder || 1),
          isRequired: lmsForm.isRequired,
          status: lmsForm.status,
        };

        if (lmsForm.contentFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          formData.append('file', lmsForm.contentFile);

          if (lmsEditing) {
            await lmsService.updateContentWithFile(lmsEditing.id, formData);
            toast.success('Content updated');
          } else {
            await lmsService.uploadContent(lmsForm.courseId, formData);
            toast.success('Content created');
          }
        } else if (lmsEditing) {
          await lmsService.updateContent(lmsEditing.id, payload);
          toast.success('Content updated');
        } else {
          await lmsService.saveContent(lmsForm.courseId, payload);
          toast.success('Content created');
        }

        const response = await lmsService.listContent(lmsForm.courseId);
        setContentRows((response.data || []) as LmsItem[]);
      }

      if (lmsModalMode === 'assignment') {
        const payload = {
          courseId: lmsForm.courseId,
          title: lmsForm.title.trim(),
          description: lmsForm.description.trim(),
          dueDate: lmsForm.dueDate || undefined,
          maxMarks: Number(lmsForm.maxMarks || 100),
          passingMarks: Number(lmsForm.passingMarks || 40),
          attachmentSourceType: lmsForm.attachmentSourceType,
          attachmentType: lmsForm.attachmentType,
          attachmentUrl: lmsForm.attachmentUrl.trim() || undefined,
          attachmentFileName: lmsForm.attachmentFileName.trim() || undefined,
          status: lmsForm.status,
        };

        let assignmentId = lmsEditing?.id || null;
        if (lmsEditing) {
          await lmsService.updateAssignment(lmsEditing.id, payload);
          toast.success('Assignment updated');
        } else {
          const created = await lmsService.saveAssignment(payload);
          assignmentId = created.data?.id || null;
          toast.success('Assignment created');
        }

        if (lmsForm.assignmentFile && assignmentId) {
          const formData = new FormData();
          formData.append('file', lmsForm.assignmentFile);
          await lmsService.uploadAssignmentAttachment(assignmentId, formData);
        }

        const response = await lmsService.listAssignments();
        setAssignmentRows((response.data || []) as LmsItem[]);
      }

      if (lmsModalMode === 'submission' && lmsEditing) {
        const payload = {
          status: lmsForm.submissionStatus,
          marksObtained: lmsForm.marksObtained ? Number(lmsForm.marksObtained) : undefined,
          feedback: lmsForm.feedback.trim(),
        };
        await lmsService.checkSubmission(lmsEditing.id, payload);
        toast.success('Submission checked');
        const response = await lmsService.listSubmissions();
        setSubmissionRows((response.data || []) as LmsItem[]);
      }

      if (lmsModalMode === 'testSeries') {
        const payload = {
          courseId: lmsForm.courseId,
          title: lmsForm.title.trim(),
          description: lmsForm.description.trim(),
          totalQuestions: Number(lmsForm.totalQuestions || 0),
          totalMarks: Number(lmsForm.totalMarks || 0),
          passingMarks: Number(lmsForm.passingMarks || 0),
          durationMinutes: Number(lmsForm.durationMinutes || 0),
          startDate: lmsForm.startDate || undefined,
          endDate: lmsForm.endDate || undefined,
          status: lmsForm.status,
        };
        if (lmsEditing) {
          await lmsService.updateTestSeries(lmsEditing.id, payload);
          toast.success('Test series updated');
        } else {
          await lmsService.saveTestSeries(payload);
          toast.success('Test series created');
        }
        const response = await lmsService.listTestSeries();
        setTestSeriesRows((response.data || []) as LmsItem[]);
      }

      closeLmsModal();
    } catch {
      toast.error('Unable to save LMS item');
    } finally {
      setLmsSaving(false);
    }
  };

  const deleteLmsItem = async (mode: LmsModalMode, item: LmsItem) => {
    try {
      if (mode === 'content') {
        await lmsService.deleteContent(item.id);
        toast.success('Content deleted');
        const response = await lmsService.listContent(selectedCourseId || item.courseId);
        setContentRows((response.data || []) as LmsItem[]);
      }
      if (mode === 'assignment') {
        await lmsService.deleteAssignment(item.id);
        toast.success('Assignment deleted');
        const response = await lmsService.listAssignments();
        setAssignmentRows((response.data || []) as LmsItem[]);
      }
      if (mode === 'testSeries') {
        await lmsService.deleteTestSeries(item.id);
        toast.success('Test series deleted');
        const response = await lmsService.listTestSeries();
        setTestSeriesRows((response.data || []) as LmsItem[]);
      }
    } catch {
      toast.error('Unable to delete item');
    }
  };

  const contentColumns = useMemo(() => [
    { key: 'title', label: 'Content Title' },
    { key: 'contentType', label: 'Type' },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
    { key: 'displayOrder', label: 'Order' },
    { key: 'isRequired', label: 'Required', render: (item: Record<string, unknown>) => String(item.isRequired ? 'Yes' : 'No') },
  ], []);

  const assignmentColumns = useMemo(() => [
    { key: 'title', label: 'Assignment' },
    { key: 'course', label: 'Course', render: (item: Record<string, unknown>) => String((item as any).course?.title || '-') },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
    { key: 'maxMarks', label: 'Marks' },
    { key: 'dueDate', label: 'Due' },
    { key: 'submittedCount', label: 'Submitted' },
    { key: 'checkedCount', label: 'Checked' },
  ], []);

  const submissionColumns = useMemo(() => [
    { key: 'assignment', label: 'Assignment', render: (item: Record<string, unknown>) => String((item as any).assignment?.title || '-') },
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'submitted')} /> },
    { key: 'submittedAt', label: 'Submitted At' },
    { key: 'marksObtained', label: 'Marks' },
  ], []);

  const testColumns = useMemo(() => [
    { key: 'title', label: 'Test Series' },
    { key: 'course', label: 'Course', render: (item: Record<string, unknown>) => String((item as any).course?.title || '-') },
    { key: 'status', label: 'Status', render: (item: Record<string, unknown>) => <StatusBadge value={String(item.status || 'Draft')} /> },
    { key: 'totalQuestions', label: 'Questions' },
    { key: 'totalMarks', label: 'Marks' },
    { key: 'durationMinutes', label: 'Duration' },
  ], []);

  return (
    <div className="container-fluid space-y-4">
      <div className="flex flex-col gap-4 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="me-auto">
          <div className="flex items-center gap-2">
            <span className="mb-0 text-[22px] font-semibold text-slate-900">Courses</span>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-blue-600 transition hover:bg-blue-50"
              title="Course page help"
            >
              <span className="text-lg leading-none">?</span>
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage training courses, open details, and add new programs from this screen.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => void loadRows()}
          >
            <span className="text-base leading-none">↻</span>
            <span className="hidden md:inline">Refresh</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={openCreate}
          >
            <span className="text-base leading-none">＋</span>
            <span className="hidden md:inline">Add Course</span>
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'border border-[#d1d5db] bg-white text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-md border border-[#d9e0e4] bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#eef4f6] text-slate-700">
                  <th className="sticky left-0 z-[101] w-[72px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    
                  </th>
                  <th className="w-[320px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Title
                  </th>
                  <th className="w-[175px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Created Date
                  </th>
                  <th className="w-[220px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    Auto Assign to New Employee
                  </th>
                  <th className="w-[180px] whitespace-nowrap border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-right">
                    Actions
                  </th>
                </tr>
                <tr className="bg-white">
                  <th className="sticky left-0 z-[102] border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2">
                    <input
                      className="h-[34px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Title"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                    />
                  </th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                  <th className="border-b border-[#eef2f5] px-4 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Loading courses...
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((row, index) => {
                    const isExpanded = expandedId === row.id;
                    const autoAssign = Boolean(row.autoAssignToNewEmployee ?? row.autoAssign ?? false);
                    const actionClass = 'block w-full rounded px-3 py-2 text-left text-sm transition';

                    return (
                      <Fragment key={row.id}>
                        <tr
                          className={`${index % 2 === 0 ? 'even-row' : 'odd-row'} border-b border-[#eef2f5] transition hover:bg-[#f8fbfb]`}
                        >
                          <td className="sticky left-0 z-[100] whitespace-nowrap bg-inherit px-4 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                                onClick={() => setExpandedId((current) => (current === row.id ? null : row.id))}
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                <span className={`text-sm leading-none transition ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                              </button>

                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            <div className="font-medium text-slate-900">{row.title || '-'}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                                autoAssign ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {autoAssign ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-right">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                title="Course actions"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenActionId((current) => (current === row.id ? null : row.id));
                                }}
                              >
                                <span>Actions</span>
                                <span className="text-base leading-none">▾</span>
                              </button>

                              {openActionId === row.id ? (
                                <div
                                  className="absolute right-0 top-10 z-30 min-w-[240px] rounded-xl border border-[#d1d5db] bg-white p-2 shadow-xl"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <button type="button" className={`${actionClass} text-slate-700 hover:bg-slate-50`} onClick={() => { setOpenActionId(null); openEdit(row); }}>
                                    Edit course
                                  </button>
                                  <button type="button" className={`${actionClass} text-slate-700 hover:bg-slate-50`} onClick={() => { setOpenActionId(null); setActiveTab('Content'); setSelectedCourseId(row.id); }}>
                                    Manage content
                                  </button>
                                  <button type="button" className={`${actionClass} text-slate-700 hover:bg-slate-50`} onClick={() => { setOpenActionId(null); setActiveTab('Assignments'); setSelectedCourseId(row.id); }}>
                                    Manage assignments
                                  </button>
                                  <button type="button" className={`${actionClass} text-slate-700 hover:bg-slate-50`} onClick={() => { setOpenActionId(null); setActiveTab('Checking'); setSelectedCourseId(row.id); }}>
                                    Assignment checking
                                  </button>
                                  <button type="button" className={`${actionClass} text-slate-700 hover:bg-slate-50`} onClick={() => { setOpenActionId(null); setActiveTab('Test Series'); setSelectedCourseId(row.id); }}>
                                    Test series
                                  </button>
                                  <button type="button" className={`${actionClass} text-red-600 hover:bg-red-50`} onClick={() => { setOpenActionId(null); void handleDelete(row); }}>
                                    Delete course
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr className="border-b border-[#eef2f5] bg-white">
                            <td colSpan={5} className="px-4 py-4">
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Code</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.code || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Duration</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.duration ? `${row.duration} min` : '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Instructor</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.instructor || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Category</div>
                                  <div className="mt-1 text-sm font-medium text-slate-900">{row.category || '-'}</div>
                                </div>
                              </div>
                              <div className="mt-4 rounded-md border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm text-slate-700">
                                {row.description || 'No description provided.'}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm font-medium text-slate-500">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={5} className="border-t border-[#d9e0e4] bg-white px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-slate-400"
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                      >
                        ‹ Previous
                      </button>

                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span>Page</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 py-2 font-bold text-blue-700">{meta.page}</span>
                        <span>of</span>
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-[#d9e0e4] bg-white px-3 py-2 font-bold text-slate-800">{meta.totalPages}</span>
                      </div>

                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:text-slate-400"
                        disabled={page >= meta.totalPages}
                        onClick={() => setPage((current) => current + 1)}
                      >
                        Next ›
                      </button>
                    </div>

                    <div className="mt-3 text-center text-xs font-medium text-slate-500">
                      Showing <span className="font-semibold text-slate-800">{rows.length}</span> of{' '}
                      <span className="font-semibold text-slate-800">{meta.total}</span> records
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={`${editing ? 'Edit' : 'Add'} Course`}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Code</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.code}
              onChange={(event) => updateForm('code', event.target.value)}
              placeholder="TRN-001"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              placeholder="Course title"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="number"
              min={0}
              value={form.duration}
              onChange={(event) => updateForm('duration', event.target.value)}
              placeholder="90"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              placeholder="Compliance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Instructor</label>
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.instructor}
              onChange={(event) => updateForm('instructor', event.target.value)}
              placeholder="Instructor name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              placeholder="Course description"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={form.status}
              onChange={(event) => updateForm('status', event.target.value as 'Active' | 'Inactive')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.autoAssignToNewEmployee}
                onChange={(event) => updateForm('autoAssignToNewEmployee', event.target.checked)}
              />
              Auto assign to new employee
            </label>
          </div>
        </div>
      </Modal>

      <div className="space-y-4 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[18px] font-semibold text-slate-900">
              {activeTab === 'Courses' ? 'LMS Overview' : activeTab}
            </div>
            <p className="text-sm text-slate-500">
              {activeTab === 'Courses'
                ? 'Monitor training content, assignments, checking, and assessments from the same course workspace.'
                : 'Manage the selected LMS area without leaving the course page.'}
            </p>
          </div>

          {activeTab !== 'Courses' ? (
            <div className="min-w-[240px]">
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select
                className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={selectedCourseId || ''}
                onChange={(event) => setSelectedCourseId(Number(event.target.value))}
              >
                {rows.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.code || `Course ${course.id}`}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {activeTab !== 'Courses' ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9e0e4] bg-white px-4 py-3">
            <div className="text-sm text-slate-600">
              Manage the selected course's {activeTab.toLowerCase()} here.
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
                onClick={() => {
                  if (activeTab === 'Content') openLmsModal('content');
                  if (activeTab === 'Assignments') openLmsModal('assignment');
                  if (activeTab === 'Checking') openLmsModal('submission');
                  if (activeTab === 'Test Series') openLmsModal('testSeries');
                }}
              >
                  Add {activeTab === 'Test Series' ? 'Test Series' : activeTab === 'Checking' ? 'Submission Review' : activeTab === 'Assignments' ? 'Assignment' : 'Content'}
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === 'Courses' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-[#d9e0e4] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Courses</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{courseSummary?.totalCourses ?? rows.length}</div>
            </div>
            <div className="rounded-lg border border-[#d9e0e4] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Assignments</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{assignmentRows.length}</div>
            </div>
            <div className="rounded-lg border border-[#d9e0e4] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Test Series</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{testSeriesRows.length}</div>
            </div>
            <div className="rounded-lg border border-[#d9e0e4] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Content Items</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{contentRows.length}</div>
            </div>
          </div>
        ) : null}

        {activeTab === 'Content' ? (
          <DataTable
            columns={contentColumns as never}
            rows={contentRows}
            loading={lmsLoading}
            onEdit={(row) => openLmsModal('content', row)}
            onDelete={(row) => void deleteLmsItem('content', row)}
          />
        ) : null}

        {activeTab === 'Assignments' ? (
          <DataTable
            columns={assignmentColumns as never}
            rows={assignmentRows}
            loading={lmsLoading}
            onEdit={(row) => openLmsModal('assignment', row)}
            onDelete={(row) => void deleteLmsItem('assignment', row)}
          />
        ) : null}

        {activeTab === 'Checking' ? (
          <DataTable
            columns={submissionColumns as never}
            rows={submissionRows}
            loading={lmsLoading}
            onEdit={(row) => openLmsModal('submission', row)}
          />
        ) : null}

        {activeTab === 'Test Series' ? (
          <DataTable
            columns={testColumns as never}
            rows={testSeriesRows}
            loading={lmsLoading}
            onEdit={(row) => openLmsModal('testSeries', row)}
            onDelete={(row) => void deleteLmsItem('testSeries', row)}
          />
        ) : null}
      </div>

      <Modal
        open={Boolean(lmsModalMode)}
        title={
          lmsModalMode === 'content'
            ? `${lmsEditing ? 'Edit' : 'Add'} Content`
            : lmsModalMode === 'assignment'
              ? `${lmsEditing ? 'Edit' : 'Add'} Assignment`
              : lmsModalMode === 'submission'
                ? 'Check Assignment Submission'
                : `${lmsEditing ? 'Edit' : 'Add'} Test Series`
        }
        onClose={closeLmsModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={closeLmsModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              onClick={() => void saveLmsModal()}
              disabled={lmsSaving}
            >
              {lmsSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        {lmsModalMode === 'content' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.courseId} onChange={(event) => setLmsForm((current) => ({ ...current, courseId: Number(event.target.value) }))}>
                {rows.map((course) => <option key={course.id} value={course.id}>{course.title || course.code || `Course ${course.id}`}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.title} onChange={(event) => setLmsForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Content Type</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.contentType} onChange={(event) => setLmsForm((current) => ({ ...current, contentType: event.target.value as LmsFormState['contentType'] }))}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="image">Image</option>
                <option value="link">Link</option>
                <option value="ppt">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Source Type</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.contentSourceType} onChange={(event) => setLmsForm((current) => ({ ...current, contentSourceType: event.target.value as LmsFormState['contentSourceType'] }))}>
                <option value="url">URL</option>
                <option value="file">File</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.description} onChange={(event) => setLmsForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">External URL</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.externalUrl} onChange={(event) => setLmsForm((current) => ({ ...current, externalUrl: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">File URL</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.fileUrl} onChange={(event) => setLmsForm((current) => ({ ...current, fileUrl: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload File</label>
              <input
                className="block w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png,.webp"
                onChange={(event) => setLmsForm((current) => ({ ...current, contentFile: event.target.files?.[0] || null }))}
              />
              <p className="mt-1 text-xs text-slate-500">
                Uploading a file will use the file picker and save the file with the content record.
              </p>
              {lmsForm.contentFile ? <p className="mt-1 text-xs font-medium text-blue-700">Selected: {lmsForm.contentFile.name}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Display Order</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={1} value={lmsForm.displayOrder} onChange={(event) => setLmsForm((current) => ({ ...current, displayOrder: event.target.value }))} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-slate-700">
                <input type="checkbox" checked={lmsForm.isRequired} onChange={(event) => setLmsForm((current) => ({ ...current, isRequired: event.target.checked }))} />
                Required content
              </label>
            </div>
          </div>
        ) : null}

        {lmsModalMode === 'assignment' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.courseId} onChange={(event) => setLmsForm((current) => ({ ...current, courseId: Number(event.target.value) }))}>
                {rows.map((course) => <option key={course.id} value={course.id}>{course.title || course.code || `Course ${course.id}`}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.title} onChange={(event) => setLmsForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Due Date</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="datetime-local" value={lmsForm.dueDate} onChange={(event) => setLmsForm((current) => ({ ...current, dueDate: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.status} onChange={(event) => setLmsForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Max Marks</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.maxMarks} onChange={(event) => setLmsForm((current) => ({ ...current, maxMarks: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Passing Marks</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.passingMarks} onChange={(event) => setLmsForm((current) => ({ ...current, passingMarks: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.description} onChange={(event) => setLmsForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <div className="rounded-lg border border-[#d9e0e4] bg-[#f8fbfb] px-4 py-3 text-xs text-slate-600">
                If you attach a file, it will be uploaded to the assignment's attachment endpoint. Otherwise the URL fields can be used.
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Upload Attachment</label>
              <input
                className="block w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.webp"
                onChange={(event) => setLmsForm((current) => ({ ...current, assignmentFile: event.target.files?.[0] || null }))}
              />
              {lmsForm.assignmentFile ? <p className="mt-1 text-xs font-medium text-blue-700">Selected: {lmsForm.assignmentFile.name}</p> : null}
            </div>
          </div>
        ) : null}

        {lmsModalMode === 'submission' ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm text-slate-700">
              {lmsEditing?.assignment?.title || 'Submission'}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.submissionStatus} onChange={(event) => setLmsForm((current) => ({ ...current, submissionStatus: event.target.value }))}>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="checked">Checked</option>
                  <option value="rejected">Rejected</option>
                  <option value="resubmission_required">Resubmission Required</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Marks Obtained</label>
                <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.marksObtained} onChange={(event) => setLmsForm((current) => ({ ...current, marksObtained: event.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Feedback</label>
                <textarea className="min-h-[120px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.feedback} onChange={(event) => setLmsForm((current) => ({ ...current, feedback: event.target.value }))} />
              </div>
            </div>
          </div>
        ) : null}

        {lmsModalMode === 'testSeries' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course</label>
              <select className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.courseId} onChange={(event) => setLmsForm((current) => ({ ...current, courseId: Number(event.target.value) }))}>
                {rows.map((course) => <option key={course.id} value={course.id}>{course.title || course.code || `Course ${course.id}`}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.title} onChange={(event) => setLmsForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Total Questions</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.totalQuestions} onChange={(event) => setLmsForm((current) => ({ ...current, totalQuestions: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.durationMinutes} onChange={(event) => setLmsForm((current) => ({ ...current, durationMinutes: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Total Marks</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.totalMarks} onChange={(event) => setLmsForm((current) => ({ ...current, totalMarks: event.target.value }))} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Passing Marks</label>
              <input className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="number" min={0} value={lmsForm.passingMarks} onChange={(event) => setLmsForm((current) => ({ ...current, passingMarks: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea className="min-h-[100px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={lmsForm.description} onChange={(event) => setLmsForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CoursePage;
