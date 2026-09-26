// LocalStorage keys for client-side persistence of active practice programs & streaks
const STREAK_KEY = 'career_os_quiz_streak';
const ACTIVE_PROGRAMS_KEY = 'career_os_quiz_programs';

/**
 * Calculates or updates the user's daily quiz streak
 */
export function getQuizStreakData() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: null };
  }
}

export function updateQuizStreak() {
  const today = new Date().toISOString().split('T')[0];
  const { count, lastDate } = getQuizStreakData();

  if (lastDate === today) return count; // Already logged today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newCount = lastDate === yesterday ? count + 1 : 1;

  localStorage.setItem(STREAK_KEY, JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

/**
 * Get active multi-day (e.g. 10-day) spaced repetition programs
 */
export function getActivePrograms() {
  try {
    const raw = localStorage.getItem(ACTIVE_PROGRAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Creates a new Multi-Day Spaced Program (e.g. 10-Day Spaced Repetition)
 */
export function createSpacedProgram({ topic, roadmapId = null, nodeId = null, days = 10, questionCount = 5 }) {
  const programs = getActivePrograms();
  const startDate = new Date();

  const newProgram = {
    id: `prog_${Date.now()}`,
    topic,
    roadmapId,
    nodeId,
    totalDays: days,
    currentDay: 1,
    questionCount,
    startDate: startDate.toISOString(),
    nextDue: startDate.toISOString().split('T')[0], // Due today initially
    completedDays: [],
  };

  programs.push(newProgram);
  localStorage.setItem(ACTIVE_PROGRAMS_KEY, JSON.stringify(programs));

  // Request browser notification permission for daily alerts
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  return newProgram;
}

/**
 * Advances a program day after a quiz attempt and schedules next review date
 */
export function completeProgramDay(topic, accuracyPercentage) {
  const programs = getActivePrograms();
  const today = new Date().toISOString().split('T')[0];

  const updated = programs.map((prog) => {
    if (prog.topic.toLowerCase().trim() === topic.toLowerCase().trim()) {
      const nextInterval = accuracyPercentage >= 80 ? 2 : 1; // Spaced interval based on accuracy
      const nextDueDate = new Date(Date.now() + nextInterval * 86400000).toISOString().split('T')[0];

      return {
        ...prog,
        currentDay: Math.min(prog.currentDay + 1, prog.totalDays),
        nextDue: nextDueDate,
        completedDays: [...prog.completedDays, { date: today, accuracy: accuracyPercentage }],
      };
    }
    return prog;
  });

  localStorage.setItem(ACTIVE_PROGRAMS_KEY, JSON.stringify(updated));
}

/**
 * Returns programs that are due for daily practice today
 */
export function getDuePrograms() {
  const programs = getActivePrograms();
  const today = new Date().toISOString().split('T')[0];
  return programs.filter((p) => p.nextDue <= today && p.currentDay <= p.totalDays);
}

/**
 * Sends a browser notification if permission is granted
 */
export function sendDailyQuizNotification(topic) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('CareerOS Daily Quiz Reminder', {
      body: `It's time for your daily spaced quiz on "${topic}"! Keep your mastery streak going.`,
      icon: '/favicon.ico',
    });
  }
}