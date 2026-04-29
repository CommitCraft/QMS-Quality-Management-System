import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';

const courseColumnSql = `
  ALTER TABLE courses
  ADD COLUMN auto_assign_to_new_employee TINYINT(1) NOT NULL DEFAULT 1
  AFTER status
`;

export const ensureTrainingSchema = async () => {
  const columns = await sequelize.getQueryInterface().describeTable('courses').catch(() => null);

  if (!columns) {
    return;
  }

  if (!Object.prototype.hasOwnProperty.call(columns, 'auto_assign_to_new_employee')) {
    await sequelize.query(courseColumnSql, { type: QueryTypes.RAW });
  }
};