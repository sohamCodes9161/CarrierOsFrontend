// LocalStorage keys for client-side persistence of active practice programs & streaks
const getStreakKey = (userId) => `career_os_quiz_streak_${userId}`;
const getProgramsKey = (userId) => `career_os_quiz_programs_${userId}`;

/**
 * Calculates or updates the user's daily quiz streak
 */
export function getQuizStreakData(userId) {
  if (!userId) return { count: 0, lastDate: null };
  try {
    const raw = localStorage.getItem(getStreakKey(userId));
    if (!raw) return { count: 0, lastDate: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: null };
  }
}

export function updateQuizStreak(userId) {
  if (!userId) return 0;
  const today = new Date().toISOString().split('T')[0];
  const { count, lastDate } = getQuizStreakData(userId);

  if (lastDate === today) return count; // Already logged today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newCount = lastDate === yesterday ? count + 1 : 1; // Resets if more than 1 day missed

  localStorage.setItem(getStreakKey(userId), JSON.stringify({ count: newCount, lastDate: today }));
  return newCount;
}

/**
 * Get active multi-day (e.g. 10-day) spaced repetition programs
 */
export function getActivePrograms(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getProgramsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Creates a new Multi-Day Spaced Program (e.g. 10-Day Spaced Repetition)
 */
export function createSpacedProgram(userId, { topic, roadmapId = null, nodeId = null, days = 10, questionCount = 5 }) {
  if (!userId) return null;
  const programs = getActivePrograms(userId);
  const startDate = new Date();

  const newProgram = {
    id: `prog_${Date.now()}`,
    topic,
    roadmapId,
    nodeId,
    totalDays: days,
    currentDay: 1,
    questionCount,
    status: 'active', // Added status tracking
    startDate: startDate.toISOString(),
    nextDue: startDate.toISOString().split('T')[0], // Due today initially
    completedDays: [],
  };

  programs.push(newProgram);
  localStorage.setItem(getProgramsKey(userId), JSON.stringify(programs));

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  return newProgram;
}

/**
 * Advances a program day after a quiz attempt and schedules next review date
 */
export function completeProgramDay(userId, topic, accuracyPercentage = 0) {
  if (!userId) return;
  const programs = getActivePrograms(userId);
  const today = new Date().toISOString().split('T')[0];

  const updated = programs.map((prog) => {
    // Only update if it matches the topic and isn't already completed
    if (prog.topic.toLowerCase().trim() === topic.toLowerCase().trim() && prog.status !== 'completed') {
      const nextInterval = accuracyPercentage >= 80 ? 2 : 1; // Spaced interval based on accuracy
      const nextDueDate = new Date(Date.now() + nextInterval * 86400000).toISOString().split('T')[0];
      
      const nextDay = prog.currentDay + 1;
      const isCompleted = nextDay > prog.totalDays;

      return {
        ...prog,
        currentDay: isCompleted ? prog.totalDays : nextDay, // Cap at max days for display
        nextDue: nextDueDate,
        status: isCompleted ? 'completed' : 'active',
        completedDays: [...(prog.completedDays || []), { date: today, accuracy: accuracyPercentage }],
      };
    }
    return prog;
  });

  localStorage.setItem(getProgramsKey(userId), JSON.stringify(updated));
}

/**
 * Returns programs that are due for daily practice today
 */
export function getDuePrograms(userId) {
  if (!userId) return [];
  const programs = getActivePrograms(userId);
  const today = new Date().toISOString().split('T')[0];
  
  // Filter out completed programs and check if it's due today (or overdue from missed days)
  return programs.filter((p) => p.status !== 'completed' && p.nextDue <= today);
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