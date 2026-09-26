import { Navigate, Outlet } from 'react-router-dom';

import FullPageLoader from '../components/common/FullPageLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Login/register pages: signed-in users are sent to the dashboard instead. */
export default function PublicOnlyRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
