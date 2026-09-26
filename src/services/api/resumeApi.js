import { api, AI_TIMEOUT_MS } from './client.js';

/** POST /resumes/analyze (multipart: `resume` file, optional `jobDescription`) -> { resume, analysis } */
export function analyzeResume({ file, jobDescription }) {
  const form = new FormData();
  form.append('resume', file);
  if (jobDescription && jobDescription.trim()) form.append('jobDescription', jobDescription.trim());
  return api.post('/resumes/analyze', form, { timeout: AI_TIMEOUT_MS });
}

/** GET /resumes/analyses */
export async function listAnalyses() {
  const data = await api.get('/resumes/analyses');
  return data.analyses;
}

/** GET /resumes/analyses/:id */
export async function getAnalysis(id) {
  const data = await api.get(`/resumes/analyses/${encodeURIComponent(id)}`);
  return data.analysis;
}

/** DELETE /resumes/:id (takes the *resume* id, not the analysis id) */
export function deleteResume(resumeId) {
  return api.delete(`/resumes/${encodeURIComponent(resumeId)}`);
}
