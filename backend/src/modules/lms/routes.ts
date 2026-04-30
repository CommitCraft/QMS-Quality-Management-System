import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';
import { asyncHandler, parsePagination } from '../../common/utils';
import { AppError, authenticate, requirePermission, validateRequest, AuthenticatedRequest } from '../../common/middleware';
import { Course, CourseEnrollment, CourseProgress, User } from '../../models';
import { Assignment, AssignmentSubmission, CourseContent, CourseContentProgress, TestQuestion, TestSeries } from './models';
import { assignmentAttachmentUpload, assignmentSubmissionUpload, courseContentUpload, detectContentType, toPublicUploadUrl } from './fileUpload';
import { getCourseDetail, getCourseSummary, getEmployeeAssignmentStatus, listAssignments, listCourseContent, listTestSeries } from './service';

const toBool = (value: unknown) => value === true || value === 'true' || value === '1';
const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeEnum = (value: unknown, allowed: string[], fallback: string) => {
  const s = typeof value === 'string' ? value.trim() : '';
  return allowed.includes(s) ? s : fallback;
};

const buildSearchWhere = (search?: string, status?: string) => ({
  ...(search
    ? {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
        ],
      }
    : {}),
  ...(status ? { status } : {}),
});

const mapCourse = async (course: any) => {
  const enrollments = await CourseEnrollment.findAll({ where: { courseId: course.id } });
  const completed = enrollments.filter((enrollment) => enrollment.status === 'Completed').length;
  const contentCount = await CourseContent.count({ where: { courseId: course.id } });
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    autoAssignNewEmployee: course.autoAssignToNewEmployee,
    status: course.status,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    completionPercentage: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
    assignedEmployeeCount: enrollments.length,
    contentCount,
  };
};

const parseAttachmentPayload = (payload: Record<string, unknown>, file?: Express.Multer.File | undefined) => {
  const sourceType = String(payload.attachmentSourceType || (file ? 'file' : 'url')) as 'file' | 'url';
  const attachmentUrl = String(payload.attachmentUrl || payload.attachment_url || '').trim() || null;
  return {
    attachmentSourceType: sourceType,
    attachmentType: String(payload.attachmentType || payload.attachment_type || detectContentType(attachmentUrl || file?.mimetype || file?.originalname, file?.mimetype)) as 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other',
    attachmentUrl: file ? toPublicUploadUrl(file.path) : attachmentUrl,
    attachmentFileName: file ? file.filename : String(payload.attachmentFileName || payload.attachment_file_name || '').trim() || null,
    attachmentFileSize: file ? file.size : toNumber(payload.attachmentFileSize || payload.attachment_file_size, 0) || null,
    attachmentMimeType: file ? file.mimetype : String(payload.attachmentMimeType || payload.attachment_mime_type || '').trim() || null,
  };
};

export const coursesRouter = Router();
export const courseContentRouter = Router();
export const assignmentsRouter = Router();
export const assignmentSubmissionsRouter = Router();
export const testSeriesRouter = Router();

coursesRouter.use(authenticate);
courseContentRouter.use(authenticate);
assignmentsRouter.use(authenticate);
assignmentSubmissionsRouter.use(authenticate);
testSeriesRouter.use(authenticate);

coursesRouter.get(
  '/',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page, limit, offset, search, status } = parsePagination(req.query as { page?: string; limit?: string; search?: string; status?: string });
    const courses = await Course.findAll({ where: buildSearchWhere(search, status), order: [['updatedAt', 'DESC']], limit, offset });
    const data = await Promise.all(courses.map(mapCourse));
    res.json({ success: true, data, meta: { page, limit, total: data.length, totalPages: Math.max(1, Math.ceil(data.length / limit)) } });
  }),
);

coursesRouter.get(
  '/summary',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, data: await getCourseSummary() });
  }),
);

