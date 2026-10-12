import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FullPageLoader from '../components/common/FullPageLoader.jsx';

export default function AdminRoute() {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return <FullPageLoader />;
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kick non-admins back to the normal dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}