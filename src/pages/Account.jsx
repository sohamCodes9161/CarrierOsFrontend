import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import SectionCard from '../components/common/SectionCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatDate, initials } from '../utils/format.js';

export default function Account() {
  useDocumentTitle('Account');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Account" description="Your sign-in details." />

      <SectionCard title="Profile">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-content">
            {initials(user?.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{user?.name}</p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-base-300 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Member since</dt>
            <dd className="mt-1">{formatDate(user?.createdAt)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Sign-in method</dt>
            <dd className="mt-1">Email and password</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Session" className="mt-4">
        <p className="text-sm text-muted">Signing out ends your session on this device.</p>
        <Button variant="outline" className="mt-4" onClick={handleLogout} loading={signingOut}>
          <Icon name="logout" className="h-4 w-4" />
          Sign out
        </Button>
      </SectionCard>
    </div>
  );
}