coursesRouter.get(
  '/:id',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await getCourseDetail(Number(req.params.id));
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    const mapped = await mapCourse(course);
    const courseWithRelations = course as any;
    res.json({ success: true, data: { ...mapped, contents: courseWithRelations.contents || [], assignments: courseWithRelations.assignments || [], testSeries: courseWithRelations.testSeries || [] } });
  }),
);

coursesRouter.post(
  '/',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('title').trim().notEmpty(), body('status').optional().isIn(['Draft', 'Active', 'Inactive'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = req.body as Record<string, unknown>;
    const course = await Course.create({
      title: String(payload.title).trim(),
      description: payload.description ? String(payload.description) : null,
      category: payload.category ? String(payload.category) : null,
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Inactive'], 'Draft'),
      autoAssignToNewEmployee: toBool(payload.autoAssignNewEmployee ?? payload.autoAssignToNewEmployee),
    } as never);
    res.status(201).json({ success: true, data: course });
  }),
);

coursesRouter.put(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await Course.findByPk(Number(req.params.id));
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    const payload = req.body as Record<string, unknown>;
    await course.update({
      title: payload.title ? String(payload.title).trim() : course.title,
      description: payload.description !== undefined ? String(payload.description || '') : course.description,
      category: payload.category !== undefined ? String(payload.category || '') : course.category,
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Inactive'], course.status),
      autoAssignToNewEmployee: payload.autoAssignNewEmployee !== undefined ? toBool(payload.autoAssignNewEmployee) : course.autoAssignToNewEmployee,
    } as never);
    res.json({ success: true, data: course });
  }),
);

coursesRouter.delete(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await Course.findByPk(Number(req.params.id));
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    await course.destroy();
    res.json({ success: true, message: 'Course deleted' });
  }),
);

coursesRouter.patch(
  '/:id/status',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('status').isIn(['Draft', 'Active', 'Inactive'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await Course.findByPk(Number(req.params.id));
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    course.status = req.body.status;
    await course.save();
    res.json({ success: true, data: course });
  }),
);

coursesRouter.post(
  '/:id/duplicate',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const course = await Course.findByPk(Number(req.params.id), { include: [{ model: CourseContent, as: 'contents' }] });
    if (!course) {
      throw new AppError('Course not found', 404);
    }
    const duplicated = await Course.create({
      title: `${course.title} Copy`,
      description: course.description,
      category: course.category,
      status: 'Draft',
      autoAssignToNewEmployee: course.autoAssignToNewEmployee,
    } as never);
    const contents = ((course as any).contents || []) as Array<any>;
    for (const content of contents) {
      await CourseContent.create({
        courseId: duplicated.id,
        title: content.title,
        description: content.description,
        contentSourceType: content.contentSourceType,
        contentType: content.contentType,
        fileUrl: content.fileUrl,
        externalUrl: content.externalUrl,
        fileName: content.fileName,
        fileSize: content.fileSize,
        mimeType: content.mimeType,
        displayOrder: content.displayOrder,
        isRequired: content.isRequired,
        status: content.status,
      } as never);
    }
    res.status(201).json({ success: true, data: duplicated });
  }),
);

courseContentRouter.get(
  '/courses/:courseId/content',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const items = await listCourseContent(Number(req.params.courseId));
    res.json({ success: true, data: items });
  }),
);

