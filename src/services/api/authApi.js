import { api, refreshAccessToken, setAccessToken } from './client.js';

/** POST /auth/register -> { user, accessToken } (+ refresh cookie) */
export async function register({ name, email, password }) {
  const data = await api.post('/auth/register', { name, email, password }, { auth: false });
  setAccessToken(data.accessToken);
  return data.user;
}

/** POST /auth/login -> { user, accessToken } (+ refresh cookie) */
export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password }, { auth: false });
  setAccessToken(data.accessToken);
  return data.user;
}

/** POST /auth/logout - revokes the refresh token and clears the cookie. */
export async function logout() {
  try {
    await api.post('/auth/logout', undefined, { auth: false });
  } finally {
    setAccessToken(null);
  }
}

/** GET /auth/me */
export async function getMe() {
  const data = await api.get('/auth/me');
  return data.user;
}

/**
 * Restores a session on page load: the refresh cookie is exchanged for an
 * access token, then the current user is loaded.
 */
export async function restoreSession() {
  await refreshAccessToken();
  return getMe();
}
