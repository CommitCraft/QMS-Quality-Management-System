import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getCharts, getSummary } from '../controllers/dashboardController';

const router = Router();
router.use(authenticate);
router.get('/summary', getSummary);
router.get('/charts', getCharts);

export default router;
