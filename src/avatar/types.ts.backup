/**
 * 🎨 Avatar System - Core Types
 * Unified avatar system for main game and PvP
 */

// ==================== BASE TYPES ====================

export type AvatarBaseType = 'scholar' | 'warrior' | 'artist' | 'engineer';

export interface AvatarCosmetics {
  hair: 'short' | 'long' | 'spiky' | 'ponytail' | 'buns' | 'braided';
  outfit: 'casual' | 'uniform' | 'sporty' | 'formal' | 'futuristic' | 'traditional';
  aura: 'none' | 'sparkles' | 'flames' | 'electric' | 'cosmic' | 'rainbow';
  accessory: 'none' | 'glasses' | 'headphones' | 'cap' | 'crown' | 'halo';
  colorPalette: 'default' | 'warm' | 'cool' | 'neon' | 'pastel' | 'dark';
}

// ==================== SKILLS ====================

export interface CoreSkills {
  arithmetic: number;    // 1-100
  geometry: number;      // 1-100
  logic: number;         // 1-100
  speed: number;         // 1-100
  accuracy: number;      // 1-100
  focus: number;         // 1-100
}

export interface SecondarySkills {
  // Arithmetic sub-skills
  addition: number;
  subtraction: number;
  multiplication: number;
  division: number;
  fractions: number;
  decimals: number;
  percentages: number;

  // Geometry sub-skills
  shapes: number;
  perimeter: number;
  area: number;
  volume: number;
  angles: number;

  // Logic sub-skills
  patterns: number;
  sequences: number;
  problemSolving: number;
  wordProblems: number;
}

export const SECONDARY_SKILL_NAMES: Record<keyof SecondarySkills, string> = {
  addition: 'Сложение',
  subtraction: 'Вычитание',
  multiplication: 'Умножение',
  division: 'Деление',
  fractions: 'Дроби',
  decimals: 'Десятичные',
  percentages: 'Проценты',
  shapes: 'Фигуры',
  perimeter: 'Периметр',
  area: 'Площадь',
  volume: 'Объём',
  angles: 'Углы',
  patterns: 'Паттерны',
  sequences: 'Последовательности',
  problemSolving: 'Решение задач',
  wordProblems: 'Текстовые задачи'
};

export interface UniquePerk {
  id: string;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number; // timestamp, 0 if not unlocked
  effects: {
    type: 'xp_boost' | 'time_bonus' | 'combo_boost' | 'hint' | 'shield' | 'multiplier';
    value: number;
    duration?: number; // seconds, if temporary
  }[];
}

// ==================== AVATAR PROFILE ====================

export interface AvatarProfile {
  baseType: AvatarBaseType;
  cosmetics: AvatarCosmetics;

  coreSkills: CoreSkills;
  secondarySkills: SecondarySkills;
  uniquePerks: UniquePerk[];

  // Progression tracking
  totalXP: number;
  level: number;

  // Activity tracking
  lastTrainingAt: number; // timestamp
  lastActiveAt: number;   // timestamp
  streak: number;         // days
  streakFrozen: boolean;  // can use freeze item

  // Ratings
  rating: number;         // ELO-like
  pvpRank: number;

  // Daily quests
  dailyQuestsCompletedToday: number;
  lastDailyQuestReset: number; // timestamp

  // History
  skillHistory: SkillChangeEvent[];
}

export interface SkillChangeEvent {
  timestamp: number;
  skill: keyof CoreSkills | keyof SecondarySkills;
  change: number;
  reason: 'training' | 'decay' | 'bonus' | 'penalty';
  details?: string;
}

// ==================== AVATAR BASE CONFIG ====================

