import { api, AI_TIMEOUT_MS } from './client.js';

/** POST /interviews/start */
export async function startInterview(payload) {
  const data = await api.post('/interviews/start', payload, { timeout: AI_TIMEOUT_MS });
  return data.interview;
}

/** GET /interviews */
export async function listInterviews() {
  const data = await api.get('/interviews');
  return data.interviews;
}

/** GET /interviews/:id */
export async function getInterview(id, options) {
  const data = await api.get(`/interviews/${encodeURIComponent(id)}`, options);
  return data.interview;
}

/** POST /interviews/:id/answer { answerText } -> interview */
export async function submitAnswer(id, answerText) {
  const data = await api.post(`/interviews/${encodeURIComponent(id)}/answer`, { answerText }, { timeout: AI_TIMEOUT_MS });
  return data.interview;
}

/** POST /interviews/:id/answer/audio (multipart field `answer`) -> { interview, transcript } */
export async function submitAudioAnswer(id, file) {
  const form = new FormData();
  form.append('answer', file);
  return api.post(`/interviews/${encodeURIComponent(id)}/answer/audio`, form, { timeout: AI_TIMEOUT_MS });
}
