import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { LmsItem, LmsFormState, LmsModalMode } from '../types';
import { assignmentService, contentService, courseService, testSeriesService } from '../services';

export const useLmsData = () => {
  const [lmsLoading, setLmsLoading] = useState(true);
  const [lmsSaving, setLmsSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [contentRows, setContentRows] = useState<LmsItem[]>([]);
  const [assignmentRows, setAssignmentRows] = useState<LmsItem[]>([]);
  const [submissionRows, setSubmissionRows] = useState<LmsItem[]>([]);
  const [testSeriesRows, setTestSeriesRows] = useState<LmsItem[]>([]);
  const [courseSummary, setCourseSummary] = useState<any | null>(null);

  const loadLmsData = useCallback(async () => {
    setLmsLoading(true);
    try {
      const results = await Promise.allSettled([
        courseService.summary(),
        assignmentService.list(),
        assignmentService.listSubmissions(),
        testSeriesService.list(),
      ]);

      const [summaryRes, assignmentsRes, submissionsRes, testsRes] = results;

      if (summaryRes.status === 'fulfilled') {
        setCourseSummary(summaryRes.value?.data || null);
      } else {
        // Log the error for debugging
        // eslint-disable-next-line no-console
        console.error('courseSummary failed', summaryRes.reason);
      }

      if (assignmentsRes.status === 'fulfilled') {
        setAssignmentRows((assignmentsRes.value || []) as LmsItem[]);
      } else {
        // eslint-disable-next-line no-console
        console.error('listAssignments failed', assignmentsRes.reason);
      }

      if (submissionsRes.status === 'fulfilled') {
        setSubmissionRows((submissionsRes.value || []) as LmsItem[]);
      } else {
        // eslint-disable-next-line no-console
        console.error('listSubmissions failed', submissionsRes.reason);
      }

      if (testsRes.status === 'fulfilled') {
        setTestSeriesRows((testsRes.value || []) as LmsItem[]);
      } else {
        // eslint-disable-next-line no-console
        console.error('listTestSeries failed', testsRes.reason);
      }

      const panelNames = ['summary', 'assignments', 'submissions', 'testSeries'];
      const failedPanels = results
        .map((r, i) => ({ r, name: panelNames[i] }))
        .filter(({ r }) => r.status === 'rejected')
        .map(({ name }) => name);

      if (failedPanels.length === panelNames.length) {
        toast.error('Unable to load LMS panels');
      } else if (failedPanels.length > 0) {
        toast.error(`Unable to load: ${failedPanels.join(', ')}`);
      }
    } catch (err) {
      // unexpected error
      // eslint-disable-next-line no-console
      console.error('loadLmsData error', err);
      toast.error('Unable to load LMS panels');
    } finally {
      setLmsLoading(false);
    }
  }, []);

  const loadContent = useCallback(
    async (courseId: number | null) => {
      if (!courseId) {
        setContentRows([]);
        return;
      }

      try {
        const response = await contentService.list(courseId);
        setContentRows((response || []) as LmsItem[]);
      } catch {
        toast.error('Unable to load course content');
        setContentRows([]);
      }
    },
    []
  );

  const saveLmsContent = useCallback(
    async (form: LmsFormState, editing: LmsItem | null) => {
      const payload = {
        courseId: form.courseId,
        module: form.module.trim() || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        contentSourceType: form.contentSourceType,
        contentType: form.contentType,
        fileUrl: form.fileUrl.trim() || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        fileName: form.fileName.trim() || undefined,
        displayOrder: Number(form.displayOrder || 1),
        isRequired: form.isRequired,
        status: form.status,
      };

      if (form.contentFile) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        formData.append('file', form.contentFile);

        if (editing) {
          await contentService.updateWithFile(editing.id, formData);
          toast.success('Content updated');
        } else {
          await contentService.createWithFile(form.courseId, formData);
          toast.success('Content created');
        }
      } else if (editing) {
        await contentService.update(editing.id, payload);
        toast.success('Content updated');
      } else {
        await contentService.create(form.courseId, payload);
        toast.success('Content created');
      }

      const response = await contentService.list(form.courseId);
      setContentRows((response || []) as LmsItem[]);
    },
    []
  );

  const saveLmsAssignment = useCallback(
    async (form: LmsFormState, editing: LmsItem | null) => {
      const payload = {
        courseId: form.courseId,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || undefined,
        maxMarks: Number(form.maxMarks || 100),
        passingMarks: Number(form.passingMarks || 40),
        attachmentSourceType: form.attachmentSourceType,
        attachmentType: form.attachmentType,
        attachmentUrl: form.attachmentUrl.trim() || undefined,
        attachmentFileName: form.attachmentFileName.trim() || undefined,
        status: form.status,
      };

      let assignmentId = editing?.id || null;
      if (editing) {
        await assignmentService.update(editing.id, payload);
        toast.success('Assignment updated');
      } else {
        const created = await assignmentService.create(payload);
        assignmentId = created.data?.id || null;
        toast.success('Assignment created');
      }

      if (form.assignmentFile && assignmentId) {
        const formData = new FormData();
        formData.append('file', form.assignmentFile);
        await assignmentService.uploadAttachment(assignmentId, formData);
      }

      const response = await assignmentService.list();
      setAssignmentRows((response || []) as LmsItem[]);
    },
    []
  );

  const checkSubmission = useCallback(
    async (form: LmsFormState, editing: LmsItem | null) => {
      if (!editing) return;

      const payload = {
        status: form.submissionStatus,
        marksObtained: form.marksObtained ? Number(form.marksObtained) : undefined,
        feedback: form.feedback.trim(),
      };

      await assignmentService.checkSubmission(editing.id, payload);
      toast.success('Submission checked');
      const response = await assignmentService.listSubmissions();
      setSubmissionRows((response || []) as LmsItem[]);
    },
    []
  );

  const saveLmsTestSeries = useCallback(
    async (form: LmsFormState, editing: LmsItem | null) => {
      const payload = {
        courseId: form.courseId,
        title: form.title.trim(),
        description: form.description.trim(),
        totalQuestions: Number(form.totalQuestions || 0),
        totalMarks: Number(form.totalMarks || 0),
        passingMarks: Number(form.passingMarks || 0),
        durationMinutes: Number(form.durationMinutes || 0),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
      };

      if (editing) {
        await testSeriesService.update(editing.id, payload);
        toast.success('Test series updated');
      } else {
        await testSeriesService.create(payload);
        toast.success('Test series created');
      }

      const response = await testSeriesService.list();
      setTestSeriesRows((response || []) as LmsItem[]);
    },
    []
  );

  const deleteContent = useCallback(
    async (item: LmsItem, courseId: number | null) => {
      await contentService.remove(item.id);
      toast.success('Content deleted');
      const response = await contentService.list(courseId || item.courseId);
      setContentRows((response || []) as LmsItem[]);
    },
    []
  );

  const deleteAssignment = useCallback(
    async (item: LmsItem) => {
      await assignmentService.remove(item.id);
      toast.success('Assignment deleted');
      const response = await assignmentService.list();
      setAssignmentRows((response || []) as LmsItem[]);
    },
    []
  );

  const deleteTestSeries = useCallback(
    async (item: LmsItem) => {
      await testSeriesService.remove(item.id);
      toast.success('Test series deleted');
      const response = await testSeriesService.list();
      setTestSeriesRows((response || []) as LmsItem[]);
    },
    []
  );

  return {
    lmsLoading,
    lmsSaving,
    setLmsSaving,
    selectedCourseId,
    setSelectedCourseId,
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
  };
};
