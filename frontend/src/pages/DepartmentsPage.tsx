import { CrudPage } from './entity/CrudPage';
import { departmentConfig } from './entity/entityConfigs';

const DepartmentsPage = () => <CrudPage config={departmentConfig} />;

export default DepartmentsPage;
