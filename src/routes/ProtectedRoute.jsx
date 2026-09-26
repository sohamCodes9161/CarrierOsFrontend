import { Navigate, Outlet, useLocation } from 'react-router-dom';

import FullPageLoader from '../components/common/FullPageLoader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Only renders child routes for authenticated users; everyone else goes to /login. */
export default function ProtectedRoute() {
  const { status, bootError, retry, sessionExpired } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader label="Checking your session…" />;

  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <ErrorState error={bootError} title="Can’t reach CareerOS" onRetry={retry} className="w-full" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location, expired: sessionExpired }} />;
  }

  return <Outlet />;
}
