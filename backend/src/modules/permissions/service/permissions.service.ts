import { Permission } from '../../../models';

export const permissionsCrudConfig = {
  path: '/permissions',
  entityName: 'permission',
  model: Permission,
  permissionBase: 'permissions',
  searchFields: ['module', 'action', 'name'],
};
