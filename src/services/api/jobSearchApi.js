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

/** POST /job-applications (Redirected from the search module to the tracker module) */
export async function convertPostingToApplication(jobId, initialStatus = 'applied', customJobData = {}) {
  // We send the extracted job data directly to your job applications tracker endpoint
  return api.post('/job-applications', {
    ...customJobData,
    status: initialStatus,
  });
}