/**
 * 🤖 MathBot Arena - Avatar System
 * K-POP Anime Style Characters with Full Customization
 */

export type AvatarType = 'scholar' | 'warrior' | 'artist' | 'engineer';

export interface AvatarArchetype {
  id: AvatarType;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  personality: { en: string; ru: string };
  color: string;
  gradient: string;
  startingBonus: {
    type: 'xp_boost' | 'time_boost' | 'skill_boost';
    value: number;
    skill?: 'arithmetic' | 'geometry' | 'logic';
  };
  ultimateSkill: {
    name: { en: string; ru: string };
    description: { en: string; ru: string };
    icon: string;
    unlockLevel: number;
  };
  baseAppearance: {
    bodyType: 'athletic' | 'slim' | 'balanced' | 'sturdy';
    defaultHair: string;
    defaultHairColor: string;
    defaultOutfit: string;
    defaultAccessory: string;
  };
}

export const AVATAR_ARCHETYPES: Record<AvatarType, AvatarArchetype> = {
  scholar: {
    id: 'scholar',
    name: { en: 'The Scholar', ru: 'Учёный' },
    description: {
      en: 'Intellectual and analytical. Masters logic through wisdom.',
      ru: 'Интеллектуал и аналитик. Побеждает логикой и мудростью.'
    },
    personality: { en: 'Calm, Strategic', ru: 'Спокойный, Стратегический' },
    color: '#3B82F6',
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    startingBonus: {
      type: 'xp_boost',
      value: 10,
      skill: 'logic'
    },
    ultimateSkill: {
      name: { en: 'Perfect Calculation', ru: 'Идеальный Расчёт' },
      description: {
        en: 'Doubles your combo multiplier for ultimate precision',
        ru: 'Удваивает множитель комбо для максимальной точности'
      },
      icon: '🧠',
      unlockLevel: 25
    },
    baseAppearance: {
      bodyType: 'slim',
      defaultHair: 'short_neat',
      defaultHairColor: '#1E3A8A',
      defaultOutfit: 'scholar_robe',
      defaultAccessory: 'glasses_holographic'
    }
  },

  warrior: {
    id: 'warrior',
    name: { en: 'The Warrior', ru: 'Воин' },
    description: {
      en: 'Competitive and fast. Conquers through speed and determination.',
      ru: 'Соревновательный и быстрый. Побеждает скоростью и решительностью.'
    },
    personality: { en: 'Energetic, Determined', ru: 'Энергичный, Решительный' },
    color: '#EF4444',
    gradient: 'from-red-500 via-orange-500 to-red-600',
    startingBonus: {
      type: 'time_boost',
      value: 15
    },
    ultimateSkill: {
      name: { en: 'Lightning Strike', ru: 'Удар Молнии' },
      description: {
        en: 'Auto-solve one question per session instantly',
        ru: 'Автоматически решает один вопрос за сессию мгновенно'
      },
      icon: '⚡',
      unlockLevel: 25
    },
    baseAppearance: {
      bodyType: 'athletic',
      defaultHair: 'spiky',
      defaultHairColor: '#DC2626',
      defaultOutfit: 'warrior_gi',
      defaultAccessory: 'headband'
    }
  },

  artist: {
    id: 'artist',
    name: { en: 'The Artist', ru: 'Художник' },
    description: {
      en: 'Creative and geometric. Sees beauty in mathematical patterns.',
      ru: 'Креативный и геометричный. Видит красоту в математических узорах.'
    },
    personality: { en: 'Imaginative, Expressive', ru: 'Творческий, Выразительный' },
    color: '#A855F7',
    gradient: 'from-purple-500 via-pink-500 to-purple-600',
    startingBonus: {
      type: 'xp_boost',
      value: 10,
      skill: 'geometry'
    },
    ultimateSkill: {
      name: { en: 'Spatial Vision', ru: 'Пространственное Зрение' },
      description: {
        en: 'Reveals geometric hints for complex problems',
        ru: 'Показывает геометрические подсказки для сложных задач'
      },
      icon: '🎨',
      unlockLevel: 25
    },
    baseAppearance: {
      bodyType: 'balanced',
      defaultHair: 'long_flowing',
      defaultHairColor: '#9333EA',
      defaultOutfit: 'artist_smock',
      defaultAccessory: 'beret'
    }
  },

  engineer: {
    id: 'engineer',
    name: { en: 'The Engineer', ru: 'Инженер' },
    description: {
      en: 'Systematic and methodical. Builds success through precision.',
      ru: 'Системный и методичный. Строит успех через точность.'
    },
    personality: { en: 'Logical, Precise', ru: 'Логичный, Точный' },
    color: '#10B981',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    startingBonus: {
      type: 'xp_boost',
      value: 10,
      skill: 'arithmetic'
    },
    ultimateSkill: {
      name: { en: 'Calculation Engine', ru: 'Вычислительный Двигатель' },
      description: {
        en: 'Gain 5 extra seconds per question',
        ru: 'Получить 5 дополнительных секунд на вопрос'
      },
      icon: '⚙️',
      unlockLevel: 25
    },
    baseAppearance: {
      bodyType: 'sturdy',
      defaultHair: 'short_technical',
      defaultHairColor: '#047857',
      defaultOutfit: 'engineer_jumpsuit',
      defaultAccessory: 'goggles'
    }
  }
};

