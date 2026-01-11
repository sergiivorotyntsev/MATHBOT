/**
 * 🎯 Daily Quests & Streak System
 *
 * Manages daily challenges and streak tracking:
 * - 3 daily quests that reset at midnight
 * - Streak tracking with freeze option
 * - Rewards: cosmetics, perks, coins
 */

import { AvatarProfile, UniquePerk } from '../avatar/types';

// ==================== TYPES ====================

export interface DailyQuest {
  id: string;
  type: 'solve' | 'accuracy' | 'speed' | 'combo' | 'streak' | 'session';
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: QuestReward;
  icon: string;
}

export interface QuestReward {
  type: 'xp' | 'cosmetic' | 'perk' | 'coins' | 'freeze';
  amount?: number;
  item?: string;
  perk?: UniquePerk;
}

export interface StreakData {
  current: number;
  best: number;
  lastActiveDate: string; // YYYY-MM-DD
  frozen: boolean;
  freezesAvailable: number;
}

// ==================== CONSTANTS ====================

const QUESTS_PER_DAY = 3;

// Quest templates
const QUEST_TEMPLATES: Array<Omit<DailyQuest, 'id' | 'progress' | 'completed'>> = [
  // Solve quests
  {
    type: 'solve',
    title: 'Математический марафон',
    description: 'Решите 10 задач',
    target: 10,
    icon: '🎯',
    reward: { type: 'xp', amount: 100 }
  },
  {
    type: 'solve',
    title: 'Арифметический спринт',
    description: 'Решите 5 арифметических задач',
    target: 5,
    icon: '➕',
    reward: { type: 'xp', amount: 50 }
  },
  {
    type: 'solve',
    title: 'Геометрический вызов',
    description: 'Решите 5 геометрических задач',
    target: 5,
    icon: '📐',
    reward: { type: 'xp', amount: 50 }
  },
  {
    type: 'solve',
    title: 'Логический лабиринт',
    description: 'Решите 5 логических задач',
    target: 5,
    icon: '🧩',
    reward: { type: 'xp', amount: 50 }
  },

  // Accuracy quests
  {
    type: 'accuracy',
    title: 'Снайпер',
    description: 'Достигните 90% точности в сессии',
    target: 90,
    icon: '🎯',
    reward: { type: 'xp', amount: 150 }
  },
  {
    type: 'accuracy',
    title: 'Перфекционист',
    description: 'Достигните 100% точности в сессии из 5+ задач',
    target: 100,
    icon: '💯',
    reward: { type: 'cosmetic', item: 'crown' }
  },

  // Speed quests
  {
    type: 'speed',
    title: 'Молниеносный ум',
    description: 'Решите 3 задачи быстрее 50% времени',
    target: 3,
    icon: '⚡',
    reward: { type: 'xp', amount: 75 }
  },
  {
    type: 'speed',
    title: 'Гонка со временем',
    description: 'Решите задачу за 10 секунд или меньше',
    target: 1,
    icon: '⏱️',
    reward: { type: 'xp', amount: 50 }
  },

  // Combo quests
  {
    type: 'combo',
    title: 'Серийный победитель',
    description: 'Достигните комбо x5',
    target: 5,
    icon: '🔥',
    reward: { type: 'xp', amount: 100 }
  },
  {
    type: 'combo',
    title: 'Непобедимый',
    description: 'Достигните комбо x10',
    target: 10,
    icon: '💥',
    reward: { type: 'cosmetic', item: 'flames_aura' }
  },

  // Streak quests
  {
    type: 'streak',
    title: 'Постоянство',
    description: 'Тренируйтесь 3 дня подряд',
    target: 3,
    icon: '📅',
    reward: { type: 'freeze', amount: 1 }
  },
  {
    type: 'streak',
    title: 'Недельный марафон',
    description: 'Тренируйтесь 7 дней подряд',
    target: 7,
    icon: '🏆',
    reward: { type: 'cosmetic', item: 'halo' }
  },

  // Session quests
  {
    type: 'session',
    title: 'Ранняя пташка',
    description: 'Завершите утреннюю сессию (6:00-12:00)',
    target: 1,
    icon: '🌅',
    reward: { type: 'xp', amount: 50 }
  },
  {
    type: 'session',
    title: 'Вечерний учёный',
    description: 'Завершите вечернюю сессию (18:00-23:00)',
    target: 1,
    icon: '🌙',
    reward: { type: 'xp', amount: 50 }
  }
];

// ==================== DATE UTILITIES ====================

function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

