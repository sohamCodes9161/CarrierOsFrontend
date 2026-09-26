import { ApiError, buildApiError, networkError, sessionExpiredError, timeoutError } from './errors.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, '');

const DEFAULT_TIMEOUT_MS = 60_000;
export const AI_TIMEOUT_MS = 180_000; // AI-backed endpoints can be slow (interview start has taken 45s+)

// The access token lives in memory only. The long-lived refresh token is an
// httpOnly cookie managed by the backend, so JavaScript never touches it.
let accessToken = null;
let refreshPromise = null;
let authFailureHandler = null;

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

/** Called when the session can no longer be refreshed (expired/revoked). */
export function setAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

function handleAuthFailure() {
  accessToken = null;
  if (typeof authFailureHandler === 'function') authFailureHandler();
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  // e.g. express-rate-limit's default 429 body is plain text. Never surface HTML error pages.
  if (text.length < 200 && !text.includes('<')) return { message: text.trim() };
  return null;
}

async function send(path, { method = 'GET', body, headers, signal, timeout = DEFAULT_TIMEOUT_MS, token } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const init = {
    method,
    credentials: 'include', // needed so the refresh-token cookie is sent/received
    signal: controller.signal,
    headers: { Accept: 'application/json', ...headers },
  };
  if (token) init.headers.Authorization = `Bearer ${token}`;

  if (body instanceof FormData) {
    init.body = body; // the browser sets the multipart boundary itself
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    const payload = await parseBody(res);
    return { res, payload };
  } catch (err) {
    if (timedOut) throw timeoutError();
    if (err?.name === 'AbortError') throw err; // caller cancelled
    throw networkError();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exchanges the refresh-token cookie for a new access token.
 * The backend rotates refresh tokens (each is single-use), so concurrent
 * callers must share one in-flight request or the second would be rejected.
 */
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = send('/auth/refresh', { method: 'POST' })
      .then(({ res, payload }) => {
        if (!res.ok) throw buildApiError(res.status, payload);
        const token = payload?.data?.accessToken;
        if (!token) throw buildApiError(401, null);
        accessToken = token;
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Performs an API request and returns the unwrapped `data` field of the
 * backend's `{ success, message?, data }` envelope.
 *
 * options: { method, body, auth = true, timeout, signal }
 */
export async function request(path, { auth = true, ...options } = {}) {
  let { res, payload } = await send(path, { ...options, token: auth ? accessToken : null });

  if (res.status === 401 && auth) {
    let token;
    try {
      token = await refreshAccessToken();
    } catch (err) {
      const isAuthRejection = err instanceof ApiError && err.status >= 400 && err.status < 500;
      if (isAuthRejection) {
        handleAuthFailure();
        throw sessionExpiredError();
      }
      throw err; // network problem etc. - don't log the user out for that
    }
    ({ res, payload } = await send(path, { ...options, token }));
    if (res.status === 401) {
      handleAuthFailure();
      throw sessionExpiredError();
    }
  }

  if (!res.ok) throw buildApiError(res.status, payload);
  return payload?.data ?? null;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
