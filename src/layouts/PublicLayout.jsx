import { Link, Outlet } from 'react-router-dom';

import Logo from '../components/layout/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Marketing shell for the landing page. */
export default function PublicLayout() {
  const { status } = useAuth();
  const authed = status === 'authenticated';

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-3 z-30 px-3 sm:top-4 sm:px-6">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-base-300 bg-surface-3/90 px-4 shadow-pop backdrop-blur-md sm:px-5">
          <Link to="/" aria-label="CareerOS home">
            <Logo />
          </Link>
          <nav aria-label="Account" className="flex items-center gap-2">
            {authed ? (
              <Button as={Link} to="/dashboard" size="sm">
                Open dashboard
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button as={Link} to="/register" size="sm">
                  Get started
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-base-300 py-6 text-center text-xs text-faint">© {new Date().getFullYear()} CareerOS</footer>
    </div>
  );
}