courseContentRouter.post(
  '/courses/:courseId/content',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  courseContentUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = Number(req.params.courseId);
    const payload = req.body as Record<string, unknown>;
    const existingMax = await CourseContent.max('displayOrder', { where: { courseId } });
    const file = req.file;
    const sourceType = String(payload.contentSourceType || (file ? 'file' : 'url')) as 'file' | 'url';
    const externalUrl = payload.externalUrl ? String(payload.externalUrl).trim() : null;
    const fileUrl = file ? toPublicUploadUrl(file.path) : payload.fileUrl ? String(payload.fileUrl).trim() : null;
    const contentType = (payload.contentType ? String(payload.contentType) : detectContentType(file?.mimetype || file?.originalname || externalUrl, file?.mimetype)) as any;

    const item = await CourseContent.create({
      courseId,
      title: String(payload.title || '').trim(),
      description: payload.description ? String(payload.description) : null,
      contentSourceType: sourceType,
      contentType,
      fileUrl,
      externalUrl,
      fileName: file ? file.filename : payload.fileName ? String(payload.fileName) : null,
      fileSize: file ? file.size : toNumber(payload.fileSize, 0) || null,
      mimeType: file ? file.mimetype : payload.mimeType ? String(payload.mimeType) : null,
      displayOrder: payload.displayOrder ? toNumber(payload.displayOrder, 0) : Number(existingMax || 0) + 1,
      isRequired: toBool(payload.isRequired),
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Inactive'], 'Draft'),
    } as never);
    res.status(201).json({ success: true, data: item });
  }),
);

courseContentRouter.put(
  '/course-content/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  courseContentUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await CourseContent.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Course content not found', 404);
    }
    const payload = req.body as Record<string, unknown>;
    const file = req.file;
    await item.update({
      title: payload.title ? String(payload.title).trim() : item.title,
      description: payload.description !== undefined ? String(payload.description || '') : item.description,
      contentSourceType: (payload.contentSourceType as 'file' | 'url') || item.contentSourceType,
      contentType: (payload.contentType as any) || item.contentType,
      fileUrl: file ? toPublicUploadUrl(file.path) : payload.fileUrl ? String(payload.fileUrl) : item.fileUrl,
      externalUrl: payload.externalUrl !== undefined ? String(payload.externalUrl || '') : item.externalUrl,
      fileName: file ? file.filename : payload.fileName !== undefined ? String(payload.fileName || '') : item.fileName,
      fileSize: file ? file.size : payload.fileSize !== undefined ? toNumber(payload.fileSize, item.fileSize || 0) : item.fileSize,
      mimeType: file ? file.mimetype : payload.mimeType !== undefined ? String(payload.mimeType || '') : item.mimeType,
      displayOrder: payload.displayOrder !== undefined ? toNumber(payload.displayOrder, item.displayOrder) : item.displayOrder,
      isRequired: payload.isRequired !== undefined ? toBool(payload.isRequired) : item.isRequired,
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Inactive'], item.status),
    } as never);
    res.json({ success: true, data: item });
  }),
);

courseContentRouter.delete(
  '/course-content/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await CourseContent.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Course content not found', 404);
    }
    await item.destroy();
    res.json({ success: true, message: 'Course content deleted' });
  }),
);

courseContentRouter.patch(
  '/course-content/:id/status',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('status').isIn(['Draft', 'Active', 'Inactive'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await CourseContent.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Course content not found', 404);
    }
    item.status = req.body.status;
    await item.save();
    res.json({ success: true, data: item });
  }),
);

courseContentRouter.patch(
  '/course-content/reorder',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('items').isArray({ min: 1 })],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const items = req.body.items as Array<{ id: number; displayOrder: number }>;
    for (const item of items) {
      await CourseContent.update({ displayOrder: item.displayOrder } as never, { where: { id: item.id } });
    }
    res.json({ success: true, message: 'Content reordered' });
  }),
);

courseContentRouter.post(
  '/course-content/upload',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  courseContentUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }
    res.status(201).json({
      success: true,
      data: {
        fileUrl: toPublicUploadUrl(req.file.path),
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  }),
);

