import { createCrudModuleRouter } from '../../shared/crudModule';
import { auditsCrudConfig } from '../service/audits.service';
import { createAuditValidators, updateAuditValidators } from '../validation/audits.validation';

export const createAuditsRouter = () =>
  createCrudModuleRouter({
    ...auditsCrudConfig,
    createValidators: createAuditValidators,
    updateValidators: updateAuditValidators,
  });
