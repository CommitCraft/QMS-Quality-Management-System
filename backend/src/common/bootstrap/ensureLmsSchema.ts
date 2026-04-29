import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';

export const ensureLmsSchema = async () => {
  const columns = await sequelize.getQueryInterface().describeTable('courses').catch(() => null);
  if (columns && !Object.prototype.hasOwnProperty.call(columns, 'deleted_at')) {
    await sequelize.query('ALTER TABLE courses ADD COLUMN deleted_at DATETIME NULL', { type: QueryTypes.RAW });
  }
};
