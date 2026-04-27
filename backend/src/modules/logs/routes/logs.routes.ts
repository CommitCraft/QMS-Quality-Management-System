import { Router } from 'express';
import { authenticate, requirePermission } from '../../../common/middleware';
import { asyncHandler } from '../../../common/utils';
import { getErrorLogs, getLoginAudits } from '../controller/logs.controller';

const logsRoutes = Router();

logsRoutes.use(authenticate);
logsRoutes.get('/login-audits', requirePermission('VIEW_LOGIN_AUDITS'), asyncHandler(getLoginAudits));
logsRoutes.get('/error-logs', requirePermission('VIEW_ERROR_LOGS'), asyncHandler(getErrorLogs));

export default logsRoutes;
