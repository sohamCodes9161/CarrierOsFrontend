import { Link, Outlet } from 'react-router-dom';

import Logo from '../components/layout/Logo.jsx';

/** Centered card layout for login / register. */
export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-page">
      <div className="grid-veil pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link to="/" aria-label="CareerOS home">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
