import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') {
    return <LoadingScreen label="Restoring session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}