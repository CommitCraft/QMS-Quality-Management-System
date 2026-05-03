import {
  AuditsPage,
  CapaPage,
  DashboardPage,
  DepartmentsPage,
  ErrorLogsPage,
  LoginAuditsPage,
  NcrPage,
  ReportsPage,
} from '../pageRegistry';
import { ROUTE_PATHS } from '../routePaths';
import type { PermissionRouteGroup } from '../routeTypes';

export const coreRouteGroups: PermissionRouteGroup[] = [
  {
    requiredPermissions: ['VIEW_DASHBOARD'],
    routes: [{ path: ROUTE_PATHS.dashboard, element: <DashboardPage /> }],
  },
  {
    requiredPermissions: ['VIEW_DEPARTMENTS'],
    routes: [{ path: ROUTE_PATHS.departments, element: <DepartmentsPage /> }],
  },
  {
    requiredPermissions: ['VIEW_CAPA_REQUEST'],
    routes: [{ path: ROUTE_PATHS.capa, element: <CapaPage /> }],
  },
  {
    requiredPermissions: ['VIEW_NCR_LIST'],
    routes: [{ path: ROUTE_PATHS.ncr, element: <NcrPage /> }],
  },
  {
    requiredPermissions: ['VIEW_AUDIT_LIST'],
    routes: [{ path: ROUTE_PATHS.audits, element: <AuditsPage /> }],
  },
  {
    requiredPermissions: ['VIEW_REPORTS'],
    routes: [{ path: ROUTE_PATHS.reports, element: <ReportsPage /> }],
  },
  {
    requiredPermissions: ['VIEW_LOGIN_AUDITS'],
    routes: [{ path: ROUTE_PATHS.loginAudit, element: <LoginAuditsPage /> }],
  },
  {
    requiredPermissions: ['VIEW_ERROR_LOGS'],
    routes: [{ path: ROUTE_PATHS.logs, element: <ErrorLogsPage /> }],
  },
];
