import { createApp } from './app';
import { env } from './config/env';
import { sequelize } from './config/database';
import { initModels } from './models';
import { seedDatabase } from './common/bootstrap/seedService';
import { ensureTrainingSchema } from './common/bootstrap/ensureTrainingSchema';

const start = async () => {
  initModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync();
  await ensureTrainingSchema();
  await seedDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`QMS backend running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start QMS backend:', error);
  process.exit(1);
});
