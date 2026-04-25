import { CrudPage } from './entity/CrudPage';
import { userConfig } from './entity/entityConfigs';

const UsersPage = () => <CrudPage config={userConfig} />;

export default UsersPage;
