import { NavLink, useNavigate } from 'react-router-dom';

import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../utils/cn.js';
import { NAV_ITEMS } from '../../utils/constants.js';

/** Drawer content for small screens. */
export default function MobileNav({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    onNavigate?.();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="flex min-h-full w-72 max-w-[85vw] flex-col border-r border-base-300 bg-surface-3 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Logo />
        <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={onNavigate} aria-label="Close navigation menu">
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Main" className="flex-1">
        <ul className="menu gap-1 p-0">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) => cn('rounded-btn gap-3 text-white/80', isActive && 'bg-white text-black hover:bg-white hover:text-black')}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 border-t border-base-300 pt-4">
        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
        <p className="mb-3 truncate text-xs text-muted">{user?.email}</p>
        <div className="flex gap-2">
          <NavLink to="/account" onClick={onNavigate} className="btn btn-outline btn-sm flex-1 rounded-full">
            Account
          </NavLink>
          <button type="button" className="btn btn-ghost btn-sm flex-1 gap-1 rounded-full" onClick={handleLogout}>
            <Icon name="logout" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
