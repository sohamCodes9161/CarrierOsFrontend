import { api, AI_TIMEOUT_MS } from './client.js';

/** POST /quizzes/generate */
export async function generateQuiz({ topic, roadmapId, nodeId, questionCount = 5 }) {
  return api.post(
    '/quizzes/generate',
    { topic, roadmapId, nodeId, questionCount },
    { timeout: AI_TIMEOUT_MS }
  );
}

/** POST /quizzes/submit */
export async function submitQuiz({ quizId, totalTimeSpentSeconds, answers }) {
  return api.post('/quizzes/submit', { quizId, totalTimeSpentSeconds, answers });
}

/** GET /quizzes/history */
export async function getQuizHistory(topic) {
  const query = topic ? `?topic=${encodeURIComponent(topic)}` : '';
  return api.get(`/quizzes/history${query}`);
}