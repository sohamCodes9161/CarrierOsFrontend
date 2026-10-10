import { api } from './client.js';

export const PORTFOLIO_SECTIONS = ['projects', 'experience', 'education', 'achievements'];

export async function getPortfolio() {
  const data = await api.get('/portfolio');
  return data.portfolio;
}

export async function updatePortfolio(updates) {
  const data = await api.patch('/portfolio', updates);
  return data.portfolio;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  
  // THE FIX: Do NOT manually set the Content-Type header. 
  // Axios/Fetch will do it automatically and include the required 'boundary'
  const data = await api.post('/portfolio/photo', formData);
  
  return data.portfolio;
}
export async function quickStart() {
  const data = await api.post('/portfolio/quick-start');
  return data.portfolio;
}

export function getPublishReadiness() {
  return api.get('/portfolio/publish-readiness');
}

export async function publish() {
  const data = await api.post('/portfolio/publish');
  return data.portfolio;
}

export async function unpublish() {
  const data = await api.post('/portfolio/unpublish');
  return data.portfolio;
}

export async function updateSlug(slug) {
  const data = await api.patch('/portfolio/slug', { slug });
  return data.portfolio;
}

export function checkSlugAvailability(slug, options) {
  return api.get(`/portfolio/slug-availability/${encodeURIComponent(slug)}`, { ...options, auth: false });
}

export function improveContent({ section, text }) {
  return api.post('/portfolio/improve-content', { section, text }, { timeout: 90_000 });
}

export async function getPublicPortfolio(slug) {
  const data = await api.get(`/portfolio/public/${encodeURIComponent(slug)}`, { auth: false });
  return data.portfolio;
}

export async function addItem(section, item) {
  const data = await api.post(`/portfolio/${section}`, item);
  return data.portfolio;
}

export async function updateItem(section, itemId, updates) {
  const data = await api.patch(`/portfolio/${section}/${encodeURIComponent(itemId)}`, updates);
  return data.portfolio;
}

export async function removeItem(section, itemId) {
  const data = await api.delete(`/portfolio/${section}/${encodeURIComponent(itemId)}`);
  return data.portfolio;
}

export async function reorderItems(section, orderedIds) {
  const data = await api.patch(`/portfolio/${section}/reorder`, { orderedIds });
  return data.portfolio;
}

export async function curateSkills() {
  const data = await api.post('/portfolio/curate-skills');
  return data.portfolio;
}