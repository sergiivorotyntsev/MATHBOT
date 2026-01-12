/**
 * 🎮 Game Stats System
 * RPG-style battle stats for heroes
 */

export interface GameStats {
  strength: number;      // 1-100: Damage per correct answer
  agility: number;       // 1-100: Initiative/dodge chance
  defense: number;       // 1-100: Damage reduction
  magic: number;         // 1-100: Combo/spell multipliers
  wisdom: number;        // 1-100: XP gain from complex tasks
  luck: number;          // 1-100: Critical hit chance
  focus: number;         // 1-100: Error penalty reduction/combo retention
}

export const GAME_STAT_NAMES: Record<keyof GameStats, { en: string; ru: string }> = {
  strength: { en: 'Strength', ru: 'Сила' },
  agility: { en: 'Agility', ru: 'Ловкость' },
  defense: { en: 'Defense', ru: 'Броня' },
  magic: { en: 'Magic', ru: 'Магия' },
  wisdom: { en: 'Wisdom', ru: 'Мудрость' },
  luck: { en: 'Luck', ru: 'Удача' },
  focus: { en: 'Focus', ru: 'Концентрация' }
};

export const GAME_STAT_ICONS: Record<keyof GameStats, string> = {
  strength: '💪',
  agility: '⚡',
  defense: '🛡️',
  magic: '✨',
  wisdom: '📚',
  luck: '🍀',
  focus: '🎯'
};

export const GAME_STAT_COLORS: Record<keyof GameStats, string> = {
  strength: 'from-red-500 to-orange-500',
  agility: 'from-yellow-500 to-amber-500',
  defense: 'from-blue-500 to-cyan-500',
  magic: 'from-purple-500 to-pink-500',
  wisdom: 'from-green-500 to-emerald-500',
  luck: 'from-orange-500 to-yellow-500',
  focus: 'from-indigo-500 to-violet-500'
};

export const GAME_STAT_DESCRIPTIONS: Record<keyof GameStats, { en: string; ru: string }> = {
  strength: {
    en: 'Increases damage dealt in battles',
    ru: 'Увеличивает урон в боях'
  },
  agility: {
    en: 'Improves initiative and dodge chance',
    ru: 'Улучшает инициативу и шанс уклонения'
  },
  defense: {
    en: 'Reduces incoming damage',
    ru: 'Снижает входящий урон'
  },
  magic: {
    en: 'Enhances combo multipliers and special effects',
    ru: 'Усиливает множители комбо и спецэффекты'
  },
  wisdom: {
    en: 'Increases XP gain from complex problems',
    ru: 'Увеличивает получение XP за сложные задачи'
  },
  luck: {
    en: 'Improves critical hit chance',
    ru: 'Увеличивает шанс критического удара'
  },
  focus: {
    en: 'Reduces error penalties and helps maintain combos',
    ru: 'Снижает штрафы за ошибки и помогает держать комбо'
  }
};

/**
 * Create default game stats
 */
export function createDefaultGameStats(): GameStats {
  return {
    strength: 10,
    agility: 10,
    defense: 10,
    magic: 10,
    wisdom: 10,
    luck: 10,
    focus: 10
  };
}

/**
 * Clamp stat value to valid range (1-100)
 */
export function clampStat(value: number): number {
  return Math.max(1, Math.min(100, Math.round(value)));
}

/**
 * Apply stat changes and clamp
 */
export function applyStatChanges(
  stats: GameStats,
  changes: Partial<GameStats>
): GameStats {
  const newStats = { ...stats };

  for (const [stat, change] of Object.entries(changes)) {
    const key = stat as keyof GameStats;
    if (typeof change === 'number') {
      newStats[key] = clampStat(newStats[key] + change);
    }
  }

  return newStats;
}

console.log('🎮 GameStats system loaded');
