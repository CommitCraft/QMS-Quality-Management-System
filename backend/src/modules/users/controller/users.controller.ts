import { createCrudModuleRouter } from '../../shared/crudModule';
import { usersCrudConfig } from '../service/users.service';
import { createUserValidators, updateUserValidators } from '../validation/users.validation';

export const createUsersRouter = () =>
  createCrudModuleRouter({
    ...usersCrudConfig,
    createValidators: createUserValidators,
    updateValidators: updateUserValidators,
  });
