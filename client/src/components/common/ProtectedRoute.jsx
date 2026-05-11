import { Navigate, useLocation } from 'react-router-dom';
import { useMe } from '../../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isPending, isError, data } = useMe();

  if (isPending) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
