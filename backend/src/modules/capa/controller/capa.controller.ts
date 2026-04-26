import { createCrudModuleRouter } from '../../shared/crudModule';
import { capaCrudConfig } from '../service/capa.service';
import { createCapaValidators, updateCapaValidators } from '../validation/capa.validation';

export const createCapaRouter = () =>
  createCrudModuleRouter({
    ...capaCrudConfig,
    createValidators: createCapaValidators,
    updateValidators: updateCapaValidators,
  });
