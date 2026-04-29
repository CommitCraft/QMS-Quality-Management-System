import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../config/database';
import { Course, CourseEnrollment, CourseProgress } from '../../models';

export type LmsStatus = 'Draft' | 'Active' | 'Inactive' | 'Published' | 'Closed' | 'Expired' | 'Under Review' | 'Checked' | 'Rejected' | 'Resubmission Required' | 'submitted' | 'under_review' | 'checked' | 'rejected' | 'resubmission_required' | 'Not Submitted' | 'Not Started' | 'In Progress' | 'Completed' | 'Opened';

class CourseContentModel extends Model<InferAttributes<CourseContentModel>, InferCreationAttributes<CourseContentModel>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare title: string;
  declare description: string | null;
  declare contentSourceType: 'file' | 'url';
  declare contentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  declare fileUrl: string | null;
  declare externalUrl: string | null;
  declare fileName: string | null;
  declare fileSize: number | null;
  declare mimeType: string | null;
  declare displayOrder: number;
  declare isRequired: boolean;
  declare status: 'Draft' | 'Active' | 'Inactive';
  declare course?: typeof Course;
}

class AssignmentModel extends Model<InferAttributes<AssignmentModel>, InferCreationAttributes<AssignmentModel>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare title: string;
  declare description: string | null;
  declare dueDate: Date | null;
  declare maxMarks: number;
  declare passingMarks: number;
  declare attachmentSourceType: 'file' | 'url';
  declare attachmentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  declare attachmentUrl: string | null;
  declare attachmentFileName: string | null;
  declare attachmentFileSize: number | null;
  declare attachmentMimeType: string | null;
  declare status: 'Draft' | 'Published' | 'Closed';
}

class AssignmentSubmissionModel extends Model<InferAttributes<AssignmentSubmissionModel>, InferCreationAttributes<AssignmentSubmissionModel>> {
  declare id: CreationOptional<number>;
  declare assignmentId: number;
  declare employeeId: number;
  declare submissionType: 'file' | 'text' | 'url';
  declare submissionText: string | null;
  declare submissionUrl: string | null;
  declare uploadedFileUrl: string | null;
  declare fileName: string | null;
  declare fileSize: number | null;
  declare mimeType: string | null;
  declare submittedAt: Date;
  declare status: 'submitted' | 'under_review' | 'checked' | 'rejected' | 'resubmission_required';
  declare marksObtained: number | null;
  declare feedback: string | null;
  declare checkedBy: number | null;
  declare checkedAt: Date | null;
}

class TestSeriesModel extends Model<InferAttributes<TestSeriesModel>, InferCreationAttributes<TestSeriesModel>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare title: string;
  declare description: string | null;
  declare totalQuestions: number;
  declare totalMarks: number;
  declare passingMarks: number;
  declare durationMinutes: number;
  declare startDate: Date | null;
  declare endDate: Date | null;
  declare status: 'Draft' | 'Active' | 'Expired';
}

class TestQuestionModel extends Model<InferAttributes<TestQuestionModel>, InferCreationAttributes<TestQuestionModel>> {
  declare id: CreationOptional<number>;
  declare testSeriesId: number;
  declare questionText: string;
  declare questionType: 'mcq' | 'true_false' | 'short_answer';
  declare optionA: string | null;
  declare optionB: string | null;
  declare optionC: string | null;
  declare optionD: string | null;
  declare correctAnswer: string | null;
  declare marks: number;
}

class CourseContentProgressModel extends Model<InferAttributes<CourseContentProgressModel>, InferCreationAttributes<CourseContentProgressModel>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare contentId: number;
  declare employeeId: number;
  declare status: 'opened' | 'completed' | 'not_started';
  declare openedAt: Date | null;
  declare completedAt: Date | null;
}

CourseContentModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    contentSourceType: { type: DataTypes.ENUM('file', 'url'), allowNull: false, field: 'content_source_type' },
    contentType: { type: DataTypes.ENUM('video', 'pdf', 'doc', 'image', 'link', 'ppt', 'other'), allowNull: false, field: 'content_type' },
    fileUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'file_url' },
    externalUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'external_url' },
    fileName: { type: DataTypes.STRING(255), allowNull: true, field: 'file_name' },
    fileSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'file_size' },
    mimeType: { type: DataTypes.STRING(120), allowNull: true, field: 'mime_type' },
    displayOrder: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'display_order' },
    isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_required' },
    status: { type: DataTypes.ENUM('Draft', 'Active', 'Inactive'), allowNull: false, defaultValue: 'Draft' },
  },
  { sequelize, tableName: 'course_contents', paranoid: true, underscored: true },
);

AssignmentModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    dueDate: { type: DataTypes.DATE, allowNull: true, field: 'due_date' },
    maxMarks: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 100, field: 'max_marks' },
    passingMarks: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 40, field: 'passing_marks' },
    attachmentSourceType: { type: DataTypes.ENUM('file', 'url'), allowNull: false, defaultValue: 'file', field: 'attachment_source_type' },
    attachmentType: { type: DataTypes.ENUM('video', 'pdf', 'doc', 'image', 'link', 'ppt', 'other'), allowNull: false, defaultValue: 'other', field: 'attachment_type' },
    attachmentUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'attachment_url' },
    attachmentFileName: { type: DataTypes.STRING(255), allowNull: true, field: 'attachment_file_name' },
    attachmentFileSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'attachment_file_size' },
    attachmentMimeType: { type: DataTypes.STRING(120), allowNull: true, field: 'attachment_mime_type' },
    status: { type: DataTypes.ENUM('Draft', 'Published', 'Closed'), allowNull: false, defaultValue: 'Draft' },
  },
  { sequelize, tableName: 'assignments', paranoid: true, underscored: true },
);

AssignmentSubmissionModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    assignmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'assignment_id' },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'employee_id' },
    submissionType: { type: DataTypes.ENUM('file', 'text', 'url'), allowNull: false, field: 'submission_type' },
    submissionText: { type: DataTypes.TEXT, allowNull: true, field: 'submission_text' },
    submissionUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'submission_url' },
    uploadedFileUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'uploaded_file_url' },
    fileName: { type: DataTypes.STRING(255), allowNull: true, field: 'file_name' },
    fileSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'file_size' },
    mimeType: { type: DataTypes.STRING(120), allowNull: true, field: 'mime_type' },
    submittedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'submitted_at' },
    status: { type: DataTypes.ENUM('submitted', 'under_review', 'checked', 'rejected', 'resubmission_required'), allowNull: false, defaultValue: 'submitted' },
    marksObtained: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'marks_obtained' },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    checkedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'checked_by' },
    checkedAt: { type: DataTypes.DATE, allowNull: true, field: 'checked_at' },
  },
  { sequelize, tableName: 'assignment_submissions', underscored: true },
);

TestSeriesModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    totalQuestions: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'total_questions' },
    totalMarks: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'total_marks' },
    passingMarks: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'passing_marks' },
    durationMinutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'duration_minutes' },
    startDate: { type: DataTypes.DATE, allowNull: true, field: 'start_date' },
    endDate: { type: DataTypes.DATE, allowNull: true, field: 'end_date' },
    status: { type: DataTypes.ENUM('Draft', 'Active', 'Expired'), allowNull: false, defaultValue: 'Draft' },
  },
  { sequelize, tableName: 'test_series', paranoid: true, underscored: true },
);

TestQuestionModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    testSeriesId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'test_series_id' },
    questionText: { type: DataTypes.TEXT, allowNull: false, field: 'question_text' },
    questionType: { type: DataTypes.ENUM('mcq', 'true_false', 'short_answer'), allowNull: false, field: 'question_type' },
    optionA: { type: DataTypes.TEXT, allowNull: true, field: 'option_a' },
    optionB: { type: DataTypes.TEXT, allowNull: true, field: 'option_b' },
    optionC: { type: DataTypes.TEXT, allowNull: true, field: 'option_c' },
    optionD: { type: DataTypes.TEXT, allowNull: true, field: 'option_d' },
    correctAnswer: { type: DataTypes.TEXT, allowNull: true, field: 'correct_answer' },
    marks: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
  },
  { sequelize, tableName: 'test_questions', underscored: true },
);

CourseContentProgressModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    contentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'content_id' },
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'employee_id' },
    status: { type: DataTypes.ENUM('not_started', 'opened', 'completed'), allowNull: false, defaultValue: 'not_started' },
    openedAt: { type: DataTypes.DATE, allowNull: true, field: 'opened_at' },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
  },
  { sequelize, tableName: 'course_content_progress', underscored: true },
);

Course.hasMany(CourseContentModel, { foreignKey: 'courseId', as: 'contents' });
CourseContentModel.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Course.hasMany(AssignmentModel, { foreignKey: 'courseId', as: 'assignments' });
AssignmentModel.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Course.hasMany(TestSeriesModel, { foreignKey: 'courseId', as: 'testSeries' });
TestSeriesModel.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
TestSeriesModel.hasMany(TestQuestionModel, { foreignKey: 'testSeriesId', as: 'questions' });
TestQuestionModel.belongsTo(TestSeriesModel, { foreignKey: 'testSeriesId', as: 'testSeries' });
AssignmentModel.hasMany(AssignmentSubmissionModel, { foreignKey: 'assignmentId', as: 'submissions' });
AssignmentSubmissionModel.belongsTo(AssignmentModel, { foreignKey: 'assignmentId', as: 'assignment' });
CourseContentProgressModel.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
CourseContentProgressModel.belongsTo(CourseContentModel, { foreignKey: 'contentId', as: 'content' });

export {
  CourseContentModel as CourseContent,
  AssignmentModel as Assignment,
  AssignmentSubmissionModel as AssignmentSubmission,
  TestSeriesModel as TestSeries,
  TestQuestionModel as TestQuestion,
  CourseContentProgressModel as CourseContentProgress,
};
