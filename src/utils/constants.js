export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/resume', label: 'Resume', icon: 'document' },
  { to: '/github', label: 'GitHub', icon: 'code' },
  { to: '/interviews', label: 'Interviews', icon: 'microphone' },
  { to: '/career-profile', label: 'Profile', icon: 'user' },
  { to: '/roadmap', label: 'Roadmap', icon: 'map' },
  { to: '/portfolio', label: 'Portfolio', icon: 'globe' },
  { to: '/jobs', label: 'Job Tracker', icon: 'briefcase' },
  { to: '/quizzes', label: 'Adaptive Quiz', icon: 'quiz' },
];

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', hint: 'Conversational, fundamentals' },
  { value: 'medium', label: 'Medium', hint: 'Scenarios and trade-offs' },
  { value: 'hard', label: 'Hard', hint: 'Edge cases and internals' },
];

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'dsa', label: 'DSA (describe your approach)' },
];

export const ROADMAP_STATUSES = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
];

export const READINESS_LEVELS = {
  'early-stage': { label: 'Early stage', tone: 'error' },
  developing: { label: 'Developing', tone: 'warning' },
  'job-ready': { label: 'Job ready', tone: 'info' },
  strong: { label: 'Strong', tone: 'success' },
};

export const THEME_COLORS = ['#2563EB', '#0F766E', '#111827', '#B45309', '#BE123C', '#4D7C0F'];

export const LIMITS = {
  resumeBytes: 5 * 1024 * 1024,
  audioBytes: 15 * 1024 * 1024,
  jobDescription: 5000,
  answer: 5000,
  headline: 150,
  bio: 2000,
};

// Enabled only once the backend's reorder routes are reachable (see .env.example).
export const REORDER_ENABLED = import.meta.env.VITE_ENABLE_REORDER === 'true';

export const SKILL_LEVEL_TONES = { beginner: 'warning', intermediate: 'info', advanced: 'success' };

export const APPLICATION_STATUSES = [
  { key: 'bookmarked', label: 'Bookmarked', color: 'badge-ghost' },
  { key: 'applied', label: 'Applied', color: 'badge-info' },
  { key: 'screening', label: 'Screening', color: 'badge-warning' },
  { key: 'interviewing', label: 'Interviewing', color: 'badge-secondary' },
  { key: 'offered', label: 'Offered', color: 'badge-success' },
  { key: 'rejected', label: 'Rejected', color: 'badge-error' },
  { key: 'withdrawn', label: 'Withdrawn', color: 'badge-outline' },
];