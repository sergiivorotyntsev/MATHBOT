/**
 * 📐 Math Skills System
 * School-level mathematics topics (6-16 years old)
 */

export interface MathSkills {
  // Arithmetic (55%)
  addition: number;          // 0-100
  subtraction: number;       // 0-100
  multiplication: number;    // 0-100
  division: number;          // 0-100
  fractions: number;         // 0-100
  decimals: number;          // 0-100
  percentages: number;       // 0-100

  // Geometry (25%)
  shapes: number;            // 0-100
  perimeter: number;         // 0-100
  area: number;              // 0-100
  volume: number;            // 0-100
  angles: number;            // 0-100

  // Logic & Problem Solving (20%)
  patterns: number;          // 0-100
  sequences: number;         // 0-100
  problemSolving: number;    // 0-100
  wordProblems: number;      // 0-100
}

export type MathSkillKey = keyof MathSkills;

export const MATH_SKILL_NAMES: Record<MathSkillKey, { en: string; ru: string }> = {
  addition: { en: 'Addition', ru: 'Сложение' },
  subtraction: { en: 'Subtraction', ru: 'Вычитание' },
  multiplication: { en: 'Multiplication', ru: 'Умножение' },
  division: { en: 'Division', ru: 'Деление' },
  fractions: { en: 'Fractions', ru: 'Дроби' },
  decimals: { en: 'Decimals', ru: 'Десятичные' },
  percentages: { en: 'Percentages', ru: 'Проценты' },
  shapes: { en: 'Shapes', ru: 'Фигуры' },
  perimeter: { en: 'Perimeter', ru: 'Периметр' },
  area: { en: 'Area', ru: 'Площадь' },
  volume: { en: 'Volume', ru: 'Объём' },
  angles: { en: 'Angles', ru: 'Углы' },
  patterns: { en: 'Patterns', ru: 'Паттерны' },
  sequences: { en: 'Sequences', ru: 'Последовательности' },
  problemSolving: { en: 'Problem Solving', ru: 'Решение задач' },
  wordProblems: { en: 'Word Problems', ru: 'Текстовые задачи' }
};

export const MATH_SKILL_ICONS: Record<MathSkillKey, string> = {
  addition: '➕',
  subtraction: '➖',
  multiplication: '✖️',
  division: '➗',
  fractions: '½',
  decimals: '0.5',
  percentages: '%',
  shapes: '🔷',
  perimeter: '📏',
  area: '📐',
  volume: '📦',
  angles: '📐',
  patterns: '🔢',
  sequences: '🔢',
  problemSolving: '🧩',
  wordProblems: '📖'
};

export const MATH_SKILL_CATEGORIES: Record<'arithmetic' | 'geometry' | 'logic', MathSkillKey[]> = {
  arithmetic: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'percentages'],
  geometry: ['shapes', 'perimeter', 'area', 'volume', 'angles'],
  logic: ['patterns', 'sequences', 'problemSolving', 'wordProblems']
};

/**
 * Age bands for skills
 */
export interface SkillAgeBand {
  minAge: number;
  maxAge: number;
  label: { en: string; ru: string };
}

export const SKILL_AGE_BANDS: Record<string, SkillAgeBand> = {
  elementary: {
    minAge: 6,
    maxAge: 9,
    label: { en: 'Elementary (6-9)', ru: 'Начальная школа (6-9)' }
  },
  middle: {
    minAge: 10,
    maxAge: 12,
    label: { en: 'Middle School (10-12)', ru: 'Средняя школа (10-12)' }
  },
  high: {
    minAge: 13,
    maxAge: 16,
    label: { en: 'High School (13-16)', ru: 'Старшая школа (13-16)' }
  }
};

/**
 * Prerequisites for each skill
 */
export const SKILL_PREREQUISITES: Partial<Record<MathSkillKey, MathSkillKey[]>> = {
  subtraction: ['addition'],
  multiplication: ['addition'],
  division: ['multiplication'],
  fractions: ['division'],
  decimals: ['fractions'],
  percentages: ['decimals', 'fractions'],
  area: ['multiplication'],
  volume: ['area'],
  angles: ['shapes'],
  sequences: ['patterns'],
  wordProblems: ['problemSolving']
};

/**
 * Create default math skills
 */
export function createDefaultMathSkills(): MathSkills {
  return {
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
}

/**
 * Clamp skill value to valid range (0-100)
 */
export function clampSkill(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Apply skill changes and clamp
 */
export function applySkillChanges(
  skills: MathSkills,
  changes: Partial<MathSkills>
): MathSkills {
  const newSkills = { ...skills };

  for (const [skill, change] of Object.entries(changes)) {
    const key = skill as MathSkillKey;
    if (typeof change === 'number') {
      newSkills[key] = clampSkill(newSkills[key] + change);
    }
  }

  return newSkills;
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: 'arithmetic' | 'geometry' | 'logic'): MathSkillKey[] {
  return MATH_SKILL_CATEGORIES[category];
}

console.log('📐 MathSkills system loaded');
