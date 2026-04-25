import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { exportReport } from '../controllers/reportController';

const router = Router();
router.use(authenticate);
router.get('/export', requirePermission('reports.read'), exportReport);

export default router;