// ==================== CUSTOMIZATION OPTIONS ====================

export interface CustomizationItem {
  id: string;
  category: 'hair' | 'hairColor' | 'eyes' | 'outfit' | 'accessory' | 'effect';
  name: { en: string; ru: string };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel?: number;
  unlockAchievement?: string;
  premium?: boolean;
  price?: number; // In-app purchase price (USD)
}

export const HAIRSTYLES: CustomizationItem[] = [
  { id: 'short_neat', category: 'hair', name: { en: 'Short & Neat', ru: 'Короткие Аккуратные' }, icon: '💈', rarity: 'common' },
  { id: 'spiky', category: 'hair', name: { en: 'Spiky', ru: 'Шипастые' }, icon: '⚡', rarity: 'common' },
  { id: 'long_flowing', category: 'hair', name: { en: 'Long Flowing', ru: 'Длинные Развевающиеся' }, icon: '🌊', rarity: 'common' },
  { id: 'ponytail', category: 'hair', name: { en: 'Ponytail', ru: 'Хвост' }, icon: '🎀', rarity: 'common' },
  { id: 'twin_tails', category: 'hair', name: { en: 'Twin Tails', ru: 'Два Хвоста' }, icon: '🎀🎀', rarity: 'rare', unlockLevel: 10 },
  { id: 'buns', category: 'hair', name: { en: 'Space Buns', ru: 'Космические Пучки' }, icon: '🌙', rarity: 'rare', unlockLevel: 15 },
  { id: 'undercut', category: 'hair', name: { en: 'Undercut', ru: 'Андеркат' }, icon: '✂️', rarity: 'rare', unlockLevel: 20 },
  { id: 'braided', category: 'hair', name: { en: 'Braided Crown', ru: 'Коса-Корона' }, icon: '👑', rarity: 'epic', unlockLevel: 30 },
  { id: 'holographic', category: 'hair', name: { en: 'Holographic', ru: 'Голографические' }, icon: '🌈', rarity: 'legendary', premium: true, price: 2.99 },
  { id: 'flames', category: 'hair', name: { en: 'Living Flames', ru: 'Живое Пламя' }, icon: '🔥', rarity: 'legendary', premium: true, price: 2.99 },
];

export const HAIR_COLORS: CustomizationItem[] = [
  { id: 'black', category: 'hairColor', name: { en: 'Midnight Black', ru: 'Чёрный' }, icon: '⬛', rarity: 'common' },
  { id: 'brown', category: 'hairColor', name: { en: 'Chocolate Brown', ru: 'Коричневый' }, icon: '🟫', rarity: 'common' },
  { id: 'blonde', category: 'hairColor', name: { en: 'Golden Blonde', ru: 'Блонд' }, icon: '🟨', rarity: 'common' },
  { id: 'red', category: 'hairColor', name: { en: 'Crimson Red', ru: 'Красный' }, icon: '🟥', rarity: 'common' },
  { id: 'blue', category: 'hairColor', name: { en: 'Ocean Blue', ru: 'Синий' }, icon: '🟦', rarity: 'rare', unlockLevel: 5 },
  { id: 'purple', category: 'hairColor', name: { en: 'Royal Purple', ru: 'Фиолетовый' }, icon: '🟪', rarity: 'rare', unlockLevel: 5 },
  { id: 'pink', category: 'hairColor', name: { en: 'Sakura Pink', ru: 'Розовый' }, icon: '🌸', rarity: 'rare', unlockLevel: 10 },
  { id: 'green', category: 'hairColor', name: { en: 'Neon Green', ru: 'Зелёный' }, icon: '🟩', rarity: 'epic', unlockLevel: 15 },
  { id: 'silver', category: 'hairColor', name: { en: 'Silver Shine', ru: 'Серебряный' }, icon: '⚪', rarity: 'epic', unlockLevel: 20 },
  { id: 'rainbow', category: 'hairColor', name: { en: 'Rainbow', ru: 'Радужный' }, icon: '🌈', rarity: 'legendary', unlockLevel: 40 },
  { id: 'galaxy', category: 'hairColor', name: { en: 'Galaxy', ru: 'Галактический' }, icon: '🌌', rarity: 'legendary', premium: true, price: 1.99 },
  { id: 'gold', category: 'hairColor', name: { en: 'Pure Gold', ru: 'Золотой' }, icon: '🥇', rarity: 'legendary', unlockAchievement: 'reach_level_50' },
];