assignmentsRouter.get(
  '/',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const search = String(req.query.search || '').trim();
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    let items = await listAssignments(search || undefined);
    if (courseId) {
      items = items.filter((item: any) => item.courseId === courseId);
    }
    const data = await Promise.all(items.map(async (assignment: any) => {
      const submitted = assignment.submissions?.filter((submission: any) => submission.status !== 'rejected').length || 0;
      const checked = assignment.submissions?.filter((submission: any) => submission.status === 'checked').length || 0;
      const employeeCount = await AssignmentSubmission.count({ where: { assignmentId: assignment.id } });
      return { ...assignment.toJSON(), submittedCount: submitted, checkedCount: checked, pendingCount: Math.max(0, employeeCount - submitted), assignedEmployeeCount: employeeCount };
    }));
    res.json({ success: true, data });
  }),
);

assignmentsRouter.get(
  '/:id',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await Assignment.findByPk(Number(req.params.id), { include: [{ model: Course, as: 'course' }, { model: AssignmentSubmission, as: 'submissions' }] });
    if (!item) {
      throw new AppError('Assignment not found', 404);
    }
    res.json({ success: true, data: item });
  }),
);

assignmentsRouter.post(
  '/',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = req.body as Record<string, unknown>;
    const attachment = parseAttachmentPayload(payload);
    const item = await Assignment.create({
      courseId: Number(payload.courseId),
      title: String(payload.title).trim(),
      description: payload.description ? String(payload.description) : null,
      dueDate: payload.dueDate ? new Date(String(payload.dueDate)) : null,
      maxMarks: toNumber(payload.maxMarks, 100),
      passingMarks: toNumber(payload.passingMarks, 40),
      attachmentSourceType: (payload.attachmentSourceType as any) || attachment.attachmentSourceType,
      attachmentType: attachment.attachmentType,
      attachmentUrl: attachment.attachmentUrl,
      attachmentFileName: attachment.attachmentFileName,
      attachmentFileSize: attachment.attachmentFileSize,
      attachmentMimeType: attachment.attachmentMimeType,
      status: normalizeEnum(payload.status, ['Draft', 'Published', 'Closed'], 'Draft'),
    } as never);
    res.status(201).json({ success: true, data: item });
  }),
);

assignmentsRouter.put(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  assignmentAttachmentUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await Assignment.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Assignment not found', 404);
    }
    const payload = req.body as Record<string, unknown>;
    const attachment = parseAttachmentPayload(payload, req.file);
    await item.update({
      courseId: payload.courseId ? Number(payload.courseId) : item.courseId,
      title: payload.title ? String(payload.title).trim() : item.title,
      description: payload.description !== undefined ? String(payload.description || '') : item.description,
      dueDate: payload.dueDate ? new Date(String(payload.dueDate)) : item.dueDate,
      maxMarks: payload.maxMarks ? toNumber(payload.maxMarks, item.maxMarks) : item.maxMarks,
      passingMarks: payload.passingMarks ? toNumber(payload.passingMarks, item.passingMarks) : item.passingMarks,
      attachmentSourceType: (payload.attachmentSourceType as any) || item.attachmentSourceType,
      attachmentType: attachment.attachmentType || item.attachmentType,
      attachmentUrl: attachment.attachmentUrl || item.attachmentUrl,
      attachmentFileName: attachment.attachmentFileName || item.attachmentFileName,
      attachmentFileSize: attachment.attachmentFileSize || item.attachmentFileSize,
      attachmentMimeType: attachment.attachmentMimeType || item.attachmentMimeType,
      status: normalizeEnum(payload.status, ['Draft', 'Published', 'Closed'], item.status),
    } as never);
    res.json({ success: true, data: item });
  }),
);

assignmentsRouter.delete(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await Assignment.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Assignment not found', 404);
    }
    await item.destroy();
    res.json({ success: true, message: 'Assignment deleted' });
  }),
);

assignmentsRouter.patch(
  '/:id/status',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('status').isIn(['Draft', 'Published', 'Closed'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await Assignment.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Assignment not found', 404);
    }
    item.status = req.body.status;
    await item.save();
    res.json({ success: true, data: item });
  }),
);

