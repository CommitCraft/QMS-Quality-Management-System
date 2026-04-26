import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import apiRoutes from './modules';
import { env } from './config/env';
import { errorHandler, notFound } from './common/middleware';

export const createApp = () => {
  const app = express();

  const uploadRoot = path.join(process.cwd(), env.uploadDir);
  fs.mkdirSync(uploadRoot, { recursive: true });

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/uploads', express.static(uploadRoot));
  app.use('/api', apiRoutes);
  app.get('/health', (_req, res) => res.json({ success: true, message: 'QMS API running' }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
