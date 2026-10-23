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
import { authApi } from '../services/api/index.js'; // Adjust path if needed

export default function Register() {
  useDocumentTitle('Create account');
  const { setSession } = useAuth(); // Assuming your auth context has a way to manually set the session
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '', otp: '' });
  const [errors, setErrors] = useState({});
  
  const submitDetails = useAction((data) => authApi.register(data));
  const submitOtp = useAction((data) => authApi.verifyRegistration(data)); // You'll need to add this to your api service

  function update(field) {
    return (event) => {
      setValues((v) => ({ ...v, [field]: event.target.value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
    };
  }

  function validateDetails() {
    const name = values.name.trim();
    return {
      name: name.length < 2 ? 'Name must be at least 2 characters' : name.length > 100 ? 'Name must be 100 characters or fewer' : '',
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirm: values.confirm !== values.password ? 'Passwords do not match' : '',
    };
  }

  async function handleDetailsSubmit(event) {
    event.preventDefault();
    const nextErrors = validateDetails();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const result = await submitDetails.run({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    if (result.ok) {
      toast.success('Verification code sent to your email.');
      setStep('otp');
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();
    if (!values.otp || values.otp.length < 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return;
    }

    const result = await submitOtp.run({ email: values.email.trim(), otp: values.otp.trim() });
    if (result.ok) {
      toast.success('Account verified! Welcome to CareerOS.');
      setSession(result.data.user, result.data.accessToken); // Update your context
      navigate('/dashboard', { replace: true });
    }
  }

  if (step === 'otp') {
    return (
      <div className="surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-base-content">Verify your email</h1>
        <p className="mt-1 text-sm text-muted">We sent a 6-digit code to <strong>{values.email}</strong>.</p>

        <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
          <ErrorAlert error={submitOtp.error} />

          <FormField id="otp" label="Verification Code" error={errors.otp}>
            <input
              {...fieldProps('otp', errors.otp)}
              type="text"
              maxLength={6}
              placeholder="123456"
              className={`${inputClass(errors.otp)} text-center text-xl tracking-widest`}
              value={values.otp}
              onChange={update('otp')}
              disabled={submitOtp.loading}
              autoFocus
            />
          </FormField>

          <Button type="submit" className="w-full" loading={submitOtp.loading}>
            {submitOtp.loading ? 'Verifying…' : 'Verify and Create Account'}
          </Button>
          
          <div className="mt-4 text-center">
             <button type="button" onClick={() => setStep('details')} className="text-sm text-muted hover:text-base-content">
               &larr; Back to edit details
             </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="surface p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-base-content">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Start analyzing your resume and practicing interviews.</p>

      <form onSubmit={handleDetailsSubmit} noValidate className="mt-6 space-y-4">
        <ErrorAlert error={submitDetails.error} />

        <FormField id="name" label="Full name" error={errors.name}>
          <input {...fieldProps('name', errors.name)} type="text" placeholder="Jane Doe" className={inputClass(errors.name)} value={values.name} onChange={update('name')} disabled={submitDetails.loading} autoFocus />
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          <input {...fieldProps('email', errors.email)} type="email" placeholder="you@example.com" className={inputClass(errors.email)} value={values.email} onChange={update('email')} disabled={submitDetails.loading} />
        </FormField>

        <FormField id="password" label="Password" error={errors.password} hint="At least 8 characters.">
          <PasswordInput {...fieldProps('password', errors.password, true)} placeholder="Create a password" value={values.password} onChange={update('password')} disabled={submitDetails.loading} />
        </FormField>

        <FormField id="confirm" label="Confirm password" error={errors.confirm}>
          <PasswordInput {...fieldProps('confirm', errors.confirm)} placeholder="Repeat your password" value={values.confirm} onChange={update('confirm')} disabled={submitDetails.loading} />
        </FormField>

        <Button type="submit" className="w-full" loading={submitDetails.loading}>
          {submitDetails.loading ? 'Sending code…' : 'Continue'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="link link-primary font-medium no-underline hover:underline">Sign in</Link>
      </p>
    </div>
  );
}