assignmentsRouter.post(
  '/:id/upload-attachment',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  assignmentAttachmentUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }
    const item = await Assignment.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Assignment not found', 404);
    }
    await item.update({ attachmentSourceType: 'file', attachmentUrl: toPublicUploadUrl(req.file.path), attachmentFileName: req.file.filename, attachmentFileSize: req.file.size, attachmentMimeType: req.file.mimetype } as never);
    res.json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.get(
  '/',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    let where = {};
    if (courseId) {
      const assignmentIds = await Assignment.findAll({ where: { courseId }, attributes: ['id'] }).then((assignments: any[]) => assignments.map((a) => a.id));
      where = { assignmentId: { [Op.in]: assignmentIds } };
    }
    const data = await AssignmentSubmission.findAll({ where, include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }] });
    res.json({ success: true, data });
  }),
);

assignmentSubmissionsRouter.get(
  '/assignments/:assignmentId/submissions',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await AssignmentSubmission.findAll({ where: { assignmentId: Number(req.params.assignmentId) }, include: [{ model: Assignment, as: 'assignment' }] });
    res.json({ success: true, data });
  }),
);

assignmentSubmissionsRouter.get(
  '/:id',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await AssignmentSubmission.findByPk(Number(req.params.id), { include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }] });
    if (!item) {
      throw new AppError('Submission not found', 404);
    }
    res.json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.post(
  '/assignments/:assignmentId/submit',
  requirePermission('VIEW_MY_COURSES'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = Number(req.params.assignmentId);
    const employeeId = req.user?.id;
    if (!employeeId) {
      throw new AppError('Unauthorized', 401);
    }
    const payload = req.body as Record<string, unknown>;
    const item = await AssignmentSubmission.create({
      assignmentId,
      employeeId,
      submissionType: (payload.submissionType as any) || 'text',
      submissionText: payload.submissionText ? String(payload.submissionText) : null,
      submissionUrl: payload.submissionUrl ? String(payload.submissionUrl) : null,
      uploadedFileUrl: payload.uploadedFileUrl ? String(payload.uploadedFileUrl) : null,
      fileName: payload.fileName ? String(payload.fileName) : null,
      fileSize: payload.fileSize ? toNumber(payload.fileSize) : null,
      mimeType: payload.mimeType ? String(payload.mimeType) : null,
      status: 'submitted',
      submittedAt: new Date(),
    } as never);
    res.status(201).json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.post(
  '/assignments/:assignmentId/submit-file',
  requirePermission('VIEW_MY_COURSES'),
  assignmentSubmissionUpload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const employeeId = req.user?.id;
    if (!employeeId) {
      throw new AppError('Unauthorized', 401);
    }
    if (!req.file) {
      throw new AppError('File is required', 400);
    }
    const item = await AssignmentSubmission.create({
      assignmentId: Number(req.params.assignmentId),
      employeeId,
      submissionType: 'file',
      uploadedFileUrl: toPublicUploadUrl(req.file.path),
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'submitted',
      submittedAt: new Date(),
    } as never);
    res.status(201).json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.put(
  '/:id/check',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await AssignmentSubmission.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Submission not found', 404);
    }
    await item.update({
      marksObtained: req.body.marksObtained !== undefined ? toNumber(req.body.marksObtained, item.marksObtained || 0) : item.marksObtained,
      feedback: req.body.feedback !== undefined ? String(req.body.feedback || '') : item.feedback,
      checkedBy: req.user?.id ?? item.checkedBy,
      checkedAt: new Date(),
      status: (req.body.status as any) || 'checked',
    } as never);
    res.json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.patch(
  '/:id/status',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('status').isIn(['submitted', 'under_review', 'checked', 'rejected', 'resubmission_required'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await AssignmentSubmission.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Submission not found', 404);
    }
    item.status = req.body.status;
    await item.save();
    res.json({ success: true, data: item });
  }),
);

assignmentSubmissionsRouter.get(
  '/employees/:employeeId/assignments/status',
  requirePermission('VIEW_MY_COURSES'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const employeeId = Number(req.params.employeeId);
    const data = await getEmployeeAssignmentStatus(employeeId);
    res.json({ success: true, data });
  }),
);

assignmentsRouter.get(
  '/:assignmentId/submissions',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await AssignmentSubmission.findAll({ where: { assignmentId: Number(req.params.assignmentId) } });
    res.json({ success: true, data });
  }),
);

