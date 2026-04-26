import { createCrudModuleRouter } from '../../shared/crudModule';
import { ncrCrudConfig } from '../service/ncr.service';
import { createNcrValidators, updateNcrValidators } from '../validation/ncr.validation';

export const createNcrRouter = () =>
  createCrudModuleRouter({
    ...ncrCrudConfig,
    createValidators: createNcrValidators,
    updateValidators: updateNcrValidators,
  });
