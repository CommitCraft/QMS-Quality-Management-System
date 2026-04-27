export type PermissionActionSeed = {
  label: string;
  code: string;
};

export type PermissionPageSeed = {
  label: string;
  actions: PermissionActionSeed[];
};

export type PermissionModuleSeed = {
  label: string;
  pages: PermissionPageSeed[];
};

const viewOnly = (label: string, code: string): PermissionActionSeed[] => [{ label, code }];
const commonCrud = (baseCode: string): PermissionActionSeed[] => [
  { label: 'View', code: `VIEW_${baseCode}` },
  { label: 'Add', code: `ADD_${baseCode}` },
  { label: 'Edit', code: `EDIT_${baseCode}` },
  { label: 'Delete', code: `DELETE_${baseCode}` },
];
const manageActions = (baseCode: string): PermissionActionSeed[] => [
  { label: 'View', code: `VIEW_${baseCode}` },
  { label: 'Manage', code: `MANAGE_${baseCode}` },
];

export const PERMISSION_CATALOG: PermissionModuleSeed[] = [
  {
    label: 'Dashboard',
    pages: [{ label: 'Dashboard', actions: viewOnly('View', 'VIEW_DASHBOARD') }],
  },
  {
    label: 'Audit',
    pages: [
      { label: 'Audit List', actions: viewOnly('View', 'VIEW_AUDIT_LIST') },
      { label: 'Audit for Review', actions: viewOnly('View', 'VIEW_AUDIT_REVIEW') },
      { label: 'Audit Template', actions: commonCrud('AUDIT_TEMPLATE') },
      { label: 'Audit Logs', actions: viewOnly('View', 'VIEW_AUDIT_LOGS') },
    ],
  },
  {
    label: 'CAPA',
    pages: [
      { label: 'CAPA Request', actions: commonCrud('CAPA_REQUEST') },
      { label: 'Root Cause Methodology', actions: manageActions('CAPA_ROOT_CAUSE_METHODLOGY') },
      { label: 'CAPA Request Logs', actions: viewOnly('View', 'VIEW_CAPA_REQUEST_LOGS') },
      { label: 'My CAPA Actions', actions: viewOnly('View', 'VIEW_MY_CAPA_ACTIONS') },
    ],
  },
  {
    label: 'Non Conformance',
    pages: [
      { label: 'List', actions: viewOnly('View', 'VIEW_NCR_LIST') },
      { label: 'Add New', actions: commonCrud('NCR') },
      { label: 'Non Conformance Logs', actions: viewOnly('View', 'VIEW_NCR_LOGS') },
      { label: 'Response Type', actions: manageActions('NCR_RESPONSE_TYPE') },
    ],
  },
  {
    label: 'Complaint',
    pages: [
      { label: 'List', actions: viewOnly('View', 'VIEW_COMPLAINT_LIST') },
      { label: 'Add New', actions: commonCrud('COMPLAINT') },
      { label: 'Complaint Type', actions: manageActions('COMPLAINT_TYPE') },
      { label: 'Complaint Logs', actions: viewOnly('View', 'VIEW_COMPLAINT_LOGS') },
      { label: 'My Complaints', actions: viewOnly('View', 'VIEW_MY_COMPLAINTS') },
    ],
  },
  {
    label: 'Risk Management',
    pages: [
      { label: 'List', actions: viewOnly('View', 'VIEW_RISK_LIST') },
      { label: 'Add New', actions: commonCrud('RISK') },
      { label: 'Risk Category', actions: manageActions('RISK_CATEGORY') },
      { label: 'Risk Logs', actions: viewOnly('View', 'VIEW_RISK_LOGS') },
      { label: 'My Risks', actions: viewOnly('View', 'VIEW_MY_RISKS') },
    ],
  },
  {
    label: '4M Change',
    pages: [
      { label: 'Change Request List', actions: viewOnly('View', 'VIEW_CHANGE_REQUEST_LIST') },
      { label: 'Create Change Request', actions: commonCrud('CHANGE_REQUEST') },
      { label: 'Category Setup', actions: manageActions('CHANGE_CATEGORY') },
      { label: 'Approval Workflow', actions: manageActions('CHANGE_APPROVAL_WORKFLOW') },
      { label: 'Risk Assessment', actions: manageActions('CHANGE_RISK_ASSESSMENT') },
      { label: 'Validation Plan', actions: manageActions('CHANGE_VALIDATION_PLAN') },
      { label: 'Implementation Tracker', actions: viewOnly('View', 'VIEW_CHANGE_IMPLEMENTATION_TRACKER') },
      { label: 'My Change Actions', actions: viewOnly('View', 'VIEW_MY_CHANGE_ACTIONS') },
      { label: 'Change Logs', actions: viewOnly('View', 'VIEW_CHANGE_LOGS') },
      { label: 'Reports', actions: viewOnly('View', 'VIEW_CHANGE_REPORTS') },
    ],
  },
  {
    label: 'Supplier',
    pages: [
      { label: 'List', actions: viewOnly('View', 'VIEW_SUPPLIER_LIST') },
      { label: 'Add New', actions: commonCrud('SUPPLIER') },
    ],
  },
  {
    label: 'Training',
    pages: [
      { label: 'Course', actions: viewOnly('View', 'VIEW_TRAINING_COURSE') },
      { label: 'My Courses', actions: viewOnly('View', 'VIEW_MY_COURSES') },
      { label: 'Assign Course', actions: manageActions('TRAINING_ASSIGN_COURSE') },
      { label: 'Course Summary', actions: viewOnly('View', 'VIEW_COURSE_SUMMARY') },
    ],
  },
  {
    label: 'Document Management',
    pages: [
      { label: 'My Document View', actions: viewOnly('View', 'VIEW_MY_DOCUMENTS') },
      { label: 'My Folder View', actions: viewOnly('View', 'VIEW_MY_FOLDERS') },
      { label: 'All Document View', actions: viewOnly('View', 'VIEW_ALL_DOCUMENTS') },
      { label: 'All Folder View', actions: viewOnly('View', 'VIEW_ALL_FOLDERS') },
      { label: 'Folders', actions: viewOnly('View', 'VIEW_DOCUMENT_FOLDERS') },
      { label: 'Deep Search', actions: viewOnly('View', 'VIEW_DOCUMENT_DEEP_SEARCH') },
      { label: 'AI Document Generator', actions: manageActions('AI_DOCUMENT_GENERATOR') },
      { label: 'AI Generator List', actions: viewOnly('View', 'VIEW_AI_GENERATOR_LIST') },
      { label: 'AI Prompt Templates', actions: manageActions('AI_PROMPT_TEMPLATES') },
      { label: 'OCR Content Extractor', actions: manageActions('OCR_CONTENT_EXTRACTOR') },
      { label: 'Bulk Document Upload', actions: manageActions('BULK_DOCUMENT_UPLOAD') },
      { label: 'File Request Link', actions: manageActions('FILE_REQUEST_LINK') },
      { label: 'Documents Audit Trail', actions: viewOnly('View', 'VIEW_DOCUMENT_AUDIT_TRAIL') },
      { label: 'Recent Activity', actions: viewOnly('View', 'VIEW_RECENT_ACTIVITY') },
      { label: 'Archive Documents', actions: viewOnly('View', 'VIEW_ARCHIVE_DOCUMENTS') },
      { label: 'Archive Folders', actions: viewOnly('View', 'VIEW_ARCHIVE_FOLDERS') },
      { label: 'Archive Retention Period', actions: manageActions('ARCHIVE_RETENTION_PERIOD') },
      { label: 'Document Status', actions: viewOnly('View', 'VIEW_DOCUMENT_STATUS') },
    ],
  },
  {
    label: 'Workflows',
    pages: [
      { label: 'Workflow Setup Settings', actions: manageActions('WORKFLOW_SETTINGS') },
      { label: 'All Workflows', actions: viewOnly('View', 'VIEW_WORKFLOWS') },
      { label: 'Request Doc via Workflow', actions: manageActions('REQUEST_DOC_VIA_WORKFLOW') },
      { label: 'Workflow Logs', actions: viewOnly('View', 'VIEW_WORKFLOW_LOGS') },
    ],
  },
  {
    label: 'Access Control',
    pages: [
      { label: 'Roles', actions: viewOnly('View', 'VIEW_ROLES') },
      { label: 'Users', actions: viewOnly('View', 'VIEW_USERS') },
      { label: 'Role User', actions: viewOnly('View', 'VIEW_ROLE_USER') },
      { label: 'Permissions', actions: viewOnly('View', 'VIEW_PERMISSIONS') },
    ],
  },
  {
    label: 'Settings',
    pages: [
      { label: 'Email SMTP Settings', actions: viewOnly('View', 'VIEW_SMTP_SETTINGS') },
      { label: 'General Settings', actions: viewOnly('View', 'VIEW_GENERAL_SETTINGS') },
      { label: 'Storage Settings', actions: viewOnly('View', 'VIEW_STORAGE_SETTINGS') },
      { label: 'Company Profile', actions: viewOnly('View', 'VIEW_COMPANY_PROFILE') },
    ],
  },
  {
    label: 'Logs',
    pages: [
      { label: 'Login Audits', actions: viewOnly('View', 'VIEW_LOGIN_AUDITS') },
      { label: 'Error Logs', actions: viewOnly('View', 'VIEW_ERROR_LOGS') },
    ],
  },
  {
    label: 'Misc',
    pages: [
      { label: 'Reminder', actions: viewOnly('View', 'VIEW_REMINDERS') },
      { label: 'Clients', actions: viewOnly('View', 'VIEW_CLIENTS') },
    ],
  },
];

export const CORE_PERMISSIONS = {
  roles: {
    read: 'VIEW_ROLES',
    write: 'EDIT_ROLES',
    remove: 'DELETE_ROLES',
  },
  users: {
    read: 'VIEW_USERS',
    write: 'EDIT_USERS',
    remove: 'DELETE_USERS',
  },
  roleUsers: {
    view: 'VIEW_ROLE_USER',
    manage: 'MANAGE_ROLE_USER',
  },
} as const;

export type PermissionSeedRecord = {
  module: string;
  action: string;
  name: string;
  description: string;
};

export const flattenPermissionCatalog = (): PermissionSeedRecord[] =>
  PERMISSION_CATALOG.flatMap((module) =>
    module.pages.flatMap((page) =>
      page.actions.map((action) => ({
        module: module.label,
        action: action.label,
        name: action.code,
        description: `${page.label} - ${action.label}`,
      })),
    ),
  );

export const findPermissionMeta = (code: string) =>
  PERMISSION_CATALOG.flatMap((module) =>
    module.pages.flatMap((page) =>
      page.actions.map((action) => ({
        module: module.label,
        page: page.label,
        action: action.label,
        code: action.code,
      })),
    ),
  ).find((item) => item.code === code);
