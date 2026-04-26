import { Capa } from '../../../models';

export const capaCrudConfig = {
  path: '/capa',
  entityName: 'capa',
  model: Capa,
  permissionBase: 'capa',
  searchFields: ['title', 'issue', 'rootCause', 'status'],
};
