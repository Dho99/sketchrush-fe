import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '../../../store/auth-store';

export function GuestRoute() {
  const location = useLocation();
  const { isAuthenticated, hasFetchedMe, isLoading } = useAuthStore();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  if (!hasFetchedMe && isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
