import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: currentRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sage-600">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated || currentRole !== role) {
    return <Navigate to={`/login/${role}`} state={{ from: location }} replace />;
  }

  return children;
}
