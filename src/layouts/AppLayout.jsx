import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import AppNavbar from '../components/layout/AppNavbar.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import { PageSkeleton } from '../components/ui/Skeleton.jsx';

const DRAWER_ID = 'app-drawer';

/** Authenticated shell: floating navbar on large screens, DaisyUI drawer on small ones. */
export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="drawer bg-page">
      <input
        id={DRAWER_ID}
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(e) => setDrawerOpen(e.target.checked)}
      />

      <div className="drawer-content relative flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgb(255_255_255_/_0.06),transparent)]" />
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-white px-3 py-2 text-sm font-medium text-black focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <AppNavbar drawerId={DRAWER_ID} />
        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-3 py-8 sm:px-6 sm:py-10">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-base-300 py-5 text-center text-xs text-faint">
          CareerOS · AI-assisted career tools
        </footer>
      </div>

      <div className="drawer-side z-40">
        <label 
          htmlFor={DRAWER_ID} 
          aria-label="Close navigation menu" 
          className={`drawer-overlay ${drawerOpen ? 'bg-black/60 backdrop-blur-sm' : ''}`} 
        />
        <MobileNav onNavigate={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
}