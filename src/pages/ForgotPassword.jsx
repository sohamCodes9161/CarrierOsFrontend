import { useState } from 'react';
import { Link } from 'react-router-dom';

import FormField, { fieldProps, inputClass } from '../components/forms/FormField.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import { useAction } from '../hooks/useAction.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateEmail } from '../utils/validation.js';
import { forgotPassword } from '../services/api/authApi.js';

export default function ForgotPassword() {
  useDocumentTitle('Forgot password');
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const submit = useAction(forgotPassword);

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateEmail(email);
    setError(validationError);
    if (validationError) return;

    const result = await submit.run(email.trim());
    if (result.ok) {
      setSuccess(true);
    }
  }

  return (
    <div className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-base-content">Reset password</h1>
      <p className="mt-1 text-sm text-muted">Enter your email address and we'll send you a link to reset your password.</p>

      {success ? (
        <div className="mt-6 rounded-md bg-success/10 p-4 text-sm text-success">
          <p>If an account exists with that email, a reset link has been sent. Please check your inbox (and spam folder).</p>
          <div className="mt-4">
            <Link to="/login" className="font-medium hover:underline">
              Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <ErrorAlert error={submit.error} />

          <FormField id="email" label="Email" error={error}>
            <input
              {...fieldProps('email', error)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass(error)}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              disabled={submit.loading}
              autoFocus
            />
          </FormField>

          <Button type="submit" className="w-full" loading={submit.loading}>
            {submit.loading ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
      )}

      {!success && (
        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{' '}
          <Link to="/login" className="link link-primary font-medium no-underline hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}