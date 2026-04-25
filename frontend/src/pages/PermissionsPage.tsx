import { CrudPage } from './entity/CrudPage';
import { permissionConfig } from './entity/entityConfigs';

const PermissionsPage = () => <CrudPage config={permissionConfig} />;

export default PermissionsPage;
