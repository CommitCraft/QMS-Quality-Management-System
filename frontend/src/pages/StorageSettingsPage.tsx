import { CrudPage } from './entity/CrudPage';
import { storageConfig } from './entity/entityConfigs';

const StorageSettingsPage = () => <CrudPage config={storageConfig} />;

export default StorageSettingsPage;