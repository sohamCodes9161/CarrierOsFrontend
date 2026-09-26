import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import FormField, { fieldProps, inputClass } from '../components/forms/FormField.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useAction } from '../hooks/useAction.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateEmail } from '../utils/validation.js';

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const expired = Boolean(location.state?.expired);

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const submit = useAction(login);

  function update(field) {
    return (event) => {
      setValues((v) => ({ ...v, [field]: event.target.value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(values.email),
      password: values.password ? '' : 'Password is required',
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    const result = await submit.run({ email: values.email.trim(), password: values.password });
    if (result.ok) {
      const target = from?.pathname ? `${from.pathname}${from.search || ''}` : '/dashboard';
      navigate(target, { replace: true });
    }
  }

  return (
    <div className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to continue to your dashboard.</p>

      {expired && !submit.error && (
        <div role="status" className="alert alert-info mt-5 py-3 text-sm">
          <Icon name="info" className="h-5 w-5" />
          <span>Your session expired. Please sign in again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <ErrorAlert error={submit.error} />

        <FormField id="email" label="Email" error={errors.email}>
          <input
            {...fieldProps('email', errors.email)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass(errors.email)}
            value={values.email}
            onChange={update('email')}
            disabled={submit.loading}
            autoFocus
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password}>
          <PasswordInput
            {...fieldProps('password', errors.password)}
            error={errors.password}
            autoComplete="current-password"
            placeholder="Your password"
            value={values.password}
            onChange={update('password')}
            disabled={submit.loading}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={submit.loading}>
          {submit.loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to CareerOS?{' '}
        <Link to="/register" className="link link-primary font-medium no-underline hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
