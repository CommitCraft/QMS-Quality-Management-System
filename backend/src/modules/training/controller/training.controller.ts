import { createCrudModuleRouter } from '../../shared/crudModule';
import { trainingCrudConfig } from '../service/training.service';
import { createCourseValidators, updateCourseValidators } from '../validation/training.validation';

export const createTrainingRouter = () =>
  createCrudModuleRouter({
    ...trainingCrudConfig,
    createValidators: createCourseValidators,
    updateValidators: updateCourseValidators,
  });
