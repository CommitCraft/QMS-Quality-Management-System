import { Router } from 'express';
import authRoutes from './auth/routes/auth.routes';
import dashboardRoutes from './dashboard/routes/dashboard.routes';
import reportRoutes from './reports/routes/report.routes';
import usersRoutes from './users/routes/users.routes';
import rolesRoutes from './roles/routes/roles.routes';
import permissionsRoutes from './permissions/routes/permissions.routes';
import departmentsRoutes from './departments/routes/departments.routes';
import capaRoutes from './capa/routes/capa.routes';
import ncrRoutes from './ncr/routes/ncr.routes';
import auditsRoutes from './audits/routes/audits.routes';
import documentsRoutes from './documents/routes/documents.routes';
import settingsRoutes from './settings/routes/settings.routes';
import companyProfileRoutes from './company-profile/routes/company-profile.routes';
import roleUsersRoutes from './role-users/routes/role-users.routes';
import logsRoutes from './logs/routes/logs.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/', companyProfileRoutes);
apiRouter.use('/roles/users', roleUsersRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/roles', rolesRoutes);
apiRouter.use('/permissions', permissionsRoutes);
apiRouter.use('/departments', departmentsRoutes);
apiRouter.use('/capa', capaRoutes);
apiRouter.use('/ncr', ncrRoutes);
apiRouter.use('/audits', auditsRoutes);
apiRouter.use('/documents', documentsRoutes);
apiRouter.use('/logs', logsRoutes);
apiRouter.use('/', settingsRoutes);

export default apiRouter;
