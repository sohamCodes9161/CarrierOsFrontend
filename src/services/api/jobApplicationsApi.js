import { api } from './client.js';

/** GET /job-applications */
export async function getJobApplications(params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/job-applications${query ? `?${query}` : ''}`);
}

/** GET /job-applications/stats */
export async function getApplicationStats() {
  return api.get('/job-applications/stats');
}

/** GET /job-applications/recommendations */
export async function getRecommendedJobs(searchQuery = '') {
  const query = searchQuery ? `?searchQuery=${encodeURIComponent(searchQuery)}` : '';
  return api.get(`/job-applications/recommendations${query}`);
}

/** POST /job-applications */
export async function createJobApplication(data) {
  return api.post('/job-applications', data);
}

/** GET /job-applications/:id */
export async function getJobApplicationById(id) {
  return api.get(`/job-applications/${encodeURIComponent(id)}`);
}

/** PATCH /job-applications/:id */
export async function updateJobApplication(id, data) {
  return api.patch(`/job-applications/${encodeURIComponent(id)}`, data);
}

/** DELETE /job-applications/:id */
export async function deleteJobApplication(id) {
  return api.delete(`/job-applications/${encodeURIComponent(id)}`);
}