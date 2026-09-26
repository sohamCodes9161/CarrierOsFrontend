import { api, AI_TIMEOUT_MS } from './client.js';

/** GET /career-profile - rejects with a 404 ApiError until one has been generated. */
export async function getCareerProfile() {
  const data = await api.get('/career-profile');
  return data.profile;
}

/** Same as getCareerProfile, but resolves to null when none exists yet. */
export async function getCareerProfileOrNull() {
  try {
    return await getCareerProfile();
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/** POST /career-profile/generate */
export async function generateCareerProfile() {
  const data = await api.post('/career-profile/generate', undefined, { timeout: AI_TIMEOUT_MS });
  return data.profile;
}
