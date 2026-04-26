import { createCrudModuleRouter } from '../../shared/crudModule';
import { departmentsCrudConfig } from '../service/departments.service';
import { createDepartmentValidators, updateDepartmentValidators } from '../validation/departments.validation';

export const createDepartmentsRouter = () =>
  createCrudModuleRouter({
    ...departmentsCrudConfig,
    createValidators: createDepartmentValidators,
    updateValidators: updateDepartmentValidators,
  });
