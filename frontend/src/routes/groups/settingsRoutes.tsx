import {
  CompanyProfilePage,
  MyProfilePage,
  SettingsPage,
  SmtpSettingsPage,
  StorageSettingsPage,
} from '../pageRegistry';
import { ROUTE_PATHS } from '../routePaths';
import type { PermissionRouteGroup } from '../routeTypes';

export const settingsRouteGroups: PermissionRouteGroup[] = [
  {
    requiredPermissions: ['VIEW_GENERAL_SETTINGS'],
    routes: [
      { path: ROUTE_PATHS.settings, element: <SettingsPage /> },
      { path: ROUTE_PATHS.settingsProfile, element: <MyProfilePage /> },
      { path: ROUTE_PATHS.settingsSmtp, element: <SmtpSettingsPage /> },
      { path: ROUTE_PATHS.settingsStorage, element: <StorageSettingsPage /> },
      { path: ROUTE_PATHS.settingsCompanyProfile, element: <CompanyProfilePage /> },
    ],
  },
];
