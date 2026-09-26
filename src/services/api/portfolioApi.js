import { api } from './client.js';

export const PORTFOLIO_SECTIONS = ['projects', 'experience', 'education', 'achievements'];

/** GET /portfolio (auto-created on first access) */
export async function getPortfolio() {
  const data = await api.get('/portfolio');
  return data.portfolio;
}

/** PATCH /portfolio { headline, bio, contact, skills, templateId, themeColor } */
export async function updatePortfolio(updates) {
  const data = await api.patch('/portfolio', updates);
  return data.portfolio;
}

/** POST /portfolio/quick-start */
export async function quickStart() {
  const data = await api.post('/portfolio/quick-start');
  return data.portfolio;
}

/** GET /portfolio/publish-readiness -> { ready, missing[] } */
export function getPublishReadiness() {
  return api.get('/portfolio/publish-readiness');
}

/** POST /portfolio/publish */
export async function publish() {
  const data = await api.post('/portfolio/publish');
  return data.portfolio;
}

/** POST /portfolio/unpublish */
export async function unpublish() {
  const data = await api.post('/portfolio/unpublish');
  return data.portfolio;
}

/** PATCH /portfolio/slug { slug } */
export async function updateSlug(slug) {
  const data = await api.patch('/portfolio/slug', { slug });
  return data.portfolio;
}

/** GET /portfolio/slug-availability/:slug (public) -> { available, reason? } */
export function checkSlugAvailability(slug, options) {
  return api.get(`/portfolio/slug-availability/${encodeURIComponent(slug)}`, { ...options, auth: false });
}

/** POST /portfolio/improve-content { section, text } -> { improvedText, changesSummary } */
export function improveContent({ section, text }) {
  return api.post('/portfolio/improve-content', { section, text }, { timeout: 90_000 });
}

/** GET /portfolio/public/:slug (public) */
export async function getPublicPortfolio(slug) {
  const data = await api.get(`/portfolio/public/${encodeURIComponent(slug)}`, { auth: false });
  return data.portfolio;
}

// --- Section CRUD: projects | experience | education | achievements ---
// Every call resolves to the full, updated portfolio document.

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

/** PATCH /portfolio/:section/reorder { orderedIds } - see VITE_ENABLE_REORDER in .env.example */
export async function reorderItems(section, orderedIds) {
  const data = await api.patch(`/portfolio/${section}/reorder`, { orderedIds });
  return data.portfolio;
}
