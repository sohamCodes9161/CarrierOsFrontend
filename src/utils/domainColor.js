// Fixed hues for common engineering domains; anything else gets a stable color from a hash,
// so every roadmap looks color-coded even when the backend's category text varies.
const PALETTE = [
  { text: '#7DB4F0', bg: 'rgba(125,180,240,0.12)', border: 'rgba(125,180,240,0.35)' }, // blue
  { text: '#4CCB8C', bg: 'rgba(76,203,140,0.12)', border: 'rgba(76,203,140,0.35)' }, // green
  { text: '#F0B849', bg: 'rgba(240,184,73,0.12)', border: 'rgba(240,184,73,0.35)' }, // amber
  { text: '#F26D6D', bg: 'rgba(242,109,109,0.12)', border: 'rgba(242,109,109,0.35)' }, // red
  { text: '#C792EA', bg: 'rgba(199,146,234,0.12)', border: 'rgba(199,146,234,0.35)' }, // purple
  { text: '#5FD3D3', bg: 'rgba(95,211,211,0.12)', border: 'rgba(95,211,211,0.35)' }, // teal
];

const NAMED = {
  backend: 0,
  'back-end': 0,
  server: 0,
  api: 0,
  frontend: 1,
  'front-end': 1,
  ui: 1,
  client: 1,
  devops: 2,
  infra: 2,
  infrastructure: 2,
  deployment: 2,
  database: 3,
  databases: 3,
  data: 3,
  sql: 3,
  security: 4,
  core: 5,
  fundamentals: 5,
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Stable color for a topic's category/domain label. Known domains get a fixed hue. */
export function domainColor(category) {
  const key = (category || '').trim().toLowerCase();
  if (!key) return PALETTE[5];
  if (key in NAMED) return PALETTE[NAMED[key]];
  return PALETTE[hash(key) % PALETTE.length];
}