export const OUTFITS: CustomizationItem[] = [
  // Common (Free)
  { id: 'casual_tee', category: 'outfit', name: { en: 'Casual T-Shirt', ru: 'Обычная Футболка' }, icon: '👕', rarity: 'common' },
  { id: 'hoodie', category: 'outfit', name: { en: 'Comfy Hoodie', ru: 'Уютная Толстовка' }, icon: '🧥', rarity: 'common' },
  { id: 'school_uniform', category: 'outfit', name: { en: 'School Uniform', ru: 'Школьная Форма' }, icon: '🎒', rarity: 'common' },

  // Rare (Unlock by level)
  { id: 'sporty', category: 'outfit', name: { en: 'Athletic Wear', ru: 'Спортивная Одежда' }, icon: '⚽', rarity: 'rare', unlockLevel: 10 },
  { id: 'kimono', category: 'outfit', name: { en: 'Modern Kimono', ru: 'Современное Кимоно' }, icon: '🎌', rarity: 'rare', unlockLevel: 15 },
  { id: 'cyberpunk', category: 'outfit', name: { en: 'Cyberpunk Jacket', ru: 'Киберпанк Куртка' }, icon: '🌃', rarity: 'epic', unlockLevel: 25 },

  // Epic (Premium or achievements)
  { id: 'battle_armor', category: 'outfit', name: { en: 'Battle Armor', ru: 'Боевая Броня' }, icon: '🛡️', rarity: 'epic', premium: true, price: 3.99 },
  { id: 'wizard_robe', category: 'outfit', name: { en: 'Wizard Robe', ru: 'Мантия Мага' }, icon: '🧙', rarity: 'epic', premium: true, price: 3.99 },
  { id: 'kpop_idol', category: 'outfit', name: { en: 'K-POP Idol', ru: 'K-POP Айдол' }, icon: '🎤', rarity: 'legendary', premium: true, price: 4.99 },

  // Legendary (Special achievements)
  { id: 'golden_champion', category: 'outfit', name: { en: 'Golden Champion', ru: 'Золотой Чемпион' }, icon: '🏆', rarity: 'legendary', unlockAchievement: '100_win_streak' },
];

export const ACCESSORIES: CustomizationItem[] = [
  // Common
  { id: 'none', category: 'accessory', name: { en: 'None', ru: 'Нет' }, icon: '∅', rarity: 'common' },
  { id: 'glasses_round', category: 'accessory', name: { en: 'Round Glasses', ru: 'Круглые Очки' }, icon: '👓', rarity: 'common' },
  { id: 'headphones', category: 'accessory', name: { en: 'Headphones', ru: 'Наушники' }, icon: '🎧', rarity: 'common' },
  { id: 'cap', category: 'accessory', name: { en: 'Baseball Cap', ru: 'Бейсболка' }, icon: '🧢', rarity: 'common' },

  // Rare
  { id: 'crown_small', category: 'accessory', name: { en: 'Mini Crown', ru: 'Мини Корона' }, icon: '👑', rarity: 'rare', unlockLevel: 10 },
  { id: 'cat_ears', category: 'accessory', name: { en: 'Cat Ears', ru: 'Кошачьи Ушки' }, icon: '🐱', rarity: 'rare', unlockLevel: 12 },
  { id: 'halo', category: 'accessory', name: { en: 'Angel Halo', ru: 'Ангельский Нимб' }, icon: '😇', rarity: 'epic', unlockLevel: 20 },
  { id: 'devil_horns', category: 'accessory', name: { en: 'Devil Horns', ru: 'Рога Дьявола' }, icon: '😈', rarity: 'epic', unlockLevel: 20 },

  // Epic & Legendary
  { id: 'holographic_visor', category: 'accessory', name: { en: 'Holographic Visor', ru: 'Голографический Визор' }, icon: '🥽', rarity: 'epic', premium: true, price: 1.99 },
  { id: 'flame_aura', category: 'accessory', name: { en: 'Flame Aura', ru: 'Огненная Аура' }, icon: '🔥', rarity: 'legendary', unlockAchievement: '50_combo' },
  { id: 'lightning_aura', category: 'accessory', name: { en: 'Lightning Aura', ru: 'Молния Аура' }, icon: '⚡', rarity: 'legendary', premium: true, price: 2.99 },
  { id: 'galaxy_wings', category: 'accessory', name: { en: 'Galaxy Wings', ru: 'Галактические Крылья' }, icon: '🦋', rarity: 'legendary', premium: true, price: 4.99 },
];

