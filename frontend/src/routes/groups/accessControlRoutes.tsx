import {
  PermissionsPage,
  RoleUsersPage,
  RolesPage,
  UsersPage,
} from '../pageRegistry';
import { ROUTE_PATHS } from '../routePaths';
import type { PermissionRouteGroup } from '../routeTypes';

export const accessControlRouteGroups: PermissionRouteGroup[] = [
  {
    requiredPermissions: ['VIEW_USERS'],
    routes: [{ path: ROUTE_PATHS.users, element: <UsersPage /> }],
  },
  {
    requiredPermissions: ['VIEW_ROLES'],
    routes: [
      { path: ROUTE_PATHS.roles, element: <RolesPage /> },
      { path: ROUTE_PATHS.rolesManage, element: <RolesPage /> },
    ],
  },
  {
    requiredPermissions: ['VIEW_ROLE_USER'],
    routes: [{ path: ROUTE_PATHS.roleUsers, element: <RoleUsersPage /> }],
  },
  {
    requiredPermissions: ['VIEW_PERMISSIONS'],
    routes: [{ path: ROUTE_PATHS.permissions, element: <PermissionsPage /> }],
  },
];
