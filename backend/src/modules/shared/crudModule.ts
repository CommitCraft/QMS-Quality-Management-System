import { buildCrudRouter } from '../../routes/crudRoutes';

export type CrudModuleOptions = Parameters<typeof buildCrudRouter>[0];

export const createCrudModuleRouter = (options: CrudModuleOptions) => buildCrudRouter(options);
