import bcrypt from 'bcryptjs';
import { Audit, Capa, CompanyProfile, Department, Document, Ncr, Permission, Role, RolePermission, User } from '../models';

const defaultPermissions = [
  { module: 'dashboard', action: 'read', name: 'dashboard.read' },
  { module: 'users', action: 'read', name: 'users.read' },
  { module: 'users', action: 'write', name: 'users.write' },
  { module: 'users', action: 'delete', name: 'users.delete' },
  { module: 'roles', action: 'read', name: 'roles.read' },
  { module: 'roles', action: 'write', name: 'roles.write' },
  { module: 'roles', action: 'delete', name: 'roles.delete' },
  { module: 'role-users', action: 'view', name: 'VIEW_ROLE_USER' },
  { module: 'role-users', action: 'manage', name: 'MANAGE_ROLE_USER' },
  { module: 'permissions', action: 'read', name: 'permissions.read' },
  { module: 'permissions', action: 'write', name: 'permissions.write' },
  { module: 'permissions', action: 'delete', name: 'permissions.delete' },
  { module: 'departments', action: 'read', name: 'departments.read' },
  { module: 'departments', action: 'write', name: 'departments.write' },
  { module: 'departments', action: 'delete', name: 'departments.delete' },
  { module: 'documents', action: 'read', name: 'documents.read' },
  { module: 'documents', action: 'write', name: 'documents.write' },
  { module: 'documents', action: 'delete', name: 'documents.delete' },
  { module: 'capa', action: 'read', name: 'capa.read' },
  { module: 'capa', action: 'write', name: 'capa.write' },
  { module: 'capa', action: 'delete', name: 'capa.delete' },
  { module: 'ncr', action: 'read', name: 'ncr.read' },
  { module: 'ncr', action: 'write', name: 'ncr.write' },
  { module: 'ncr', action: 'delete', name: 'ncr.delete' },
  { module: 'audits', action: 'read', name: 'audits.read' },
  { module: 'audits', action: 'write', name: 'audits.write' },
  { module: 'audits', action: 'delete', name: 'audits.delete' },
  { module: 'complaint', action: 'read', name: 'complaint.read' },
  { module: 'complaint', action: 'write', name: 'complaint.write' },
  { module: 'complaint', action: 'delete', name: 'complaint.delete' },
  { module: 'risk', action: 'read', name: 'risk.read' },
  { module: 'risk', action: 'write', name: 'risk.write' },
  { module: 'risk', action: 'delete', name: 'risk.delete' },
  { module: 'change', action: 'read', name: 'change.read' },
  { module: 'change', action: 'write', name: 'change.write' },
  { module: 'change', action: 'delete', name: 'change.delete' },
  { module: 'supplier', action: 'read', name: 'supplier.read' },
  { module: 'supplier', action: 'write', name: 'supplier.write' },
  { module: 'supplier', action: 'delete', name: 'supplier.delete' },
  { module: 'training', action: 'read', name: 'training.read' },
  { module: 'training', action: 'write', name: 'training.write' },
  { module: 'training', action: 'delete', name: 'training.delete' },
  { module: 'workflows', action: 'read', name: 'workflows.read' },
  { module: 'workflows', action: 'write', name: 'workflows.write' },
  { module: 'workflows', action: 'delete', name: 'workflows.delete' },
  { module: 'reminders', action: 'read', name: 'reminders.read' },
  { module: 'reminders', action: 'write', name: 'reminders.write' },
  { module: 'reminders', action: 'delete', name: 'reminders.delete' },
  { module: 'clients', action: 'read', name: 'clients.read' },
  { module: 'clients', action: 'write', name: 'clients.write' },
  { module: 'clients', action: 'delete', name: 'clients.delete' },
  { module: 'reports', action: 'read', name: 'reports.read' },
  { module: 'settings', action: 'read', name: 'settings.read' },
  { module: 'settings', action: 'write', name: 'settings.write' },
  { module: 'settings', action: 'delete', name: 'settings.delete' },
];

export const seedDatabase = async () => {
  const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' }, defaults: { name: 'Admin', description: 'System administrator' } });
  const [managerRole] = await Role.findOrCreate({ where: { name: 'Manager' }, defaults: { name: 'Manager', description: 'Department manager' } });
  const [auditorRole] = await Role.findOrCreate({ where: { name: 'Auditor' }, defaults: { name: 'Auditor', description: 'Audit and compliance role' } });
  const [employeeRole] = await Role.findOrCreate({ where: { name: 'Employee' }, defaults: { name: 'Employee', description: 'Standard employee access' } });

  const permissions = [];
  for (const permission of defaultPermissions) {
    const [record] = await Permission.findOrCreate({ where: { name: permission.name }, defaults: permission });
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
};
