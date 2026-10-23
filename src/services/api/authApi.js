import { api, refreshAccessToken, setAccessToken } from './client.js';

// STEP 1: Just sends the details and triggers the OTP email (No token yet)
export async function register({ name, email, password }) {
  const data = await api.post('/auth/register', { name, email, password }, { auth: false });
  return data; 
}

// STEP 2: Sends the OTP, verifies the account, and gets the token
export async function verifyRegistration({ email, otp }) {
  const data = await api.post('/auth/verify-registration', { email, otp }, { auth: false });
  setAccessToken(data.accessToken);
  return data; // Return the full data object so Register.jsx can extract data.user and data.accessToken
}

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password }, { auth: false });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  try {
    await api.post('/auth/logout', undefined, { auth: false });
  } finally {
    setAccessToken(null);
  }
}

export async function getMe() {
  const data = await api.get('/auth/me');
  return data.user;
}

export async function restoreSession() {
  await refreshAccessToken();
  return getMe();
}

// Password Management API Calls
export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email }, { auth: false });
}

export async function resetPassword({ token, newPassword }) {
  return api.post('/auth/reset-password', { token, newPassword }, { auth: false });
}

export async function changePassword({ currentPassword, newPassword }) {
  return api.post('/auth/change-password', { currentPassword, newPassword });
}