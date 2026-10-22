import { useState, useEffect } from 'react';
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
  { to: '/guide', label: 'View guide', icon: 'book' }
];

function closeDropdown() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

export default function AppNavbar({ drawerId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem('careeros_theme') || 'careeros'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.backgroundColor = theme === 'careeros-light' ? '#F8FAFC' : '#050505';
    localStorage.setItem('careeros_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'careeros' ? 'careeros-light' : 'careeros'));
  };

  async function handleLogout() {
    closeDropdown();
    await logout();
    navigate('/login', { replace: true });
  }

  const mainNavLinks = [...NAV_ITEMS];

  if (user?.role === 'admin') {
    mainNavLinks.push({ to: '/admin', label: 'Admin' });
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

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden flex-1 items-center gap-0.5 lg:flex">
          {mainNavLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('nav-pill', isActive && 'nav-pill-active')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Quick Actions & User Profile */}
        <div className="ml-auto flex items-center gap-2">
          
          {/* THEME TOGGLE BUTTON - Fixed Visibility */}
          <button
            onClick={toggleTheme}
            className="btn btn-circle btn-sm border border-base-300 bg-base-200 text-base-content hover:bg-base-300"
            aria-label="Toggle theme"
          >
            {theme === 'careeros' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-base-content text-xs font-semibold text-base-100">
                {initials(user?.name)}
              </span>
            </div>
            <ul tabIndex={0} className="menu dropdown-content z-50 mt-2 w-64 rounded-box border border-base-300 bg-surface-3 p-2 shadow-pop">
              <li className="pointer-events-none px-3 py-2">
                <p className="truncate text-sm font-semibold text-base-content">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </li>
              <li>
                <Link to="/account" onClick={closeDropdown} className="rounded-btn">
                  <Icon name="user" className="h-4 w-4" />
                  Account
                </Link>
              </li>
              {user?.role === 'admin' && (
                <li className="lg:hidden">
                  <Link to="/admin" onClick={closeDropdown} className="rounded-btn text-primary">
                    <Icon name="shield" className="h-4 w-4" />
                    Admin Center
                  </Link>
                </li>
              )}
              <li>
                <button type="button" onClick={handleLogout} className="rounded-btn text-error hover:bg-error/10 hover:text-error">
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