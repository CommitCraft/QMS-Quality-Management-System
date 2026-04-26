import { Audit } from '../../../models';

export const auditsCrudConfig = {
  path: '/audits',
  entityName: 'audit',
  model: Audit,
  permissionBase: 'audits',
  searchFields: ['title', 'status'],
};
