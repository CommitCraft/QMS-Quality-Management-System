import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/Spinner';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { authRoutes } from './routes/authRoutes';
import { ROUTE_PATHS } from './routes/routePaths';
import { PageNotFound } from './routes/pageRegistry';
import { permissionRouteGroups } from './routes/protectedRoutes';

const App = () => {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner /></div>}>
      <Routes>
        <Route element={<AuthLayout />}>
          {authRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />

            {permissionRouteGroups.map((group) => (
              <Route
                key={group.requiredPermissions.join('|')}
                element={<ProtectedRoute requiredPermissions={group.requiredPermissions} />}
              >
                {group.routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Route>
            ))}

            <Route path="*" element={<Navigate to={ROUTE_PATHS.pageNotFound} replace />} />
            <Route path={ROUTE_PATHS.pageNotFound} element={<PageNotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
