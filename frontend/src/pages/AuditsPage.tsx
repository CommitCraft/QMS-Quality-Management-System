import { CrudPage } from './entity/CrudPage';
import { auditConfig } from './entity/entityConfigs';

const AuditsPage = () => <CrudPage config={auditConfig} />;

export default AuditsPage;
