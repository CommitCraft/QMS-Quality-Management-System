import { Router } from 'express';
import { createSmtpSettingsRouter, createStorageSettingsRouter } from '../controller/settings.controller';

const settingsRoutes = Router();
settingsRoutes.use('/smtp-settings', createSmtpSettingsRouter());
settingsRoutes.use('/storage-settings', createStorageSettingsRouter());

export default settingsRoutes;
