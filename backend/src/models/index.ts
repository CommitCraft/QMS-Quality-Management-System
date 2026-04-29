import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

class RoleModel extends Model<InferAttributes<RoleModel>, InferCreationAttributes<RoleModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
  declare users?: UserModel[];
  declare permissions?: PermissionModel[];
}

class PermissionModel extends Model<InferAttributes<PermissionModel>, InferCreationAttributes<PermissionModel>> {
  declare id: CreationOptional<number>;
  declare module: string;
  declare action: string;
  declare name: string;
  declare description: string | null;
  declare roles?: RoleModel[];
}

class RolePermissionModel extends Model<InferAttributes<RolePermissionModel>, InferCreationAttributes<RolePermissionModel>> {
  declare id: CreationOptional<number>;
  declare roleId: number;
  declare permissionId: number;
}

class DepartmentModel extends Model<InferAttributes<DepartmentModel>, InferCreationAttributes<DepartmentModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare manager: string | null;
  declare description: string | null;
  declare status: string;
  declare users?: UserModel[];
}

class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare username: string;
  declare email: string;
  declare mobile: string | null;
  declare password: string;
  declare roleId: number;
  declare departmentId: number | null;
  declare status: string;
  declare refreshTokenHash: string | null;
  declare passwordResetToken: string | null;
  declare passwordResetExpiresAt: Date | null;
  declare lastLoginAt: Date | null;
  declare role?: RoleModel;
  declare department?: DepartmentModel;
}

class DocumentModel extends Model<InferAttributes<DocumentModel>, InferCreationAttributes<DocumentModel>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare folderPath: string;
  declare fileName: string;
  declare filePath: string;
  declare version: number;
  declare currentVersion: number;
  declare status: string;
  declare ownerId: number | null;
  declare expiryDate: Date | null;
  declare versions?: DocumentVersionModel[];
}

class DocumentVersionModel extends Model<InferAttributes<DocumentVersionModel>, InferCreationAttributes<DocumentVersionModel>> {
  declare id: CreationOptional<number>;
  declare documentId: number;
  declare version: number;
  declare fileName: string;
  declare filePath: string;
  declare changeNote: string | null;
  declare uploadedBy: number | null;
}

class CapaModel extends Model<InferAttributes<CapaModel>, InferCreationAttributes<CapaModel>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare issue: string;
  declare rootCause: string | null;
  declare actionPlan: string | null;
  declare ownerId: number | null;
  declare targetDate: Date | null;
  declare status: string;
}

class NcrModel extends Model<InferAttributes<NcrModel>, InferCreationAttributes<NcrModel>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare product: string;
  declare lotNo: string;
  declare issue: string;
  declare severity: string;
  declare ownerId: number | null;
  declare status: string;
}

class AuditModel extends Model<InferAttributes<AuditModel>, InferCreationAttributes<AuditModel>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare planDate: Date | null;
  declare performedDate: Date | null;
  declare score: number | null;
  declare status: string;
  declare departmentId: number | null;
  declare ownerId: number | null;
  declare findings?: AuditFindingModel[];
}

class AuditFindingModel extends Model<InferAttributes<AuditFindingModel>, InferCreationAttributes<AuditFindingModel>> {
  declare id: CreationOptional<number>;
  declare auditId: number;
  declare description: string;
  declare severity: string;
  declare correctiveAction: string | null;
  declare status: string;
}

class SmtpSettingModel extends Model<InferAttributes<SmtpSettingModel>, InferCreationAttributes<SmtpSettingModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare host: string;
  declare port: number;
  declare secure: boolean;
  declare username: string;
  declare password: string;
  declare fromEmail: string;
  declare fromName: string | null;
  declare isActive: boolean;
}

class StorageSettingModel extends Model<InferAttributes<StorageSettingModel>, InferCreationAttributes<StorageSettingModel>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare provider: string;
  declare basePath: string | null;
  declare bucketName: string | null;
  declare region: string | null;
  declare endpoint: string | null;
  declare accessKey: string | null;
  declare secretKey: string | null;
  declare isActive: boolean;
  declare isDefault: boolean;
}

