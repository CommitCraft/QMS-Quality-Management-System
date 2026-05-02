import { useEffect, useMemo, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { api } from '../../services/api';

type Lecture = {
  id: number;
  contentId?: number;
  title: string;
  videoUrl?: string | null;
  completed?: boolean;
};

type CourseModule = {
  id: number;
  title: string;
  duration?: string;
  progress?: string;
  lectures: Lecture[];
};

type CourseDetail = {
  id: number;
  title?: string;
  code?: string;
  enrolledDate?: string;
  completedDate?: string | null;
  status?: string;
  progressPercentage?: number;
  modules?: CourseModule[];
  courseModules?: CourseModule[];
  sections?: CourseModule[];
};

type CourseDetailResponse = {
  success: boolean;
  data?: CourseDetail;
  message?: string;
};

type LmsItem = {
  id: number;
  assignmentId?: number;
  module?: string | null;
  displayOrder?: number | null;
  title: string;
  completed?: boolean;
  status?: string;
  description?: string;
  dueDate?: string | null;
  maxMarks?: number | null;
  passingMarks?: number | null;
  feedback?: string | null;
  submittedAt?: string | null;
  marksObtained?: number | null;
  fileName?: string | null;
  submissionUrl?: string | null;
  uploadedFileUrl?: string | null;
  contentType?: string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  attachmentUrl?: string | null;
  assignment?: {
    id?: number;
    title?: string;
    description?: string;
    dueDate?: string | null;
    maxMarks?: number | null;
    passingMarks?: number | null;
    attachmentUrl?: string | null;
  };
};

type LmsResponse = {
  success: boolean;
  data?: LmsItem[];
  message?: string;
};

type ContentProgressItem = {
  contentId: number;
  status: 'not_started' | 'opened' | 'completed';
};

type ContentGroup = {
  module: string;
  items: LmsItem[];
};

const CoursePlayerPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<number | null>(null);

  // LMS sections state
  const [courseContent, setCourseContent] = useState<LmsItem[]>([]);
  const [assignments, setAssignments] = useState<LmsItem[]>([]);
  const [submissions, setSubmissions] = useState<LmsItem[]>([]);
  const [testSeries, setTestSeries] = useState<LmsItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<LmsItem | null>(null);
  const [expandedLmsSection, setExpandedLmsSection] = useState<string | null>(null);
  const [expandedContentModules, setExpandedContentModules] = useState<Record<string, boolean>>({});
  const [lmsLoading, setLmsLoading] = useState(false);
  const [assignmentSubmitOpen, setAssignmentSubmitOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<LmsItem | null>(null);
  const [assignmentSubmissionText, setAssignmentSubmissionText] = useState('');
  const [assignmentSubmissionUrl, setAssignmentSubmissionUrl] = useState('');
  const [assignmentSubmissionFile, setAssignmentSubmissionFile] = useState<File | null>(null);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [viewSubmissionOpen, setViewSubmissionOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<LmsItem | null>(null);
  const [contentProgressById, setContentProgressById] = useState<Record<number, boolean>>({});
  const progressSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProgressRef = useRef<Record<number, 'not_started' | 'completed'>>({});

  const resolveMediaUrl = (url?: string | null) => {
    if (!url) {
      return null;
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const apiBase = api.defaults.baseURL || window.location.origin;

    try {
      const origin = new URL(apiBase, window.location.origin).origin;
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      return `${origin}${normalizedPath}`;
    } catch {
      return url;
    }
  };

  const isEmbedVideoUrl = (url?: string | null) => {
    if (!url) {
      return false;
    }

    return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
  };

  const toEmbedUrl = (url?: string | null) => {
    if (!url) {
      return null;
    }

    if (!isEmbedVideoUrl(url)) {
      return resolveMediaUrl(url);
    }

    const matchedYouTube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    if (matchedYouTube?.[1]) {
      return `https://www.youtube.com/embed/${matchedYouTube[1]}`;
    }

    const matchedVimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (matchedVimeo?.[1]) {
      return `https://player.vimeo.com/video/${matchedVimeo[1]}`;
    }

    return url;
  };

  const isDirectVideoFile = (url?: string | null) => {
    if (!url) {
      return false;
    }

    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
  };

  const getAssignmentStatusMeta = (status?: string) => {
    const normalizedStatus = (status || '').toLowerCase();

    if (normalizedStatus === 'submitted' || normalizedStatus === 'under_review' || normalizedStatus === 'pending') {
      return { label: 'Pending', dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200' };
    }

    if (normalizedStatus === 'checked' || normalizedStatus === 'approved') {
      return { label: 'Approved', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    }

    if (normalizedStatus === 'rejected' || normalizedStatus === 'resubmission_required') {
      return { label: 'Rejected', dotClass: 'bg-red-500', badgeClass: 'bg-red-50 text-red-700 border border-red-200' };
    }

    if (normalizedStatus === 'draft') {
      return { label: 'Draft', dotClass: 'bg-slate-400', badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200' };
    }

    return {
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending',
      dotClass: 'bg-slate-400',
      badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200',
    };
  };

  const getSubmissionFileUrl = (item: LmsItem) => resolveMediaUrl(item.uploadedFileUrl || item.submissionUrl || item.fileUrl || item.externalUrl || item.attachmentUrl);

  const groupedCourseContent = useMemo<ContentGroup[]>(() => {
    const groups = new Map<string, LmsItem[]>();

    courseContent
      .slice()
      .sort((left, right) => {
        const leftModule = (left.module || 'General').toLowerCase();
        const rightModule = (right.module || 'General').toLowerCase();

        if (leftModule !== rightModule) {
          return leftModule.localeCompare(rightModule);
        }

        return Number(left.displayOrder || 0) - Number(right.displayOrder || 0);
      })
      .forEach((item) => {
        const moduleName = item.module?.trim() || 'General';
        const existing = groups.get(moduleName) || [];
        existing.push(item);
        groups.set(moduleName, existing);
      });

    return Array.from(groups.entries()).map(([module, items]) => ({ module, items }));
  }, [courseContent]);

  useEffect(() => {
    if (groupedCourseContent.length === 0) {
      return;
    }

    setExpandedContentModules((current) => {
      if (Object.keys(current).length > 0) {
        return current;
      }

      return { [groupedCourseContent[0].module]: true };
    });
  }, [groupedCourseContent]);

  const normalizeModules = (courseData: CourseDetail): CourseModule[] => {
    const rawModules = (
      (Array.isArray(courseData.modules) && courseData.modules) ||
      (Array.isArray(courseData.courseModules) && courseData.courseModules) ||
      (Array.isArray(courseData.sections) && courseData.sections) ||
      []
    ) as any[];

    return rawModules
      .map((module: any, moduleIndex: number) => {
        const rawLectures =
          (Array.isArray(module?.lectures) && module.lectures) ||
          (Array.isArray(module?.items) && module.items) ||
          (Array.isArray(module?.contents) && module.contents) ||
          [];

        const normalizedLectures: Lecture[] = rawLectures.map((lecture: any, lectureIndex: number) => ({
          id: Number(lecture?.id ?? `${moduleIndex + 1}${lectureIndex + 1}`),
          contentId: lecture?.contentId ? Number(lecture.contentId) : lecture?.content?.id ? Number(lecture.content.id) : undefined,
          title: String(lecture?.title ?? lecture?.name ?? `Lecture ${lectureIndex + 1}`),
          videoUrl: lecture?.videoUrl || lecture?.fileUrl || lecture?.externalUrl || null,
          completed: Boolean(lecture?.completed),
        }));

        return {
          id: Number(module?.id ?? moduleIndex + 1),
          title: String(module?.title ?? module?.name ?? `Module ${moduleIndex + 1}`),
          duration: module?.duration ? String(module.duration) : undefined,
          progress: module?.progress ? String(module.progress) : undefined,
          lectures: normalizedLectures,
        } as CourseModule;
      })
      .filter((module) => module.title && Array.isArray(module.lectures));
  };

  // Determine assignment stage based on submission status
  const getAssignmentStage = (assignment: LmsItem) => {
    if (!assignment.status) return 'not_submitted';
    
    const normalizedStatus = assignment.status.toLowerCase();
    
    if (normalizedStatus === 'approved' || normalizedStatus === 'checked') {
      return 'approved';
    }
    if (normalizedStatus === 'rejected' || normalizedStatus === 'resubmission_required') {
      return assignment.feedback ? 'feedback_received' : 'under_review';
    }
    if (normalizedStatus === 'submitted' || normalizedStatus === 'under_review' || normalizedStatus === 'pending') {
      return 'under_review';
    }
    
    return 'not_submitted';
  };

  // Get stage-specific status label
  const getStageLabelAndStyle = (stage: string) => {
    switch (stage) {
      case 'not_submitted':
        return { 
          label: 'Not Submitted', 
          dotClass: 'bg-slate-400', 
          badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200'
        };
      case 'under_review':
        return { 
          label: 'Under Review', 
          dotClass: 'bg-amber-500', 
          badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
        };
      case 'feedback_received':
        return { 
          label: 'Needs Revision', 
          dotClass: 'bg-red-500', 
          badgeClass: 'bg-red-50 text-red-700 border border-red-200'
        };
      case 'approved':
        return { 
          label: 'Approved', 
          dotClass: 'bg-emerald-500', 
          badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        };
      default:
        return { 
          label: 'Pending', 
          dotClass: 'bg-slate-400', 
          badgeClass: 'bg-slate-50 text-slate-700 border border-slate-200'
        };
    }
  };

  // Check if assignment is approved (no resubmit allowed)
  const isAssignmentApproved = (stage: string) => stage === 'approved';

  const getAssignmentRefId = (item: LmsItem) => {
    if (typeof item.assignmentId === 'number') return item.assignmentId;
    if (typeof item.assignment?.id === 'number') return item.assignment.id;
    return item.id;
  };

  // Merge assignments and submissions into single consolidated list
  const mergedAssignments = useMemo(() => {
    const merged: (LmsItem & { stage: string })[] = [];
    const latestSubmissionByAssignment = new Map<number, LmsItem>();

    submissions
      .slice()
      .sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        if (aTime !== bTime) {
          return bTime - aTime;
        }
        return b.id - a.id;
      })
      .forEach((submission) => {
        const assignmentRefId = getAssignmentRefId(submission);
        if (!latestSubmissionByAssignment.has(assignmentRefId)) {
          latestSubmissionByAssignment.set(assignmentRefId, submission);
        }
      });
    
    // Start with all assignments
    assignments.forEach((assignment) => {
      const submission = latestSubmissionByAssignment.get(assignment.id);
      const assignmentFromSubmission = submission?.assignment;
      const stage = getAssignmentStage(submission || assignment);
      
      merged.push({
        ...assignment,
        ...(assignmentFromSubmission || {}),
        ...submission,
        id: assignment.id,
        stage,
        // Preserve assignment display fields from assignment first, then included assignment object, then submission fallback
        title: assignment.title || assignmentFromSubmission?.title || submission?.title || 'Assignment',
        description: assignment.description || assignmentFromSubmission?.description || submission?.description,
        dueDate: assignment.dueDate || assignmentFromSubmission?.dueDate || submission?.dueDate,
        maxMarks: assignment.maxMarks || assignmentFromSubmission?.maxMarks || submission?.maxMarks,
        passingMarks: assignment.passingMarks || assignmentFromSubmission?.passingMarks || submission?.passingMarks,
        attachmentUrl: assignment.attachmentUrl || assignmentFromSubmission?.attachmentUrl || submission?.attachmentUrl,
      });
    });

    // Include submissions whose assignment is not present in assignments list
    latestSubmissionByAssignment.forEach((submission, assignmentRefId) => {
      if (merged.some((item) => item.id === assignmentRefId)) {
        return;
      }

      const assignmentFromSubmission = submission.assignment;
      const stage = getAssignmentStage(submission);

      merged.push({
        ...submission,
        ...(assignmentFromSubmission || {}),
        id: assignmentRefId,
        title: assignmentFromSubmission?.title || submission.title || `Assignment #${assignmentRefId}`,
        description: assignmentFromSubmission?.description || submission.description,
        dueDate: assignmentFromSubmission?.dueDate || submission.dueDate,
        maxMarks: assignmentFromSubmission?.maxMarks || submission.maxMarks,
        passingMarks: assignmentFromSubmission?.passingMarks || submission.passingMarks,
        attachmentUrl: assignmentFromSubmission?.attachmentUrl || submission.attachmentUrl,
        stage,
      });
    });
    
    return merged;
  }, [assignments, submissions]);

  const loadCourseDetail = async () => {
    if (!courseId) {
      setErrorMessage('Course id is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get<CourseDetailResponse>(
        `/training/${courseId}`,
      );

      const courseData = response.data.data;

      if (!courseData) {
        setCourse(null);
        setModules([]);
        setErrorMessage('Course detail not found');
        return;
      }

      const backendModules = normalizeModules(courseData);

      setCourse(courseData);
      setModules(backendModules);

      const firstModule = backendModules[0];
      const firstLecture = firstModule?.lectures?.[0];

      setExpandedModuleId(firstModule?.id ?? null);
      setActiveModuleId(firstModule?.id ?? null);
      setActiveLectureId(firstLecture?.id ?? null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;

      const responseMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      setErrorMessage(responseMessage || 'Unable to load course detail');
      toast.error(responseMessage || 'Unable to load course detail');

      setCourse(null);
      setModules([]);

      setExpandedModuleId(null);
      setActiveModuleId(null);
      setActiveLectureId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourseDetail();
  }, [courseId]);

  const loadLmsData = async () => {
    if (!courseId) return;
    
    setLmsLoading(true);
    try {
      const [contentRes, assignmentsRes, submissionsRes, testsRes, progressRes] = await Promise.allSettled([
        api.get(`/courses/${courseId}/content`),
        api.get(`/assignments?courseId=${courseId}`),
        api.get(`/assignment-submissions?courseId=${courseId}`),
        api.get(`/test-series?courseId=${courseId}`),
        api.get(`/courses/${courseId}/content-progress`),
      ]);

      const progressMap: Record<number, boolean> = {};
      if (progressRes.status === 'fulfilled') {
        const progressItems = (progressRes.value.data.data || []) as ContentProgressItem[];
        progressItems.forEach((item) => {
          if (item.status === 'completed') {
            progressMap[Number(item.contentId)] = true;
          }
        });
      }

      setContentProgressById(progressMap);

      if (contentRes.status === 'fulfilled') {
        const items = (contentRes.value.data.data || []) as LmsItem[];
        setCourseContent(
          items.map((item) => ({
            ...item,
            completed: Boolean(progressMap[item.id]),
          })),
        );
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.data.data || []);
      }
      if (submissionsRes.status === 'fulfilled') {
        setSubmissions(submissionsRes.value.data.data || []);
      }
      if (testsRes.status === 'fulfilled') {
        setTestSeries(testsRes.value.data.data || []);
      }
    } catch (error) {
      // Silently fail for LMS data
    } finally {
      setLmsLoading(false);
    }
  };

  useEffect(() => {
    void loadLmsData();
  }, [courseId]);

  useEffect(() => {
    if (modules.length > 0 || groupedCourseContent.length === 0) {
      return;
    }

    const fallbackModules: CourseModule[] = groupedCourseContent.map((group, groupIndex) => {
      const fallbackLectures: Lecture[] = group.items.map((item, itemIndex) => ({
        id: Number(item.id ?? `${groupIndex + 1}${itemIndex + 1}`),
        contentId: Number(item.id ?? `${groupIndex + 1}${itemIndex + 1}`),
        title: item.title || `Content ${itemIndex + 1}`,
        videoUrl: item.fileUrl || item.externalUrl || null,
        completed: Boolean(item.completed),
      }));

      return {
        id: groupIndex + 1,
        title: group.module,
        duration: undefined,
        progress: `${fallbackLectures.filter((lecture) => lecture.completed).length} / ${fallbackLectures.length} lectures`,
        lectures: fallbackLectures,
      };
    });

    setModules(fallbackModules);
    if (!activeModuleId) {
      const firstModule = fallbackModules[0];
      setExpandedModuleId(firstModule?.id ?? null);
      setActiveModuleId(firstModule?.id ?? null);
      setActiveLectureId(firstModule?.lectures[0]?.id ?? null);
    }
  }, [modules.length, groupedCourseContent, activeModuleId]);

  useEffect(() => {
    if (!Object.keys(contentProgressById).length) {
      return;
    }

    setModules((prevModules) =>
      prevModules.map((module) => ({
        ...module,
        lectures: module.lectures.map((lecture) => {
          const progressKey = lecture.contentId ?? lecture.id;
          if (!(progressKey in contentProgressById)) {
            return lecture;
          }
          return { ...lecture, completed: contentProgressById[progressKey] };
        }),
      })),
    );
  }, [contentProgressById]);

  useEffect(
    () => () => {
      if (progressSyncTimerRef.current) {
        clearTimeout(progressSyncTimerRef.current);
      }
    },
    [],
  );

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId),
    [modules, activeModuleId],
  );

  const activeLecture = useMemo(
    () => activeModule?.lectures.find((lecture) => lecture.id === activeLectureId),
    [activeModule, activeLectureId],
  );

  const activePlayerUrl = resolveMediaUrl(activeLecture?.videoUrl) || null;
  const activePlayerTitle = activeLecture?.title || 'Lecture';
  const activePlayerType = activeLecture?.videoUrl ? 'video' : null;
  const activeEmbedUrl = toEmbedUrl(activePlayerUrl);

  const formatDueDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      }
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    } catch {
      return dateString;
    }
  };

  const formatSubmittedAt = (dateString?: string | null) => {
    if (!dateString) return '-';

    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getContentMeta = (item: LmsItem) => {
    const contentType = item.contentType?.toLowerCase();

    if (contentType === 'video') return { icon: '▶', label: 'Video', playsInline: true };
    if (contentType === 'pdf') return { icon: '📄', label: 'PDF', playsInline: false };
    if (contentType === 'doc') return { icon: '📝', label: 'Document', playsInline: false };
    if (contentType === 'ppt') return { icon: '📊', label: 'Presentation', playsInline: false };
    if (contentType === 'image') return { icon: '🖼', label: 'Image', playsInline: false };
    if (contentType === 'link') return { icon: '🔗', label: 'Link', playsInline: true };

    return { icon: '▶', label: 'Content', playsInline: false };
  };

  const lectureProgressPercentage = useMemo(() => {
    const totalLectures = modules.reduce((total, module) => total + module.lectures.length, 0);
    if (totalLectures === 0) {
      return null;
    }

    const completedLectures = modules.reduce(
      (total, module) => total + module.lectures.filter((lecture) => lecture.completed).length,
      0,
    );

    return Math.round((completedLectures / totalLectures) * 100);
  }, [modules]);

  const formatLectureProgress = (completed: number, total: number) => {
    const lectureLabel = total === 1 ? 'lecture' : 'lectures';
    return `${completed} of ${total} ${lectureLabel} completed`;
  };

  const courseProgress = Math.min(
    100,
    Math.max(0, Number(lectureProgressPercentage ?? course?.progressPercentage ?? 0)),
  );

  const courseTitle = course?.title || `Course #${courseId || '-'}`;
  const courseCode = course?.code || '-';
  const courseStatus = course?.status || 'Not Started';
  const enrolledDate = course?.enrolledDate || '-';
  const completedDate = course?.completedDate || '-';

  const handleToggleModule = (moduleId: number) => {
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleLectureClick = (moduleId: number, lectureId: number) => {
    setSelectedContent(null);
    setExpandedModuleId(moduleId);
    setActiveModuleId(moduleId);
    setActiveLectureId(lectureId);

    const lecture = modules.find((module) => module.id === moduleId)?.lectures.find((item) => item.id === lectureId);
    const contentId = lecture?.contentId ?? lecture?.id;

    if (!courseId || !contentId) {
      return;
    }

    void api.patch(`/courses/${courseId}/content/${contentId}/progress`, {
      status: lecture?.completed ? 'completed' : 'opened',
    });
  };

  const scheduleProgressSync = () => {
    if (progressSyncTimerRef.current) {
      clearTimeout(progressSyncTimerRef.current);
    }

    progressSyncTimerRef.current = setTimeout(async () => {
      if (!courseId) {
        return;
      }

      const updates = Object.entries(pendingProgressRef.current);
      if (updates.length === 0) {
        return;
      }

      pendingProgressRef.current = {};

      try {
        await Promise.all(
          updates.map(([contentId, status]) =>
            api.patch(`/courses/${courseId}/content/${contentId}/progress`, { status }),
          ),
        );
      } catch {
        toast.error('Unable to sync lecture progress. Refreshing latest data...');
        await loadLmsData();
      }
    }, 700);
  };

  const handleLectureCompletionToggle = (moduleId: number, lectureId: number) => {
    const lecture = modules.find((module) => module.id === moduleId)?.lectures.find((item) => item.id === lectureId);
    if (!lecture) {
      return;
    }

    const contentId = lecture.contentId ?? lecture.id;
    const nextCompleted = !lecture.completed;

    setModules((prevModules) =>
      prevModules.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        return {
          ...module,
          lectures: module.lectures.map((lecture) =>
            lecture.id === lectureId ? { ...lecture, completed: !lecture.completed } : lecture,
          ),
        };
      }),
    );

    if (!courseId || !contentId) {
      return;
    }

    setContentProgressById((prev) => ({
      ...prev,
      [contentId]: nextCompleted,
    }));
    pendingProgressRef.current[contentId] = nextCompleted ? 'completed' : 'not_started';
    scheduleProgressSync();
  };

  const handleContentClick = (item: LmsItem) => {
    const playableUrl = resolveMediaUrl(item.fileUrl || item.externalUrl);
    const meta = getContentMeta(item);

    if (!playableUrl) {
      toast.error('This content does not have a playable link');
      return;
    }

    if (!meta.playsInline) {
      window.open(playableUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.module) {
      setExpandedContentModules((current) => ({
        ...current,
        [item.module!.trim() || 'General']: true,
      }));
    }

    setSelectedContent(item);
  };

  const toggleContentModule = (moduleName: string) => {
    setExpandedContentModules((current) => ({
      ...current,
      [moduleName]: !current[moduleName],
    }));
  };

  const handleAssignmentView = (item: LmsItem) => {
    const assignmentUrl = resolveMediaUrl(item.attachmentUrl || item.uploadedFileUrl || item.submissionUrl || item.fileUrl || item.externalUrl);

    if (assignmentUrl) {
      window.open(assignmentUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(`/lms/assignments?courseId=${courseId}`, '_blank', 'noopener,noreferrer');
  };

  const openAssignmentSubmitModal = (item: LmsItem) => {
    setSelectedAssignment(item);
    setAssignmentSubmissionText('');
    setAssignmentSubmissionUrl('');
    setAssignmentSubmissionFile(null);
    setAssignmentSubmitOpen(true);
  };

  const openSubmissionViewModal = (item: LmsItem) => {
    setSelectedSubmission(item);
    setViewSubmissionOpen(true);
  };

  const closeSubmissionViewModal = () => {
    setViewSubmissionOpen(false);
    setSelectedSubmission(null);
  };

  const closeAssignmentSubmitModal = () => {
    setAssignmentSubmitOpen(false);
    setSelectedAssignment(null);
    setAssignmentSubmissionText('');
    setAssignmentSubmissionUrl('');
    setAssignmentSubmissionFile(null);
  };

  const handleAssignmentSubmit = async () => {
    if (!selectedAssignment) {
      return;
    }

    const hasFile = Boolean(assignmentSubmissionFile);
    const hasUrl = Boolean(assignmentSubmissionUrl.trim());
    const hasText = Boolean(assignmentSubmissionText.trim());

    if (!hasFile && !hasUrl && !hasText) {
      toast.error('Add text, URL, or file before submitting');
      return;
    }

    setAssignmentSubmitting(true);
    try {
      if (hasFile && assignmentSubmissionFile) {
        const formData = new FormData();
        formData.append('file', assignmentSubmissionFile);
        if (assignmentSubmissionText.trim()) {
          formData.append('submissionText', assignmentSubmissionText.trim());
        }
        if (assignmentSubmissionUrl.trim()) {
          formData.append('submissionUrl', assignmentSubmissionUrl.trim());
        }

        await api.post(`/assignment-submissions/assignments/${selectedAssignment.id}/submit-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/assignment-submissions/assignments/${selectedAssignment.id}/submit`, {
          submissionType: hasUrl ? 'url' : 'text',
          submissionText: assignmentSubmissionText.trim() || undefined,
          submissionUrl: assignmentSubmissionUrl.trim() || undefined,
        });
      }

      toast.success('Assignment submitted successfully');
      closeAssignmentSubmitModal();
      await loadLmsData();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const responseMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
      toast.error(responseMessage || 'Unable to submit assignment');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-white">
        <div className="text-sm font-semibold text-slate-600">
          Loading course detail...
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-70px)] w-full flex flex-col bg-white overflow-visible max-lg:h-auto max-[580px]:pb-[50px]">
      <div className="relative flex flex-col w-full">
        <div className="flex items-center justify-between w-full min-h-[50px] sm:min-h-[60px] md:min-h-[70px] px-2 sm:px-3 md:px-5 bg-[#2d2d2d] rounded-t-lg">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-7 sm:w-8 md:w-10 aspect-square rounded-md flex items-center justify-center hover:bg-white/10 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <span className="text-xl text-white">‹</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-white text-sm sm:text-base md:text-xl font-semibold leading-[1.23] capitalize tracking-[0.18px] max-w-[120px] sm:max-w-[180px] md:max-w-[420px] truncate">
                {courseTitle}
              </h2>

              <p className="hidden sm:block text-[11px] text-white/75">
                Code: {courseCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-5 justify-end">
            <div className="flex justify-center flex-col w-auto md:w-[188px] h-[36px] sm:h-[42px] md:h-[50px] gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 rounded sm:rounded-md md:rounded-lg border border-purple-600/33 bg-[#1401123b]">
              <div className="flex justify-between items-center">
                <p className="text-white hidden md:block text-[12px] font-medium leading-none">
                  Course Progress
                </p>

                <p className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-bold leading-none">
                  {courseProgress}%
                </p>
              </div>

              <div className="w-full hidden md:block h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mx-2.5 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex-1 w-full bg-white relative grid grid-cols-[minmax(0,7fr)_minmax(340px,3fr)] overflow-visible p-2.5 box-border gap-2.5 max-lg:flex max-lg:flex-col max-lg:h-auto min-h-0">
        <div className="w-full h-full overflow-y-auto pr-1.5 box-border bg-white">
          <div className="rounded-md overflow-visible">
            <div className="relative w-full">
              <div className="flex flex-col w-full aspect-video mx-auto bg-[#0f0f0f] md:rounded-xl overflow-hidden select-none font-sans">
                {activeEmbedUrl ? (
                  isEmbedVideoUrl(activeEmbedUrl) ? (
                    <iframe
                      key={activeEmbedUrl}
                      className="h-full w-full border-0"
                      src={activeEmbedUrl}
                      title={activePlayerTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : isDirectVideoFile(activeEmbedUrl) ? (
                    <video
                      key={activeEmbedUrl}
                      className="w-full h-full object-contain cursor-pointer"
                      controls
                      playsInline
                      preload="metadata"
                      src={activeEmbedUrl}
                      onError={() => toast.error('Unable to load video. Check the file URL or server access.')}
                    />
                  ) : (
                    <iframe
                      key={activeEmbedUrl}
                      className="h-full w-full border-0 bg-white"
                      src={activeEmbedUrl}
                      title={activePlayerTitle}
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
                    Video not available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2.5 rounded-lg border border-[#e7d4ee] bg-[#fdf8ff] p-3">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-[18px] font-bold text-[#800080]">
                  {activePlayerTitle}
                </h1>

                <p className="text-xs text-slate-500">
                  Selected Course ID: {courseId || course?.id || '-'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-fit rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-[#800080]">
                  {activePlayerUrl
                    ? `Playing ${activePlayerType === 'video' ? 'Video' : 'LMS Content'}`
                    : 'No playable content'}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Course Code
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseCode}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Progress
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-800">
                    {courseProgress}%
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseStatus}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Enrolled Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {enrolledDate}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Completed Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {completedDate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-[#f7ebfd] mt-2.5 rounded-md md:p-2.5">
            <div>
              <h2 className="text-[#800080] text-[16px] font-[500] sm:text-[20px]">
                Module {activeModule?.id || '-'}.{' '}
                <span className="font-[500] sm:font-semibold">
                  {activeModule?.title || 'Course Module'}
                </span>
              </h2>

              <h3 className="text-black text-[14px] font-[500] md:text-[16px] sm:mt-1">
                {activeLecture?.id || '-'}. {activeLecture?.title || 'Lecture'}
              </h3>
            </div>
          </div>
          
        </div>

        <aside className="h-full overflow-y-auto max-lg:pb-4">
          <div className="flex w-full flex-col items-center gap-2 mb-5 sm:mb-15 max-[580px]:gap-[7px]">
            <div className="w-full flex p-[17px_12px] flex-col gap-1 rounded-2xl border border-[#eaeaea] bg-white max-[580px]:p-[15px_12px]">
              <div className="flex items-center justify-between cursor-pointer">
                <div className="text-[#5c375c] text-base font-semibold opacity-[0.87]">
                  Course Resources
                </div>
              </div>

              
            

            {/* LMS Content Section */}
            {/* <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                aria-expanded={expandedLmsSection === 'content'}
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'content' ? null : 'content')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">📄 Content ({courseContent.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'content' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'content' && (
                <div className="flex flex-col gap-3 mt-2">
                  {groupedCourseContent.length > 0 ? (
                    groupedCourseContent.map((group) => (
                      <div key={group.module} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                        <button
                          type="button"
                          onClick={() => toggleContentModule(group.module)}
                          className="mb-2 flex w-full items-center justify-between rounded-md px-1 py-1 text-left transition hover:bg-white"
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{group.module}</div>
                            <div className="text-[10px] text-slate-400">Module-wise content</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                              {group.items.length}
                            </span>
                            <span className={`text-xs transition-transform ${expandedContentModules[group.module] ? 'rotate-180' : ''}`}>▼</span>
                          </div>
                        </button>

                        {expandedContentModules[group.module] ? (
                          <div className="flex flex-col gap-1.5">
                            {group.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleContentClick(item)}
                                className={`text-left text-xs p-2 rounded border transition ${selectedContent?.id === item.id ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] ring-1 ring-slate-200">
                                    {getContentMeta(item).icon}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-slate-900 truncate">{item.title}</div>
                                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-slate-600">
                                      <span>{item.status || 'Ready'}</span>
                                      <span>{getContentMeta(item).label}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No content available</div>
                  )}
                </div>
              )}
            </div> */}

            

            {/* LMS Submissions Section */}
            {/* <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'submissions' ? null : 'submissions')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">✓ Submissions ({submissions.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'submissions' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'submissions' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {submissions.length > 0 ? (
                    submissions.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No submissions available</div>
                  )}
                </div>
              )}
            </div> */}

            

            {modules.map((module) => {
              const expanded = expandedModuleId === module.id;
              const active = module.id === activeModule?.id;

              return (
                <div
                  key={module.id}
                  className={[
                    'flex flex-col items-start gap-2.5 w-full min-h-[70px] rounded-xl border border-[#eaeaea] max-[580px]:gap-[12.5px]',
                    active ? 'bg-[#fdf8ff]' : 'bg-white',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleModule(module.id)}
                    className={[
                      'w-full flex flex-col cursor-pointer items-start p-[8px_16px] max-[580px]:p-[14px_16px_7px_14px] text-left',
                      active ? 'bg-[#fbeffc] rounded-t-xl' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={[
                          'text-base font-semibold opacity-[0.87] max-w-[calc(100%-30px)] truncate',
                          active ? 'text-[#800080]' : 'text-[#5c375c]',
                        ].join(' ')}
                      >
                        Module {module.id}: {module.title}
                      </span>

                      <span
                        className={[
                          'flex h-6 w-6 items-center justify-center rounded-full border text-xs transition',
                          expanded
                            ? 'rotate-180 border-purple-200 bg-purple-50 text-purple-700'
                            : 'border-slate-200 bg-white text-slate-500',
                        ].join(' ')}
                      >
                        ↓
                      </span>
                    </div>

                    <div className="flex items-center gap-[5px] text-black/60 text-xs max-[580px]:text-[13px]">
                      <span>{module.duration || '-'}</span>
                      <div className="w-px h-[17px] bg-[#555]" />
                      <span>
                        {module.progress ||
                          formatLectureProgress(
                            module.lectures.filter((lecture) => lecture.completed).length,
                            module.lectures.length,
                          )}
                      </span>
                    </div>
                  </button>

                  {expanded ? (
                    <div className="p-[0_8px_13px_8px] flex flex-col items-start gap-[13px] flex-1 w-full">
                      {module.lectures.map((lecture, lectureIndex) => {
                        const lectureActive =
                          lecture.id === activeLectureId &&
                          module.id === activeModule?.id;

                        return (
                          <button
                            key={`${module.id}-${lecture.id}`}
                            type="button"
                            onClick={() => handleLectureClick(module.id, lecture.id)}
                            className={[
                              'flex items-center justify-between w-full cursor-pointer group rounded-lg px-2 py-1.5 transition text-left',
                              lectureActive ? 'bg-purple-50' : 'hover:bg-purple-50/60',
                            ].join(' ')}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-purple-200 text-[10px] text-[#992e9d]">
                                ▶
                              </div>

                              <div
                                className={[
                                  'text-[13px] opacity-[0.87] group-hover:text-[#992e9d] transition-colors truncate',
                                  lectureActive
                                    ? 'font-semibold text-[#992e9d]'
                                    : 'font-normal text-[#666]',
                                ].join(' ')}
                              >
                                {lectureIndex + 1}. {lecture.title}
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              className="w-[18px] h-[18px] rounded cursor-pointer accent-[#38A333] shrink-0"
                              checked={Boolean(lecture.completed)}
                              onChange={() => handleLectureCompletionToggle(module.id, lecture.id)}
                              onClick={(event) => event.stopPropagation()}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* LMS Assignments Section - Consolidated Smart Cards */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => {
                  const nextSection = expandedLmsSection === 'assignments' ? null : 'assignments';
                  setExpandedLmsSection(nextSection);
                  if (nextSection === 'assignments') {
                    void loadLmsData();
                  }
                }}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87] truncate">✎ Assignments</div>
                  <span className="rounded-full border border-[#eadcf0] bg-[#f8f2fb] px-2 py-0.5 text-[10px] font-semibold text-[#800080]">
                    {mergedAssignments.length}
                  </span>
                </div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'assignments' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'assignments' && (
                <div className="mt-2 flex flex-col gap-3">
                  {mergedAssignments.length > 0 ? (
                    mergedAssignments.slice(0, 5).map((item) => {
                      const stageLabel = getStageLabelAndStyle(item.stage);
                      const isApproved = isAssignmentApproved(item.stage);
                      const hasSubmittedFile = getSubmissionFileUrl(item);
                      const isFeedbackReceived = item.stage === 'feedback_received';
                      const isUnderReview = item.stage === 'under_review';
                      const isNotSubmitted = item.stage === 'not_submitted';
                      
                      return (
                        <div key={`assignment-${item.id}`} className="w-full rounded-xl border border-[#eaeaea] bg-white p-3 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                          {/* Title and Description */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-[#5c375c]">{item.title}</div>
                              {item.description && (
                                <div className="mt-1 line-clamp-2 text-xs text-black/55">{item.description}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${stageLabel.dotClass}`} />
                            </div>
                          </div>

                          {/* Metadata: Due Date and Marks */}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-black/50">
                            {item.dueDate && <span>📅 {formatDueDate(item.dueDate)}</span>}
                            {item.maxMarks ? <span>• {item.maxMarks} Marks</span> : null}
                            {item.submittedAt && !isNotSubmitted && <span>• Submitted {formatSubmittedAt(item.submittedAt)}</span>}
                          </div>

                          {/* Status Badge */}
                          {/* <div className="mt-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${stageLabel.badgeClass}`}>
                              {stageLabel.label}
                            </span>
                          </div> */}

                          {/* Submitted File Section - Show only if submitted */}
                          {/* {!isNotSubmitted && hasSubmittedFile && (
                            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="min-w-0">
                                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Submitted File</div>
                                <div className="truncate text-xs text-slate-700">
                                  {item.fileName || 'View submitted attachment'}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAssignmentView(item)}
                                className="flex shrink-0 items-center justify-center rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                              >
                                View Submitted
                              </button>
                            </div>
                          )} */}

                          {/* Feedback Section - Show only if feedback exists and not approved */}
                          {/* {item.feedback && (
                            <div className={`mt-3 rounded-lg border p-2.5 ${
                              isFeedbackReceived 
                                ? 'border-red-200 bg-red-50' 
                                : 'border-emerald-200 bg-emerald-50'
                            }`}>
                              <div className={`text-[10px] font-semibold ${
                                isFeedbackReceived 
                                  ? 'text-red-700' 
                                  : 'text-emerald-700'
                              }`}>
                                {isFeedbackReceived ? '❌ Feedback' : '✓ Feedback'}
                              </div>
                              <div className={`mt-1 text-xs ${
                                isFeedbackReceived 
                                  ? 'text-red-600' 
                                  : 'text-emerald-600'
                              }`}>
                                {item.feedback}
                              </div>
                            </div>
                          )} */}

                          {/* Action Buttons - Conditional based on stage */}
                          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                            {/* Not Submitted: Show View Details + Submit Assignment */}
                            {isNotSubmitted && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentView(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAssignmentSubmitModal(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#800080] bg-[#902190] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#7a1c7a]"
                                >
                                  Submit Assignment
                                </button>
                              </>
                            )}

                            {/* Under Review: Show View Submitted + Resubmit */}
                            {isUnderReview && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentView(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                                >
                                  View Submitted
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAssignmentSubmitModal(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#800080] bg-[#902190] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#7a1c7a]"
                                >
                                  Resubmit
                                </button>
                              </>
                            )}

                            {/* Feedback Received (Not Approved): Show View Submitted + View Feedback + Resubmit */}
                            {isFeedbackReceived && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentView(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                                >
                                  View Submitted
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openSubmissionViewModal(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-red-600 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                                >
                                  View Feedback
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAssignmentSubmitModal(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-red-600 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                                >
                                  Resubmit
                                </button>
                              </>
                            )}

                            {/* Approved: Show View Submitted + View Feedback (NO Submit, NO Resubmit - Locked) */}
                            {isApproved && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAssignmentView(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                                >
                                  View Submitted
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openSubmissionViewModal(item)}
                                  className="flex items-center justify-center rounded-[46px] border border-emerald-600 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
                                >
                                  View Feedback
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500">No assignments available</div>
                  )}
                </div>
              )}
            </div>

            {/* LMS Test Series Section */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'tests' ? null : 'tests')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">⚡ Tests ({testSeries.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'tests' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'tests' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {testSeries.length > 0 ? (
                    testSeries.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No tests available</div>
                  )}
                </div>
              )}
            </div>

          </div>
          
          </div>
        </aside>
      </div>

      <Modal
        open={assignmentSubmitOpen}
        title={selectedAssignment ? `Submit Assignment: ${selectedAssignment.title}` : 'Submit Assignment'}
        onClose={assignmentSubmitting ? () => undefined : closeAssignmentSubmitModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={closeAssignmentSubmitModal}
              disabled={assignmentSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-[#8c008c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740074] disabled:cursor-not-allowed disabled:bg-[#b06ab0]"
              onClick={() => void handleAssignmentSubmit()}
              disabled={assignmentSubmitting}
            >
              {assignmentSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{selectedAssignment?.title || 'Assignment'}</p>
            {selectedAssignment?.description ? (
              <p className="mt-1 text-sm text-slate-600">{selectedAssignment.description}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Submission URL</span>
              <input
                type="url"
                value={assignmentSubmissionUrl}
                onChange={(event) => setAssignmentSubmissionUrl(event.target.value)}
                placeholder="Paste a link if your submission is hosted online"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8c008c]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Upload File</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mov"
                onChange={(event) => setAssignmentSubmissionFile(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-[#f3e6f3] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#8c008c] focus:border-[#8c008c]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">Submission Notes</span>
            <textarea
              value={assignmentSubmissionText}
              onChange={(event) => setAssignmentSubmissionText(event.target.value)}
              rows={5}
              placeholder="Write your answer or notes here"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8c008c]"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={viewSubmissionOpen}
        title={selectedSubmission ? `Submission Details: ${selectedSubmission.title}` : 'Submission Details'}
        onClose={closeSubmissionViewModal}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-md bg-[#8c008c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740074]"
              onClick={closeSubmissionViewModal}
            >
              Close
            </button>
          </div>
        }
      >
        {selectedSubmission ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">{selectedSubmission.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSubmission.description || 'No description available'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {getAssignmentStatusMeta(selectedSubmission.status).label}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submitted At</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatSubmittedAt(selectedSubmission.submittedAt)}
                </p>
              </div>
            </div>

            {selectedSubmission.dueDate ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDueDate(selectedSubmission.dueDate) || selectedSubmission.dueDate}
                </p>
              </div>
            ) : null}

            {getSubmissionFileUrl(selectedSubmission) ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submitted File</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {selectedSubmission.fileName || 'Open submitted attachment'}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleAssignmentView(selectedSubmission)}
                    className="rounded-[46px] border border-[#8c008c] bg-[rgba(161,5,161,0.07)] px-3.5 py-2 text-xs font-medium text-[#8c008c] transition-colors hover:bg-[rgba(161,5,161,0.12)]"
                  >
                    Open File
                  </button>
                </div>
              </div>
            ) : null}

            {selectedSubmission.feedback ? (
              <div className={`rounded-lg p-4 ${['rejected', 'resubmission_required'].includes((selectedSubmission.status || '').toLowerCase()) ? 'border border-red-200 bg-red-50' : 'border border-emerald-200 bg-emerald-50'}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wide ${['rejected', 'resubmission_required'].includes((selectedSubmission.status || '').toLowerCase()) ? 'text-red-700' : 'text-emerald-700'}`}>
                  Feedback
                </p>
                <p className={`mt-2 text-sm ${['rejected', 'resubmission_required'].includes((selectedSubmission.status || '').toLowerCase()) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {selectedSubmission.feedback}
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {selectedSubmission.marksObtained !== undefined && selectedSubmission.marksObtained !== null ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Marks Obtained</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedSubmission.marksObtained}
                    {selectedSubmission.maxMarks !== undefined && selectedSubmission.maxMarks !== null ? ` / ${selectedSubmission.maxMarks}` : ''}
                  </p>
                </div>
              ) : null}

              {selectedSubmission.submissionUrl ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Submission URL</p>
                  <p className="mt-1 break-all text-sm text-slate-900">{selectedSubmission.submissionUrl}</p>
                </div>
              ) : null}

              {selectedSubmission.maxMarks !== undefined && selectedSubmission.maxMarks !== null ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Marks</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedSubmission.maxMarks} Marks</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CoursePlayerPage;