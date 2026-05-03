import { ChangePasswordPage, ForgotPasswordPage, LoginPage } from './pageRegistry';
import { ROUTE_PATHS } from './routePaths';
import type { RouteDefinition } from './routeTypes';

export const authRoutes: RouteDefinition[] = [
  { path: ROUTE_PATHS.login, element: <LoginPage />, meta: { title: 'Login', feature: 'auth' } },
  { path: ROUTE_PATHS.forgotPassword, element: <ForgotPasswordPage />, meta: { title: 'Forgot Password', feature: 'auth' } },
  { path: ROUTE_PATHS.changePassword, element: <ChangePasswordPage />, meta: { title: 'Change Password', feature: 'auth' } },
];