function isConsecutiveDay(prevDate: string, currentDate: string): boolean {
  const prev = new Date(prevDate);
  const curr = new Date(currentDate);
  const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// ==================== QUEST GENERATION ====================

/**
 * Generate 3 random daily quests
 */
export function generateDailyQuests(): DailyQuest[] {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, QUESTS_PER_DAY);

  return selected.map((template, index) => ({
    ...template,
    id: `quest_${getTodayDateString()}_${index}`,
    progress: 0,
    completed: false
  }));
}

/**
 * Check if quests need to be reset (new day)
 */
export function shouldResetQuests(lastResetDate: number): boolean {
  const lastReset = new Date(lastResetDate).toISOString().split('T')[0];
  const today = getTodayDateString();
  return !isSameDay(lastReset, today);
}

// ==================== QUEST PROGRESS ====================

/**
 * Update quest progress
 */
export function updateQuestProgress(
  quests: DailyQuest[],
  type: DailyQuest['type'],
  amount: number = 1
): DailyQuest[] {
  return quests.map(quest => {
    if (quest.type === type && !quest.completed) {
      const newProgress = Math.min(quest.target, quest.progress + amount);
      return {
        ...quest,
        progress: newProgress,
        completed: newProgress >= quest.target
      };
    }
    return quest;
  });
}

/**
 * Check if a quest is completed
 */
export function checkQuestCompletion(quest: DailyQuest): boolean {
  return quest.progress >= quest.target;
}

/**
 * Get all completed quests
 */
export function getCompletedQuests(quests: DailyQuest[]): DailyQuest[] {
  return quests.filter(q => q.completed);
}

/**
 * Get completion percentage
 */
export function getQuestCompletionPercentage(quests: DailyQuest[]): number {
  if (quests.length === 0) return 0;
  const completed = quests.filter(q => q.completed).length;
  return Math.floor((completed / quests.length) * 100);
}

// ==================== STREAK MANAGEMENT ====================

/**
 * Update streak based on last active date
 */
export function updateStreak(
  currentStreak: number,
  lastActiveDate: string,
  frozen: boolean
): StreakData {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  // Same day - no change
  if (isSameDay(lastActiveDate, today)) {
    return {
      current: currentStreak,
      best: currentStreak,
      lastActiveDate: today,
      frozen: false,
      freezesAvailable: 0
    };
  }

  // Consecutive day - increment
  if (isSameDay(lastActiveDate, yesterday)) {
    const newStreak = currentStreak + 1;
    return {
      current: newStreak,
      best: Math.max(newStreak, currentStreak),
      lastActiveDate: today,
      frozen: false,
      freezesAvailable: 0
    };
  }

  // Gap - reset unless frozen
  if (frozen) {
    return {
      current: currentStreak,
      best: currentStreak,
      lastActiveDate: today,
      frozen: false, // Consume freeze
      freezesAvailable: 0
    };
  }

  // Streak broken
  return {
    current: 1,
    best: currentStreak,
    lastActiveDate: today,
    frozen: false,
    freezesAvailable: 0
  };
}

/**
 * Use streak freeze
 */
export function useStreakFreeze(avatar: AvatarProfile): AvatarProfile {
  // Check if freeze is available (from quest rewards)
  // This would need to be tracked separately
  return {
    ...avatar,
    streakFrozen: true
  };
}

// ==================== REWARD DISTRIBUTION ====================

/**
 * Apply quest reward to avatar
 */
export function applyQuestReward(
  avatar: AvatarProfile,
  reward: QuestReward
): AvatarProfile {
  const updatedAvatar = { ...avatar };

  switch (reward.type) {
    case 'xp':
      updatedAvatar.totalXP += reward.amount || 0;
      updatedAvatar.level = Math.floor(Math.log2(updatedAvatar.totalXP / 100 + 1)) + 1;
      break;

    case 'cosmetic':
      // Unlock cosmetic (would need unlocked items tracking)
      // For now, just log to history
      updatedAvatar.skillHistory.push({
        skill: 'focus',
        change: 0,
        newValue: updatedAvatar.coreSkills.focus,
        timestamp: Date.now(),
        reason: `Unlocked cosmetic: ${reward.item}`
      });
      break;

    case 'perk':
      if (reward.perk) {
        updatedAvatar.uniquePerks.push(reward.perk);
      }
      break;

    case 'freeze':
      updatedAvatar.streakFrozen = true;
      break;
  }

  return updatedAvatar;
}

// ==================== EXPORTS ====================

export default {
  generateDailyQuests,
  shouldResetQuests,
  updateQuestProgress,
  checkQuestCompletion,
  getCompletedQuests,
  getQuestCompletionPercentage,
  updateStreak,
  useStreakFreeze,
  applyQuestReward
};

console.log('🎯 Daily quests system loaded');