export interface AvatarBaseConfig {
  type: AvatarBaseType;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  startingBonuses: {
    coreSkill: keyof CoreSkills;
    value: number;
  }[];
  ultimateAbility: {
    name: { en: string; ru: string };
    description: { en: string; ru: string };
    icon: string;
    cooldown: number; // seconds
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

export const AVATAR_BASES: Record<AvatarBaseType, AvatarBaseConfig> = {
  scholar: {
    type: 'scholar',
    name: { en: 'Scholar', ru: 'Учёный' },
    description: {
      en: 'Master of knowledge and calculation. Excels in accuracy and logic.',
      ru: 'Мастер знаний и вычислений. Превосходен в точности и логике.'
    },
    startingBonuses: [
      { coreSkill: 'arithmetic', value: 10 },
      { coreSkill: 'accuracy', value: 15 },
    ],
    ultimateAbility: {
      name: { en: 'Perfect Calculation', ru: 'Идеальный расчёт' },
      description: {
        en: 'Doubles combo multiplier for 3 rounds',
        ru: 'Удваивает множитель комбо на 3 раунда'
      },
      icon: '🧠',
      cooldown: 120
    },
    colorScheme: {
      primary: '#3B82F6', // blue
      secondary: '#60A5FA',
      accent: '#93C5FD',
      glow: '#DBEAFE'
    }
  },

  warrior: {
    type: 'warrior',
    name: { en: 'Warrior', ru: 'Воин' },
    description: {
      en: 'Fast and fierce. Excels in speed and decisive action.',
      ru: 'Быстрый и яростный. Превосходен в скорости и решительности.'
    },
    startingBonuses: [
      { coreSkill: 'speed', value: 20 },
      { coreSkill: 'focus', value: 10 },
    ],
    ultimateAbility: {
      name: { en: 'Lightning Strike', ru: 'Молниеносный удар' },
      description: {
        en: 'Instant answer with max speed bonus',
        ru: 'Мгновенный ответ с максимальным бонусом скорости'
      },
      icon: '⚡',
      cooldown: 90
    },
    colorScheme: {
      primary: '#EF4444', // red
      secondary: '#F87171',
      accent: '#FCA5A5',
      glow: '#FEE2E2'
    }
  },

  artist: {
    type: 'artist',
    name: { en: 'Artist', ru: 'Художник' },
    description: {
      en: 'Creative and intuitive. Excels in geometry and visual thinking.',
      ru: 'Творческий и интуитивный. Превосходен в геометрии и визуальном мышлении.'
    },
    startingBonuses: [
      { coreSkill: 'geometry', value: 15 },
      { coreSkill: 'logic', value: 10 },
    ],
    ultimateAbility: {
      name: { en: 'Spatial Vision', ru: 'Пространственное видение' },
      description: {
        en: 'Reveals hints for next 2 questions',
        ru: 'Показывает подсказки для следующих 2 вопросов'
      },
      icon: '🎨',
      cooldown: 100
    },
    colorScheme: {
      primary: '#8B5CF6', // purple
      secondary: '#A78BFA',
      accent: '#C4B5FD',
      glow: '#EDE9FE'
    }
  },

  engineer: {
    type: 'engineer',
    name: { en: 'Engineer', ru: 'Инженер' },
    description: {
      en: 'Methodical and precise. Balanced in all skills with defensive focus.',
      ru: 'Методичный и точный. Сбалансирован во всех навыках с фокусом на защите.'
    },
    startingBonuses: [
      { coreSkill: 'arithmetic', value: 8 },
      { coreSkill: 'geometry', value: 8 },
      { coreSkill: 'focus', value: 12 },
    ],
    ultimateAbility: {
      name: { en: 'Calculation Engine', ru: 'Вычислительный двигатель' },
      description: {
        en: 'Shields from next mistake, extra time +10s',
        ru: 'Защита от следующей ошибки, дополнительное время +10с'
      },
      icon: '⚙️',
      cooldown: 110
    },
    colorScheme: {
      primary: '#10B981', // green
      secondary: '#34D399',
      accent: '#6EE7B7',
      glow: '#D1FAE5'
    }
  }
};

// ==================== COSMETICS CATALOG ====================

export interface CosmeticItem {
  id: string;
  category: keyof AvatarCosmetics;
  value: AvatarCosmetics[keyof AvatarCosmetics];
  name: { en: string; ru: string };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition: {
    type: 'level' | 'achievement' | 'quest' | 'pvp_rank' | 'premium';
    value: number | string;
  };
  price?: number; // coins, if purchasable
}

// Simplified catalog - will be expanded
export const COSMETICS_CATALOG: CosmeticItem[] = [
  // Hair styles
  {
    id: 'hair_short',
    category: 'hair',
    value: 'short',
    name: { en: 'Short Hair', ru: 'Короткие волосы' },
    rarity: 'common',
    unlockCondition: { type: 'level', value: 1 }
  },
  {
    id: 'hair_long',
    category: 'hair',
    value: 'long',
    name: { en: 'Long Hair', ru: 'Длинные волосы' },
    rarity: 'common',
    unlockCondition: { type: 'level', value: 1 }
  },
  {
    id: 'hair_spiky',
    category: 'hair',
    value: 'spiky',
    name: { en: 'Spiky Hair', ru: 'Колючие волосы' },
    rarity: 'rare',
    unlockCondition: { type: 'level', value: 5 }
  },
  {
    id: 'hair_ponytail',
    category: 'hair',
    value: 'ponytail',
    name: { en: 'Ponytail', ru: 'Хвостик' },
    rarity: 'rare',
    unlockCondition: { type: 'level', value: 5 }
  },
  {
    id: 'hair_buns',
    category: 'hair',
    value: 'buns',
    name: { en: 'Twin Buns', ru: 'Две гульки' },
    rarity: 'epic',
    unlockCondition: { type: 'level', value: 10 }
  },
  {
    id: 'hair_braided',
    category: 'hair',
    value: 'braided',
    name: { en: 'Braided', ru: 'Косы' },
    rarity: 'epic',
    unlockCondition: { type: 'level', value: 10 }
  },

  // Auras
  {
    id: 'aura_none',
    category: 'aura',
    value: 'none',
    name: { en: 'No Aura', ru: 'Без ауры' },
    rarity: 'common',
    unlockCondition: { type: 'level', value: 1 }
  },
  {
    id: 'aura_sparkles',
    category: 'aura',
    value: 'sparkles',
    name: { en: 'Sparkles', ru: 'Искры' },
    rarity: 'rare',
    unlockCondition: { type: 'level', value: 3 }
  },
  {
    id: 'aura_flames',
    category: 'aura',
    value: 'flames',
    name: { en: 'Flames', ru: 'Пламя' },
    rarity: 'epic',
    unlockCondition: { type: 'level', value: 8 }
  },
  {
    id: 'aura_electric',
    category: 'aura',
    value: 'electric',
    name: { en: 'Electric', ru: 'Электричество' },
    rarity: 'epic',
    unlockCondition: { type: 'level', value: 8 }
  },
  {
    id: 'aura_cosmic',
    category: 'aura',
    value: 'cosmic',
    name: { en: 'Cosmic', ru: 'Космическая' },
    rarity: 'legendary',
    unlockCondition: { type: 'level', value: 15 }
  },
  {
    id: 'aura_rainbow',
    category: 'aura',
    value: 'rainbow',
    name: { en: 'Rainbow', ru: 'Радужная' },
    rarity: 'legendary',
    unlockCondition: { type: 'level', value: 20 }
  }
];

// ==================== HELPER FUNCTIONS ====================

export function createDefaultAvatar(baseType: AvatarBaseType): AvatarProfile {
  const baseConfig = AVATAR_BASES[baseType];

  // Initialize core skills with base values + bonuses
  const coreSkills: CoreSkills = {
    arithmetic: 10,
    geometry: 10,
    logic: 10,
    speed: 10,
    accuracy: 10,
    focus: 10
  };

  // Apply starting bonuses
  baseConfig.startingBonuses.forEach(bonus => {
    coreSkills[bonus.coreSkill] += bonus.value;
  });

  // Initialize secondary skills
  const secondarySkills: SecondarySkills = {
    addition: 0,
    subtraction: 0,
    multiplication: 0,
    division: 0,
    fractions: 0,
    decimals: 0,
    percentages: 0,
    shapes: 0,
    perimeter: 0,
    area: 0,
    volume: 0,
    angles: 0,
    patterns: 0,
    sequences: 0,
    problemSolving: 0,
    wordProblems: 0
  };

  return {
    baseType,
    cosmetics: {
      hair: 'short',
      outfit: 'casual',
      aura: 'none',
      accessory: 'none',
      colorPalette: 'default'
    },
    coreSkills,
    secondarySkills,
    uniquePerks: [],
    totalXP: 0,
    level: 1,
    lastTrainingAt: Date.now(),
    lastActiveAt: Date.now(),
    streak: 0,
    streakFrozen: false,
    rating: 1000,
    pvpRank: 0,
    dailyQuestsCompletedToday: 0,
    lastDailyQuestReset: Date.now(),
    skillHistory: []
  };
}

export function getUnlockedCosmetics(level: number, achievements: string[] = []): CosmeticItem[] {
  return COSMETICS_CATALOG.filter(item => {
    if (item.unlockCondition.type === 'level') {
      return level >= (item.unlockCondition.value as number);
    }
    if (item.unlockCondition.type === 'achievement') {
      return achievements.includes(item.unlockCondition.value as string);
    }
    return false;
  });
}

export function getRarityColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'; // gray
    case 'rare': return '#3B82F6'; // blue
    case 'epic': return '#A855F7'; // purple
    case 'legendary': return '#F59E0B'; // amber
  }
}

console.log('🎨 Avatar System loaded');
