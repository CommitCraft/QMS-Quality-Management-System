import bcrypt from 'bcryptjs';
import { Audit, Capa, CompanyProfile, Department, Document, Ncr, Permission, Role, RolePermission, User, Course, CourseEnrollment, CourseProgress } from '../../models';
import { flattenPermissionCatalog } from '../constants/permissions';

const defaultPermissions = flattenPermissionCatalog();

export const seedDatabase = async () => {
  const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' }, defaults: { name: 'Admin', description: 'System administrator' } });
  const [managerRole] = await Role.findOrCreate({ where: { name: 'Manager' }, defaults: { name: 'Manager', description: 'Department manager' } });
  const [auditorRole] = await Role.findOrCreate({ where: { name: 'Auditor' }, defaults: { name: 'Auditor', description: 'Audit and compliance role' } });
  const [employeeRole] = await Role.findOrCreate({ where: { name: 'Employee' }, defaults: { name: 'Employee', description: 'Standard employee access' } });

  const permissions = [];
  for (const permission of defaultPermissions) {
    const [record] = await Permission.findOrCreate({ where: { name: permission.name }, defaults: permission });
    await record.update(permission);
    permissions.push(record);
  }

  const adminMappings = permissions.map((permission) => ({ roleId: adminRole.id, permissionId: permission.id }));
  for (const mapping of adminMappings) {
    await RolePermission.findOrCreate({ where: mapping, defaults: mapping });
  }

  const limitedPermissions = permissions.filter((permission) => ['dashboard.read', 'documents.read', 'capa.read', 'ncr.read', 'audits.read', 'reports.read'].includes(permission.name));
  for (const permission of limitedPermissions) {
    await RolePermission.findOrCreate({ where: { roleId: managerRole.id, permissionId: permission.id }, defaults: { roleId: managerRole.id, permissionId: permission.id } });
    await RolePermission.findOrCreate({ where: { roleId: auditorRole.id, permissionId: permission.id }, defaults: { roleId: auditorRole.id, permissionId: permission.id } });
    await RolePermission.findOrCreate({ where: { roleId: employeeRole.id, permissionId: permission.id }, defaults: { roleId: employeeRole.id, permissionId: permission.id } });
  }

  const departments = [
    { name: 'Quality Assurance', code: 'QA', manager: 'Priya Sharma', description: 'Quality compliance and release approval.', status: 'Active' },
    { name: 'Production', code: 'PRD', manager: 'Ravi Kumar', description: 'Manufacturing and shop floor operations.', status: 'Active' },
    { name: 'Maintenance', code: 'MNT', manager: 'Asha Nair', description: 'Equipment maintenance and calibration.', status: 'Active' },
  ];

  const seededDepartments = [];
  for (const department of departments) {
    const [record] = await Department.findOrCreate({ where: { code: department.code }, defaults: department });
    seededDepartments.push(record);
  }

  const adminPassword = await bcrypt.hash('admin123', 12);
  const [adminUser] = await User.findOrCreate({
    where: { username: 'admin' },
    defaults: {
      name: 'System Admin',
      username: 'admin',
      email: 'admin@qms.local',
      mobile: '9999999999',
      password: adminPassword,
      roleId: adminRole.id,
      departmentId: seededDepartments[0]?.id ?? null,
      status: 'Active',
    },
  });

  const userPassword = await bcrypt.hash('password123', 12);
  await User.findOrCreate({
    where: { username: 'supervisor' },
    defaults: {
      name: 'Production Supervisor',
      username: 'supervisor',
      email: 'supervisor@qms.local',
      mobile: '8888888888',
      password: userPassword,
      roleId: managerRole.id,
      departmentId: seededDepartments[1]?.id ?? null,
      status: 'Active',
    },
  });

  await Capa.findOrCreate({
    where: { title: 'Line clearance deviation' },
    defaults: {
      title: 'Line clearance deviation',
      issue: 'Unverified cleaning record before batch start.',
      rootCause: 'Checklist not enforced by shift handover.',
      actionPlan: 'Revise handover checklist and retrain operators.',
      ownerId: adminUser.id,
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: 'In Progress',
    },
  });

  await Ncr.findOrCreate({
    where: { title: 'Seal defect batch' },
    defaults: {
      title: 'Seal defect batch',
      product: 'Bottle Cap',
      lotNo: 'LOT-2404-17',
      issue: 'Seal torque inconsistency detected during inspection.',
      severity: 'High',
      ownerId: adminUser.id,
      status: 'Open',
    },
  });

  await Audit.findOrCreate({
    where: { title: 'Internal GMP audit - April' },
    defaults: {
      title: 'Internal GMP audit - April',
      planDate: new Date(),
      performedDate: new Date(),
      score: 92,
      status: 'Completed',
      departmentId: seededDepartments[0]?.id ?? null,
      ownerId: adminUser.id,
    },
  });

  await Document.findOrCreate({
    where: { title: 'SOP - Batch Record Review' },
    defaults: {
      title: 'SOP - Batch Record Review',
      folderPath: 'SOPs/Quality',
      fileName: 'sop-batch-review.pdf',
      filePath: 'uploads/documents/sample/sop-batch-review.pdf',
      version: 1,
      currentVersion: 1,
      status: 'Approved',
      ownerId: adminUser.id,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
  });

  await CompanyProfile.findOrCreate({
    where: { companyTitle: 'QMS - Quality Management System' },
    defaults: {
      companyTitle: 'QMS - Quality Management System',
      logoUrl: null,
      faviconUrl: null,
      bannerUrl: null,
      isActive: true,
      isDefault: true,
    },
  });

  // Seed training courses
  const courses = [
    {
      code: 'TRN-001',
      title: 'GMP Fundamentals',
      description: 'Introduction to Good Manufacturing Practice principles and requirements.',
      duration: 120,
      category: 'Compliance',
      instructor: 'Dr. Rajesh Verma',
      status: 'Active',
    },
    {
      code: 'TRN-002',
      title: 'Quality Systems Overview',
      description: 'Understanding the ISO 9001 quality management system.',
      duration: 90,
      category: 'Quality Management',
      instructor: 'Priya Sharma',
      status: 'Active',
    },
    {
      code: 'TRN-003',
      title: 'Data Integrity in Operations',
      description: 'Best practices for maintaining data integrity in manufacturing.',
      duration: 60,
      category: 'Compliance',
      instructor: 'Amit Patel',
      status: 'Active',
    },
    {
      code: 'TRN-004',
      title: 'Risk Management Essentials',
      description: 'Risk assessment and mitigation strategies.',
      duration: 75,
      category: 'Management',
      instructor: 'Dr. Suresh Kumar',
      status: 'Active',
    },
    {
      code: 'TRN-005',
      title: 'Change Control Process',
      description: 'Managing changes in manufacturing operations.',
      duration: 60,
      category: 'Operations',
      instructor: 'Ravi Kumar',
      status: 'Active',
    },
  ];

  const seededCourses = [];
  for (const course of courses) {
    const [record] = await Course.findOrCreate({ where: { code: course.code }, defaults: course });
    seededCourses.push(record);
  }

  // Assign courses to supervisor user
  if (seededCourses.length > 0) {
    const supervisorUser = await User.findOne({ where: { username: 'supervisor' } });
    if (supervisorUser) {
      for (const course of seededCourses) {
        const [enrollment] = await CourseEnrollment.findOrCreate({
          where: { courseId: course.id, userId: supervisorUser.id },
          defaults: {
            courseId: course.id,
            userId: supervisorUser.id,
            status: 'Not Started',
            enrolledDate: new Date(),
          },
        });

        // Create progress record if it doesn't exist
        await CourseProgress.findOrCreate({
          where: { enrollmentId: enrollment.id },
          defaults: {
            enrollmentId: enrollment.id,
            progressPercentage: 0,
          },
        });
      }
    }
  }
};