import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import SectionCard from '../components/common/SectionCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import FormField, { fieldProps } from '../components/forms/FormField.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAction } from '../hooks/useAction.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, initials } from '../utils/format.js';
import { changePassword as changePasswordApi } from '../services/api/authApi.js';

export default function Account() {
  useDocumentTitle('Account');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [signingOut, setSigningOut] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const changePasswordAction = useAction(changePasswordApi);

  async function handleLogout() {
    setSigningOut(true);
    await logout();
    navigate('/login', { replace: true });
  }

  function handlePasswordChange(field) {
    return (e) => {
      setPasswords((p) => ({ ...p, [field]: e.target.value }));
      if (passwordErrors[field]) setPasswordErrors((errs) => ({ ...errs, [field]: '' }));
    };
  }

  async function submitPasswordChange(e) {
    e.preventDefault();
    const nextErrors = {
      currentPassword: passwords.currentPassword ? '' : 'Current password is required',
      newPassword: passwords.newPassword.length >= 8 ? '' : 'New password must be at least 8 characters',
    };
    setPasswordErrors(nextErrors);
    if (nextErrors.currentPassword || nextErrors.newPassword) return;

    const result = await changePasswordAction.run(passwords);
    if (result.ok) {
      toast.success('Password updated successfully. Please log in again.');
      await handleLogout();
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Account" description="Manage your profile and security settings." />

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

      <SectionCard title="Security" className="mt-4">
        <form onSubmit={submitPasswordChange} className="space-y-4 max-w-sm">
          <ErrorAlert error={changePasswordAction.error} />
          
          <FormField id="currentPassword" label="Current Password" error={passwordErrors.currentPassword}>
            <PasswordInput
              {...fieldProps('currentPassword', passwordErrors.currentPassword)}
              placeholder="Enter current password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              disabled={changePasswordAction.loading}
            />
          </FormField>
          
          <FormField id="newPassword" label="New Password" error={passwordErrors.newPassword}>
            <PasswordInput
              {...fieldProps('newPassword', passwordErrors.newPassword)}
              placeholder="At least 8 characters"
              value={passwords.newPassword}
              onChange={handlePasswordChange('newPassword')}
              disabled={changePasswordAction.loading}
            />
          </FormField>

          <Button type="submit" loading={changePasswordAction.loading}>
            Update password
          </Button>
        </form>
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