class CompanyProfileModel extends Model<InferAttributes<CompanyProfileModel>, InferCreationAttributes<CompanyProfileModel>> {
  declare id: CreationOptional<number>;
  declare companyTitle: string;
  declare logoUrl: string | null;
  declare faviconUrl: string | null;
  declare bannerUrl: string | null;
  declare isActive: boolean;
  declare isDefault: boolean;
}

class ActivityLogModel extends Model<InferAttributes<ActivityLogModel>, InferCreationAttributes<ActivityLogModel>> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare entity: string;
  declare entityId: number | null;
  declare action: string;
  declare description: string;
  declare meta: string | null;
}

class CourseModel extends Model<InferAttributes<CourseModel>, InferCreationAttributes<CourseModel>> {
  declare id: CreationOptional<number>;
  declare code: string;
  declare title: string;
  declare description: string | null;
  declare duration: number; // in minutes
  declare category: string | null;
  declare instructor: string | null;
  declare status: string;
  declare autoAssignToNewEmployee: boolean;
  declare enrollments?: CourseEnrollmentModel[];
}

class CourseEnrollmentModel extends Model<InferAttributes<CourseEnrollmentModel>, InferCreationAttributes<CourseEnrollmentModel>> {
  declare id: CreationOptional<number>;
  declare courseId: number;
  declare userId: number;
  declare enrolledDate: Date;
  declare status: string;
  declare progress?: CourseProgressModel;
}

class CourseProgressModel extends Model<InferAttributes<CourseProgressModel>, InferCreationAttributes<CourseProgressModel>> {
  declare id: CreationOptional<number>;
  declare enrollmentId: number;
  declare progressPercentage: number;
  declare lastAccessedDate: Date | null;
  declare completedDate: Date | null;
}

