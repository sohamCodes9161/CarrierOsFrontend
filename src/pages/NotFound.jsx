import { Link } from 'react-router-dom';

import Logo from '../components/layout/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { status } = useAuth();
  const target = status === 'authenticated' ? '/dashboard' : '/';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 px-4 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">The page you’re looking for doesn’t exist or may have been moved.</p>
      <Button as={Link} to={target} className="mt-6">
        {status === 'authenticated' ? 'Back to dashboard' : 'Back to home'}
      </Button>
    </div>
  );
}
