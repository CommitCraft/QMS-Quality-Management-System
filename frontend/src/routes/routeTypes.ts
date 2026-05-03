import type { ReactNode } from 'react';

export type RouteMeta = {
  title?: string;
  feature?: string;
  breadcrumb?: string;
};

export type RouteDefinition = {
  path: string;
  element: ReactNode;
  meta?: RouteMeta;
};

export type PermissionRouteGroup = {
  requiredPermissions: string[];
  routes: RouteDefinition[];
};
