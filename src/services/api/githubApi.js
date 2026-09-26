import { api, AI_TIMEOUT_MS } from './client.js';

/** POST /github/analyze { username } */
export async function analyzeProfile(username) {
  const data = await api.post('/github/analyze', { username }, { timeout: AI_TIMEOUT_MS });
  return data.analysis;
}

/** GET /github/analyses */
export async function listAnalyses() {
  const data = await api.get('/github/analyses');
  return data.analyses;
}

/** GET /github/analyses/:id */
export async function getAnalysis(id) {
  const data = await api.get(`/github/analyses/${encodeURIComponent(id)}`);
  return data.analysis;
}
