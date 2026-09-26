import { Link, NavLink, useNavigate } from 'react-router-dom';

import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import { NAV_ITEMS } from '../../utils/constants.js';
import { initials } from '../../utils/format.js';

const QUICK_ACTIONS = [
  { to: '/interviews/new', label: 'New mock interview', icon: 'microphone' },
  { to: '/resume', label: 'Analyze a resume', icon: 'document' },
  { to: '/github', label: 'Analyze a GitHub profile', icon: 'code' },
  { to: '/roadmap', label: 'Generate a roadmap', icon: 'map' },
];

// DaisyUI dropdowns stay open while focused; blur to close after a selection.
function closeDropdown() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

/** Floating pill navbar: detached from the top edge, dark surface, hairline border. */
export default function AppNavbar({ drawerId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    closeDropdown();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-3 z-30 px-3 sm:top-4 sm:px-6">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-full border border-base-300 bg-surface-3/90 px-3 shadow-pop backdrop-blur-md">
        <label htmlFor={drawerId} className="btn btn-ghost btn-sm btn-square rounded-full lg:hidden" aria-label="Open navigation menu">
          <Icon name="menu" className="h-5 w-5" />
        </label>

        <Link to="/dashboard" className="mr-2 flex items-center pl-1" aria-label="CareerOS home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('nav-pill', isActive && 'nav-pill-active')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-primary btn-sm gap-1 rounded-full" aria-label="Quick actions">
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </div>
            <ul
              tabIndex={0}
              onClick={closeDropdown}
              className="menu dropdown-content z-50 mt-2 w-64 rounded-box border border-base-300 bg-surface-3 p-2 shadow-pop"
            >
              {QUICK_ACTIONS.map((action) => (
                <li key={action.to}>
                  <Link to={action.to} className="rounded-btn">
                    <Icon name={action.icon} className="h-4 w-4" />
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm" aria-label="Account menu">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                {initials(user?.name)}
              </span>
            </div>
            <ul tabIndex={0} className="menu dropdown-content z-50 mt-2 w-64 rounded-box border border-base-300 bg-surface-3 p-2 shadow-pop">
              <li className="pointer-events-none px-3 py-2">
                <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </li>
              <li>
                <Link to="/account" onClick={closeDropdown} className="rounded-btn">
                  <Icon name="user" className="h-4 w-4" />
                  Account
                </Link>
              </li>
              <li>
                <button type="button" onClick={handleLogout} className="rounded-btn">
                  <Icon name="logout" className="h-4 w-4" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
