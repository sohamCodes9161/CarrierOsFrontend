import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import FormField, { fieldProps } from '../components/forms/FormField.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import { useAction } from '../hooks/useAction.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';
import { resetPassword } from '../services/api/authApi.js';

export default function ResetPassword() {
  useDocumentTitle('Choose new password');
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = useAction(resetPassword);

  if (!token) {
    return (
      <div className="surface p-6 sm:p-8 text-center">
        <h1 className="text-2xl font-bold text-base-content">Invalid link</h1>
        <p className="mt-2 text-sm text-muted">This password reset link is invalid or missing a token.</p>
        <div className="mt-6">
          <Link to="/forgot-password" className="btn btn-primary">Request a new link</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = password.length >= 8 ? '' : 'Password must be at least 8 characters';
    setError(validationError);
    if (validationError) return;

    const result = await submit.run({ token, newPassword: password });
    if (result.ok) {
      toast.success('Password reset successfully. You can now log in.');
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-base-content">Choose new password</h1>
      <p className="mt-1 text-sm text-muted">Enter a new secure password for your account.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <ErrorAlert error={submit.error} />

        <FormField id="password" label="New Password" error={error}>
          <PasswordInput
            {...fieldProps('password', error)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={submit.loading}
            autoFocus
          />
        </FormField>

        <Button type="submit" className="w-full" loading={submit.loading}>
          {submit.loading ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </div>
  );
}