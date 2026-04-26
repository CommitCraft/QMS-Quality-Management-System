import { Router } from 'express';
import { authenticate } from '../../../common/middleware';
import { getCharts, getSummary } from '../controller/dashboard.controller';

const dashboardRoutes = Router();
dashboardRoutes.use(authenticate);
dashboardRoutes.get('/summary', getSummary);
dashboardRoutes.get('/charts', getCharts);

export default dashboardRoutes;
