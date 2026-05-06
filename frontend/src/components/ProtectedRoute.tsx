import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export type ProtectedRouteProps = {
  requiredPermissions?: string[];
};

const hasAnyPermission = (
  userPermissions: string[] | undefined,
  requiredPermissions?: string[],
) => {
  if (!requiredPermissions?.length) {
    return true;
  }

  if (!userPermissions?.length) {
    return false;
  }

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
};

export const ProtectedRoute = ({
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-steel-950 text-steel-200">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
        state={{ from: returnTo }}
      />
    );
  }

  // if (!hasAnyPermission(user?.permissions, requiredPermissions)) {
  //   return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />;
  // }

  return <Outlet />;
};