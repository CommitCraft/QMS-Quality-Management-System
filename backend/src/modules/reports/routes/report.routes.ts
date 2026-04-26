import { Router } from 'express';
import { authenticate, requirePermission } from '../../../common/middleware';
import { exportReport } from '../controller/report.controller';

const reportRoutes = Router();
reportRoutes.use(authenticate);
reportRoutes.get('/export', requirePermission('reports.read'), exportReport);

export default reportRoutes;
