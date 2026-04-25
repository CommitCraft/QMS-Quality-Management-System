import { CrudPage } from './entity/CrudPage';
import { smtpConfig } from './entity/entityConfigs';

const SmtpSettingsPage = () => <CrudPage config={smtpConfig} />;

export default SmtpSettingsPage;
