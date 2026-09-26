// These rules mirror the backend's zod validators so users get instant feedback.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){2,38}$/;

export function validateEmail(value) {
  const email = (value || '').trim();
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return '';
}

export function validateUrl(value) {
  const v = (value || '').trim();
  if (!v) return '';
  try {
    const url = new URL(v);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'Enter a full URL starting with https://';
    return '';
  } catch {
    return 'Enter a full URL starting with https://';
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
