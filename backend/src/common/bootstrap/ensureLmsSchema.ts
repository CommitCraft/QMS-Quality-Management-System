import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export const ensureLmsSchema = async () => {
  const columns = await sequelize.getQueryInterface().describeTable('courses').catch(() => null);
  if (columns && !Object.prototype.hasOwnProperty.call(columns, 'deleted_at')) {
    await sequelize.query('ALTER TABLE courses ADD COLUMN deleted_at DATETIME NULL', { type: QueryTypes.RAW });
  }

  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS test_attempts (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      test_series_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      score INT UNSIGNED NOT NULL DEFAULT 0,
      passed TINYINT(1) NOT NULL DEFAULT 0,
      attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_test_attempts_series FOREIGN KEY (test_series_id) REFERENCES test_series(id) ON DELETE CASCADE,
      CONSTRAINT fk_test_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,
    { type: QueryTypes.RAW },
  );
};