assignmentSubmissionsRouter.get(
  '/assignment-submissions/:id',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await AssignmentSubmission.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Submission not found', 404);
    }
    res.json({ success: true, data: item });
  }),
);

testSeriesRouter.get(
  '/',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const where = courseId ? { courseId } : {};
    res.json({ success: true, data: await listTestSeries(where) });
  }),
);

testSeriesRouter.get(
  '/:id',
  requirePermission('VIEW_TRAINING_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await TestSeries.findByPk(Number(req.params.id), { include: [{ model: TestQuestion, as: 'questions' }, { model: Course, as: 'course' }] });
    if (!item) {
      throw new AppError('Test series not found', 404);
    }
    res.json({ success: true, data: item });
  }),
);

testSeriesRouter.post(
  '/',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = req.body as Record<string, unknown>;
    const item = await TestSeries.create({
      courseId: Number(payload.courseId),
      title: String(payload.title).trim(),
      description: payload.description ? String(payload.description) : null,
      totalQuestions: toNumber(payload.totalQuestions),
      totalMarks: toNumber(payload.totalMarks),
      passingMarks: toNumber(payload.passingMarks),
      durationMinutes: toNumber(payload.durationMinutes),
      startDate: payload.startDate ? new Date(String(payload.startDate)) : null,
      endDate: payload.endDate ? new Date(String(payload.endDate)) : null,
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Expired'], 'Draft'),
    } as never);
    res.status(201).json({ success: true, data: item });
  }),
);

testSeriesRouter.put(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await TestSeries.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Test series not found', 404);
    }
    const payload = req.body as Record<string, unknown>;
    await item.update({
      courseId: payload.courseId ? Number(payload.courseId) : item.courseId,
      title: payload.title ? String(payload.title).trim() : item.title,
      description: payload.description !== undefined ? String(payload.description || '') : item.description,
      totalQuestions: payload.totalQuestions ? toNumber(payload.totalQuestions, item.totalQuestions) : item.totalQuestions,
      totalMarks: payload.totalMarks ? toNumber(payload.totalMarks, item.totalMarks) : item.totalMarks,
      passingMarks: payload.passingMarks ? toNumber(payload.passingMarks, item.passingMarks) : item.passingMarks,
      durationMinutes: payload.durationMinutes ? toNumber(payload.durationMinutes, item.durationMinutes) : item.durationMinutes,
      startDate: payload.startDate ? new Date(String(payload.startDate)) : item.startDate,
      endDate: payload.endDate ? new Date(String(payload.endDate)) : item.endDate,
      status: normalizeEnum(payload.status, ['Draft', 'Active', 'Expired'], item.status),
    } as never);
    res.json({ success: true, data: item });
  }),
);

testSeriesRouter.delete(
  '/:id',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await TestSeries.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Test series not found', 404);
    }
    await item.destroy();
    res.json({ success: true, message: 'Test series deleted' });
  }),
);

testSeriesRouter.patch(
  '/:id/status',
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  [body('status').isIn(['Draft', 'Active', 'Expired'])],
  validateRequest,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await TestSeries.findByPk(Number(req.params.id));
    if (!item) {
      throw new AppError('Test series not found', 404);
    }
    item.status = req.body.status;
    await item.save();
    res.json({ success: true, data: item });
  }),
);

export default { coursesRouter, courseContentRouter, assignmentsRouter, assignmentSubmissionsRouter, testSeriesRouter };
