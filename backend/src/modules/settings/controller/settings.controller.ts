import { createCrudModuleRouter } from '../../shared/crudModule';
import { createSmtpValidators, createStorageValidators, updateSmtpValidators, updateStorageValidators } from '../validation/settings.validation';
import { smtpCrudConfig, storageCrudConfig } from '../service/settings.service';

export const createSmtpSettingsRouter = () =>
  createCrudModuleRouter({
    ...smtpCrudConfig,
    createValidators: createSmtpValidators,
    updateValidators: updateSmtpValidators,
  });

export const createStorageSettingsRouter = () =>
  createCrudModuleRouter({
    ...storageCrudConfig,
    createValidators: createStorageValidators,
    updateValidators: updateStorageValidators,
  });
