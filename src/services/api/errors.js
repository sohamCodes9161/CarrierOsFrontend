/**
 * Normalized error thrown by the API client.
 * `message` is always safe to show to a user.
 */
export class ApiError extends Error {
  constructor({ status = 0, message, details = [], code = '', serverMessage = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.code = code;
    this.serverMessage = serverMessage;
  }
}

const FALLBACK_MESSAGES = {
  400: 'Some of the information you entered is invalid.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to do that.',
  404: 'The requested resource was not found.',
  409: 'This conflicts with existing data.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again.',
  502: 'The AI service had a problem with this request. Please try again in a moment.',
  503: 'A required service is unavailable right now. Please try again later.',
};

// Statuses where the backend's own message is written for end users (AppError subclasses).
const USER_SAFE_STATUSES = new Set([400, 401, 403, 404, 409, 429]);

export function buildApiError(status, payload) {
  const serverMessage = typeof payload?.message === 'string' ? payload.message.trim() : '';
  const details = Array.isArray(payload?.errors) ? payload.errors.filter((e) => typeof e === 'string') : [];

  let message;
  if (USER_SAFE_STATUSES.has(status) && serverMessage) {
    message = serverMessage;
  } else {
    message = FALLBACK_MESSAGES[status] || (status >= 500 ? FALLBACK_MESSAGES[500] : FALLBACK_MESSAGES[400]);
  }

  return new ApiError({ status, message, details, serverMessage });
}

export function networkError() {
  return new ApiError({
    status: 0,
    code: 'NETWORK',
    message: 'Unable to connect to the server. Check your connection and try again.',
  });
}

export function timeoutError() {
  return new ApiError({
    status: 0,
    code: 'TIMEOUT',
    message: 'The request took too long. Please try again.',
  });
}

export function sessionExpiredError() {
  return new ApiError({
    status: 401,
    code: 'SESSION_EXPIRED',
    message: 'Your session has expired. Please log in again.',
  });
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

export function getErrorDetails(error) {
  return error instanceof ApiError ? error.details : [];
}
