/**
 * 🎮 Gamification Types
 * Daily goals, streaks, achievements
 */

export interface DailyGoal {
  date: string; // ISO date string
  target: number; // questions to solve
  completed: number; // questions solved
  isComplete: boolean;
}

export interface StreakData {
  current: number; // consecutive days
  best: number; // all-time best
  lastActivityDate: string; // ISO date
}

export interface Achievement {
  id: string;
  name: { ru: string; en: string };
  description: { ru: string; en: string };
  icon: string;
  condition: (stats: any) => boolean;
  unlockedAt?: string; // ISO date
  isUnlocked: boolean;
}

export interface GamificationData {
  dailyGoal: DailyGoal;
  streak: StreakData;
  achievements: Achievement[];
  coins: number; // virtual currency
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: { ru: 'Первые шаги', en: 'First Steps' },
    description: { ru: 'Решите первые 10 задач', en: 'Solve 10 questions' },
    icon: '🎯',
    condition: (stats) => stats.totalQuestions >= 10,
    isUnlocked: false
  },
  {
    id: 'fast-learner',
    name: { ru: 'Быстрый ученик', en: 'Fast Learner' },
    description: { ru: 'Решите 10 задач подряд правильно', en: 'Solve 10 in a row correctly' },
    icon: '⚡',
    condition: (stats) => stats.bestCombo >= 10,
    isUnlocked: false
  },
  {
    id: 'week-warrior',
    name: { ru: 'Недельный воин', en: 'Week Warrior' },
    description: { ru: 'Занимайтесь 7 дней подряд', en: 'Practice 7 days in a row' },
    icon: '🔥',
    condition: (stats) => stats.streak >= 7,
    isUnlocked: false
  },
  {
    id: 'accuracy-master',
    name: { ru: 'Мастер точности', en: 'Accuracy Master' },
    description: { ru: 'Достигните 90% точности на 50 задачах', en: 'Reach 90% accuracy on 50 questions' },
    icon: '🎯',
    condition: (stats) => stats.totalQuestions >= 50 && (stats.correctAnswers / stats.totalQuestions) >= 0.9,
    isUnlocked: false
  },
  {
    id: 'century-club',
    name: { ru: 'Клуб сотни', en: 'Century Club' },
    description: { ru: 'Решите 100 задач', en: 'Solve 100 questions' },
    icon: '💯',
    condition: (stats) => stats.totalQuestions >= 100,
    isUnlocked: false
  }
];

/**
 * Initialize gamification data
 */
export function createInitialGamificationData(): GamificationData {
  const today = new Date().toISOString().split('T')[0];

  return {
    dailyGoal: {
      date: today,
      target: 10,
      completed: 0,
      isComplete: false
    },
    streak: {
      current: 0,
      best: 0,
      lastActivityDate: today
    },
    achievements: ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: false })),
    coins: 0
  };
}

/**
 * Update daily goal progress
 */
export function updateDailyGoal(
  gamification: GamificationData,
  questionsCompleted: number
): GamificationData {
  const today = new Date().toISOString().split('T')[0];

  // Reset if new day
  if (gamification.dailyGoal.date !== today) {
    return {
      ...gamification,
      dailyGoal: {
        date: today,
        target: 10,
        completed: questionsCompleted,
        isComplete: questionsCompleted >= 10
      }
    };
  }

  // Update existing
  const newCompleted = gamification.dailyGoal.completed + questionsCompleted;
  return {
    ...gamification,
    dailyGoal: {
      ...gamification.dailyGoal,
      completed: newCompleted,
      isComplete: newCompleted >= gamification.dailyGoal.target
    }
  };
}

/**
 * Update streak
 */
export function updateStreak(
  gamification: GamificationData
): GamificationData {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = gamification.streak.lastActivityDate;

  // Same day - no change
  if (lastDate === today) {
    return gamification;
  }

  // Calculate day difference
  const lastDateObj = new Date(lastDate);
  const todayObj = new Date(today);
  const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

  let newCurrent = gamification.streak.current;

  if (diffDays === 1) {
    // Consecutive day
    newCurrent = gamification.streak.current + 1;
  } else if (diffDays > 1) {
    // Streak broken
    newCurrent = 1;
  }

  return {
    ...gamification,
    streak: {
      current: newCurrent,
      best: Math.max(newCurrent, gamification.streak.best),
      lastActivityDate: today
    }
  };
}

/**
 * Check and unlock achievements
 */
export function checkAchievements(
  gamification: GamificationData,
  stats: any
): { gamification: GamificationData; newUnlocked: Achievement[] } {
  const newUnlocked: Achievement[] = [];

  const updatedAchievements = gamification.achievements.map(achievement => {
    if (!achievement.isUnlocked && achievement.condition({ ...stats, streak: gamification.streak.current })) {
      newUnlocked.push(achievement);
      return {
        ...achievement,
        isUnlocked: true,
        unlockedAt: new Date().toISOString()
      };
    }
    return achievement;
  });

  return {
    gamification: {
      ...gamification,
      achievements: updatedAchievements,
      coins: gamification.coins + (newUnlocked.length * 10) // 10 coins per achievement
    },
    newUnlocked
  };
}