export const initModels = (sequelizeInstance: Sequelize) => {
  RoleModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize: sequelizeInstance, tableName: 'roles' },
  );

  PermissionModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      module: { type: DataTypes.STRING(100), allowNull: false },
      action: { type: DataTypes.STRING(100), allowNull: false },
      name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize: sequelizeInstance, tableName: 'permissions' },
  );

  RolePermissionModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'role_id' },
      permissionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'permission_id' },
    },
    { sequelize: sequelizeInstance, tableName: 'role_permissions' },
  );

  DepartmentModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      manager: { type: DataTypes.STRING(150), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
    },
    { sequelize: sequelizeInstance, tableName: 'departments' },
  );

  UserModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      username: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
      mobile: { type: DataTypes.STRING(30), allowNull: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'role_id' },
      departmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'department_id' },
      status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
      refreshTokenHash: { type: DataTypes.STRING(255), allowNull: true, field: 'refresh_token_hash' },
      passwordResetToken: { type: DataTypes.STRING(255), allowNull: true, field: 'password_reset_token' },
      passwordResetExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'password_reset_expires_at' },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
    },
    { sequelize: sequelizeInstance, tableName: 'users' },
  );

  DocumentModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      folderPath: { type: DataTypes.STRING(255), allowNull: false, field: 'folder_path' },
      fileName: { type: DataTypes.STRING(255), allowNull: false, field: 'file_name' },
      filePath: { type: DataTypes.STRING(500), allowNull: false, field: 'file_path' },
      version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
      currentVersion: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1, field: 'current_version' },
      status: { type: DataTypes.ENUM('Draft', 'In Review', 'Approved', 'Expired'), allowNull: false, defaultValue: 'Draft' },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'owner_id' },
      expiryDate: { type: DataTypes.DATE, allowNull: true, field: 'expiry_date' },
    },
    { sequelize: sequelizeInstance, tableName: 'documents' },
  );

  DocumentVersionModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      documentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'document_id' },
      version: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      fileName: { type: DataTypes.STRING(255), allowNull: false, field: 'file_name' },
      filePath: { type: DataTypes.STRING(500), allowNull: false, field: 'file_path' },
      changeNote: { type: DataTypes.TEXT, allowNull: true, field: 'change_note' },
      uploadedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'uploaded_by' },
    },
    { sequelize: sequelizeInstance, tableName: 'document_versions' },
  );

  CapaModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      issue: { type: DataTypes.TEXT, allowNull: false },
      rootCause: { type: DataTypes.TEXT, allowNull: true, field: 'root_cause' },
      actionPlan: { type: DataTypes.TEXT, allowNull: true, field: 'action_plan' },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'owner_id' },
      targetDate: { type: DataTypes.DATE, allowNull: true, field: 'target_date' },
      status: { type: DataTypes.ENUM('Open', 'In Progress', 'Closed'), allowNull: false, defaultValue: 'Open' },
    },
    { sequelize: sequelizeInstance, tableName: 'capa' },
  );

  NcrModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      product: { type: DataTypes.STRING(200), allowNull: false },
      lotNo: { type: DataTypes.STRING(100), allowNull: false, field: 'lot_no' },
      issue: { type: DataTypes.TEXT, allowNull: false },
      severity: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), allowNull: false, defaultValue: 'Medium' },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'owner_id' },
      status: { type: DataTypes.ENUM('Open', 'Investigating', 'Closed'), allowNull: false, defaultValue: 'Open' },
    },
    { sequelize: sequelizeInstance, tableName: 'ncr' },
  );

  AuditModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      planDate: { type: DataTypes.DATE, allowNull: true, field: 'plan_date' },
      performedDate: { type: DataTypes.DATE, allowNull: true, field: 'performed_date' },
      score: { type: DataTypes.FLOAT, allowNull: true },
      status: { type: DataTypes.ENUM('Planned', 'In Progress', 'Completed'), allowNull: false, defaultValue: 'Planned' },
      departmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'department_id' },
      ownerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'owner_id' },
    },
    { sequelize: sequelizeInstance, tableName: 'audits' },
  );

  AuditFindingModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      auditId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'audit_id' },
      description: { type: DataTypes.TEXT, allowNull: false },
      severity: { type: DataTypes.ENUM('Low', 'Medium', 'High'), allowNull: false, defaultValue: 'Medium' },
      correctiveAction: { type: DataTypes.TEXT, allowNull: true, field: 'corrective_action' },
      status: { type: DataTypes.ENUM('Open', 'In Progress', 'Closed'), allowNull: false, defaultValue: 'Open' },
    },
    { sequelize: sequelizeInstance, tableName: 'audit_findings' },
  );

  SmtpSettingModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      host: { type: DataTypes.STRING(255), allowNull: false },
      port: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 587 },
      secure: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      username: { type: DataTypes.STRING(255), allowNull: false },
      password: { type: DataTypes.STRING(255), allowNull: false },
      fromEmail: { type: DataTypes.STRING(255), allowNull: false, field: 'from_email' },
      fromName: { type: DataTypes.STRING(255), allowNull: true, field: 'from_name' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
    },
    { sequelize: sequelizeInstance, tableName: 'smtp_settings' },
  );

  StorageSettingModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'local' },
      basePath: { type: DataTypes.STRING(255), allowNull: true, field: 'base_path' },
      bucketName: { type: DataTypes.STRING(255), allowNull: true, field: 'bucket_name' },
      region: { type: DataTypes.STRING(100), allowNull: true },
      endpoint: { type: DataTypes.STRING(500), allowNull: true },
      accessKey: { type: DataTypes.STRING(255), allowNull: true, field: 'access_key' },
      secretKey: { type: DataTypes.STRING(255), allowNull: true, field: 'secret_key' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
    },
    { sequelize: sequelizeInstance, tableName: 'storage_settings' },
  );

  CompanyProfileModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      companyTitle: { type: DataTypes.STRING(180), allowNull: false, defaultValue: 'QMS - Quality Management System', field: 'company_title' },
      logoUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'logo_url' },
      faviconUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'favicon_url' },
      bannerUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'banner_url' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_default' },
    },
    { sequelize: sequelizeInstance, tableName: 'company_profiles' },
  );

  ActivityLogModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'user_id' },
      entity: { type: DataTypes.STRING(150), allowNull: false },
      entityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'entity_id' },
      action: { type: DataTypes.STRING(100), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      meta: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize: sequelizeInstance, tableName: 'activity_logs' },
  );

  CourseModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      duration: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      category: { type: DataTypes.STRING(100), allowNull: true },
      instructor: { type: DataTypes.STRING(150), allowNull: true },
      status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
      autoAssignToNewEmployee: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'auto_assign_to_new_employee',
      },
    },
    { sequelize: sequelizeInstance, tableName: 'courses' },
  );

  CourseEnrollmentModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
      enrolledDate: { type: DataTypes.DATE, allowNull: false, field: 'enrolled_date', defaultValue: DataTypes.NOW },
      status: { type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed'), allowNull: false, defaultValue: 'Not Started' },
    },
    { sequelize: sequelizeInstance, tableName: 'course_enrollments', indexes: [{ unique: true, fields: ['course_id', 'user_id'] }] },
  );

  CourseProgressModel.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enrollmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'enrollment_id', unique: true },
      progressPercentage: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'progress_percentage' },
      lastAccessedDate: { type: DataTypes.DATE, allowNull: true, field: 'last_accessed_date' },
      completedDate: { type: DataTypes.DATE, allowNull: true, field: 'completed_date' },
    },
    { sequelize: sequelizeInstance, tableName: 'course_progress' },
  );

  RoleModel.hasMany(UserModel, { foreignKey: 'roleId', as: 'users' });
  UserModel.belongsTo(RoleModel, { foreignKey: 'roleId', as: 'role' });
  DepartmentModel.hasMany(UserModel, { foreignKey: 'departmentId', as: 'users' });
  UserModel.belongsTo(DepartmentModel, { foreignKey: 'departmentId', as: 'department' });
  RoleModel.belongsToMany(PermissionModel, { through: RolePermissionModel, foreignKey: 'roleId', otherKey: 'permissionId', as: 'permissions' });
  PermissionModel.belongsToMany(RoleModel, { through: RolePermissionModel, foreignKey: 'permissionId', otherKey: 'roleId', as: 'roles' });
  DocumentModel.hasMany(DocumentVersionModel, { foreignKey: 'documentId', as: 'versions' });
  DocumentVersionModel.belongsTo(DocumentModel, { foreignKey: 'documentId', as: 'document' });
  AuditModel.hasMany(AuditFindingModel, { foreignKey: 'auditId', as: 'findings' });
  AuditFindingModel.belongsTo(AuditModel, { foreignKey: 'auditId', as: 'audit' });
  CourseModel.hasMany(CourseEnrollmentModel, { foreignKey: 'courseId', as: 'enrollments' });
  CourseEnrollmentModel.belongsTo(CourseModel, { foreignKey: 'courseId', as: 'course' });
  CourseEnrollmentModel.hasOne(CourseProgressModel, { foreignKey: 'enrollmentId', as: 'progress' });
  CourseProgressModel.belongsTo(CourseEnrollmentModel, { foreignKey: 'enrollmentId', as: 'enrollment' });

  return {
    Role: RoleModel,
    Permission: PermissionModel,
    RolePermission: RolePermissionModel,
    Department: DepartmentModel,
    User: UserModel,
    Document: DocumentModel,
    DocumentVersion: DocumentVersionModel,
    Capa: CapaModel,
    Ncr: NcrModel,
    Audit: AuditModel,
    AuditFinding: AuditFindingModel,
    SmtpSetting: SmtpSettingModel,
    StorageSetting: StorageSettingModel,
    CompanyProfile: CompanyProfileModel,
    ActivityLog: ActivityLogModel,
    Course: CourseModel,
    CourseEnrollment: CourseEnrollmentModel,
    CourseProgress: CourseProgressModel,
  };
};

const models = initModels(sequelize);

export const {
  Role,
  Permission,
  RolePermission,
  Department,
  User,
  Document,
  DocumentVersion,
  Capa,
  Ncr,
  Audit,
  AuditFinding,
  SmtpSetting,
  StorageSetting,
  CompanyProfile,
  ActivityLog,
  Course,
  CourseEnrollment,
  CourseProgress,
} = models;
