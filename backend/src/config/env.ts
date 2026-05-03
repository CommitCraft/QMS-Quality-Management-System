import dotenv from 'dotenv';

dotenv.config();

const required = (value: string | undefined, fallback = ''): string => {
  if (value && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

export const env = {
  port: Number(required(process.env.PORT, '5000')),
  nodeEnv: required(process.env.NODE_ENV, 'development'),
  dbSyncAlter: required(process.env.DB_SYNC_ALTER, 'false').toLowerCase() === 'true',
  db: {
    host: required(process.env.DB_HOST, 'localhost'),
    port: Number(required(process.env.DB_PORT, '3306')),
    name: required(process.env.DB_NAME, 'qms'),
    user: required(process.env.DB_USER, 'root'),
    password: required(process.env.DB_PASSWORD, ''),
  },
  jwt: {
    accessSecret: required(process.env.JWT_ACCESS_SECRET, 'qms-access-secret'),
    refreshSecret: required(process.env.JWT_REFRESH_SECRET, 'qms-refresh-secret'),
    accessExpiresIn: required(process.env.JWT_ACCESS_EXPIRES_IN, '7d'),
    refreshExpiresIn: required(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),
  },
  corsOrigin: required(process.env.CORS_ORIGIN, 'http://localhost:5173'),
  uploadDir: required(process.env.UPLOAD_DIR, 'uploads'),
  uploadBaseUrl: required(process.env.UPLOAD_BASE_URL, 'http://localhost:5000'),
};