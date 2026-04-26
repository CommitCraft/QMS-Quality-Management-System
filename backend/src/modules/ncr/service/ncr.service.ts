import { Ncr } from '../../../models';

export const ncrCrudConfig = {
  path: '/ncr',
  entityName: 'ncr',
  model: Ncr,
  permissionBase: 'ncr',
  searchFields: ['title', 'product', 'lotNo', 'issue', 'severity', 'status'],
};