export const VISUAL_EFFECTS: CustomizationItem[] = [
  { id: 'none', category: 'effect', name: { en: 'None', ru: 'Нет' }, icon: '∅', rarity: 'common' },
  { id: 'sparkles', category: 'effect', name: { en: 'Sparkles', ru: 'Искры' }, icon: '✨', rarity: 'common' },
  { id: 'stars', category: 'effect', name: { en: 'Stars', ru: 'Звёзды' }, icon: '⭐', rarity: 'rare', unlockLevel: 5 },
  { id: 'flames', category: 'effect', name: { en: 'Flames', ru: 'Пламя' }, icon: '🔥', rarity: 'rare', unlockLevel: 10 },
  { id: 'electric', category: 'effect', name: { en: 'Electric', ru: 'Электричество' }, icon: '⚡', rarity: 'epic', unlockLevel: 20 },
  { id: 'rainbow', category: 'effect', name: { en: 'Rainbow Trail', ru: 'Радужный След' }, icon: '🌈', rarity: 'epic', premium: true, price: 1.99 },
  { id: 'cosmic', category: 'effect', name: { en: 'Cosmic Aura', ru: 'Космическая Аура' }, icon: '🌌', rarity: 'legendary', premium: true, price: 2.99 },
  { id: 'matrix', category: 'effect', name: { en: 'Matrix Code', ru: 'Код Матрицы' }, icon: '💻', rarity: 'legendary', unlockAchievement: 'perfect_100' },
];

// ==================== AVATAR STATE ====================

export interface AvatarCustomization {
  archetype: AvatarType;
  hair: string;
  hairColor: string;
  outfit: string;
  accessory: string;
  effect: string;
}

export const DEFAULT_CUSTOMIZATION: Record<AvatarType, AvatarCustomization> = {
  scholar: {
    archetype: 'scholar',
    hair: 'short_neat',
    hairColor: 'black',
    outfit: 'school_uniform',
    accessory: 'glasses_round',
    effect: 'sparkles'
  },
  warrior: {
    archetype: 'warrior',
    hair: 'spiky',
    hairColor: 'red',
    outfit: 'sporty',
    accessory: 'headband',
    effect: 'flames'
  },
  artist: {
    archetype: 'artist',
    hair: 'long_flowing',
    hairColor: 'purple',
    outfit: 'casual_tee',
    accessory: 'beret',
    effect: 'rainbow'
  },
  engineer: {
    archetype: 'engineer',
    hair: 'short_technical',
    hairColor: 'brown',
    outfit: 'hoodie',
    accessory: 'goggles',
    effect: 'electric'
  }
};

// ==================== HELPER FUNCTIONS ====================

export const getUnlockedItems = (level: number, achievements: string[], isPremium: boolean): CustomizationItem[] => {
  const allItems = [...HAIRSTYLES, ...HAIR_COLORS, ...OUTFITS, ...ACCESSORIES, ...VISUAL_EFFECTS];

  return allItems.filter(item => {
    // Always show common items
    if (item.rarity === 'common') return true;

    // Check level requirement
    if (item.unlockLevel && level < item.unlockLevel) return false;

    // Check achievement requirement
    if (item.unlockAchievement && !achievements.includes(item.unlockAchievement)) return false;

    // Check premium requirement
    if (item.premium && !isPremium) return false;

    return true;
  });
};

export const getRarityColor = (rarity: CustomizationItem['rarity']): string => {
  switch (rarity) {
    case 'common': return '#9CA3AF'; // gray-400
    case 'rare': return '#3B82F6'; // blue-500
    case 'epic': return '#A855F7'; // purple-500
    case 'legendary': return '#F59E0B'; // amber-500
  }
};

export const getRarityGlow = (rarity: CustomizationItem['rarity']): string => {
  switch (rarity) {
    case 'common': return '';
    case 'rare': return 'shadow-lg shadow-blue-500/50';
    case 'epic': return 'shadow-xl shadow-purple-500/50';
    case 'legendary': return 'shadow-2xl shadow-amber-500/70 animate-pulse';
  }
};

console.log('🤖 Avatar System loaded:', Object.keys(AVATAR_ARCHETYPES).length, 'archetypes');
console.log('🎨 Customization items:',
  HAIRSTYLES.length + HAIR_COLORS.length + OUTFITS.length + ACCESSORIES.length + VISUAL_EFFECTS.length
);
