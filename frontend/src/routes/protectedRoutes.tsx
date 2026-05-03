import {
  accessControlRouteGroups,
  coreRouteGroups,
  documentRouteGroups,
  settingsRouteGroups,
  trainingRouteGroups,
} from './groups';
import type { PermissionRouteGroup } from './routeTypes';

export const permissionRouteGroups: PermissionRouteGroup[] = [
  ...coreRouteGroups,
  ...accessControlRouteGroups,
  ...documentRouteGroups,
  ...trainingRouteGroups,
  ...settingsRouteGroups,
];
