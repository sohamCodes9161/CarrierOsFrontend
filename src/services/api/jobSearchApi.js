import { api } from './client.js';

/** GET /job-search?search=&location=&page=&limit= */
export async function searchJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/job-search${query ? `?${query}` : ''}`);
}

/** GET /job-search/:id */
export async function getJobPostingById(id) {
  return api.get(`/job-search/${encodeURIComponent(id)}`);
}

/** POST /job-search/convert */
export async function convertPostingToApplication(jobId, initialStatus = 'applied', customJobData = {}) {
  return api.post('/job-search/convert', {
    jobId,
    initialStatus,
    customJobData,
  });
}