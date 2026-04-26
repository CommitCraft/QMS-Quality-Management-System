import { Department } from '../../../models';

export const departmentsCrudConfig = {
  path: '/departments',
  entityName: 'department',
  model: Department,
  permissionBase: 'departments',
  searchFields: ['name', 'code', 'manager'],
};
