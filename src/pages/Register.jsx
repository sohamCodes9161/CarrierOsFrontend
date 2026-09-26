import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormField, { fieldProps, inputClass } from '../components/forms/FormField.jsx';
import PasswordInput from '../components/forms/PasswordInput.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAction } from '../hooks/useAction.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const submit = useAction(register);

  function update(field) {
    return (event) => {
      setValues((v) => ({ ...v, [field]: event.target.value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    };
  }

  function validate() {
    const name = values.name.trim();
    return {
      name: name.length < 2 ? 'Name must be at least 2 characters' : name.length > 100 ? 'Name must be 100 characters or fewer' : '',
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirm: values.confirm !== values.password ? 'Passwords do not match' : '',
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const result = await submit.run({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    if (result.ok) {
      toast.success('Account created. Welcome to CareerOS!');
      navigate('/dashboard', { replace: true });
    }
  }

  return (
    <div className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-white">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Start analyzing your resume and practicing interviews.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <ErrorAlert error={submit.error} />

        <FormField id="name" label="Full name" error={errors.name}>
          <input
            {...fieldProps('name', errors.name)}
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            maxLength={100}
            className={inputClass(errors.name)}
            value={values.name}
            onChange={update('name')}
            disabled={submit.loading}
            autoFocus
          />
        </FormField>

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
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
          <PasswordInput
            {...fieldProps('password', errors.password, true)}
            error={errors.password}
            autoComplete="new-password"
            placeholder="Create a password"
            value={values.password}
            onChange={update('password')}
            disabled={submit.loading}
          />
        </FormField>

        <FormField id="confirm" label="Confirm password" error={errors.confirm}>
          <PasswordInput
            {...fieldProps('confirm', errors.confirm)}
            error={errors.confirm}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={values.confirm}
            onChange={update('confirm')}
            disabled={submit.loading}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={submit.loading}>
          {submit.loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="link link-primary font-medium no-underline hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
