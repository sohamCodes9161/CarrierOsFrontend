import { api, AI_TIMEOUT_MS } from './client.js';

/** POST /roadmap/generate { targetRole, targetSkills } */
export async function generateRoadmap({ targetRole, targetSkills }) {
  const data = await api.post('/roadmap/generate', { targetRole, targetSkills }, { timeout: AI_TIMEOUT_MS });
  return data.roadmap;
}

/** GET /roadmap */
export async function listRoadmaps() {
  const data = await api.get('/roadmap');
  return data.roadmaps;
}

/** GET /roadmap/:id */
export async function getRoadmap(id) {
  const data = await api.get(`/roadmap/${encodeURIComponent(id)}`);
  return data.roadmap;
}

/** PATCH /roadmap/:id/nodes/:nodeId/status { status } */
export async function updateNodeStatus(id, nodeId, status) {
  const data = await api.patch(`/roadmap/${encodeURIComponent(id)}/nodes/${encodeURIComponent(nodeId)}/status`, { status });
  return data.roadmap;
}
