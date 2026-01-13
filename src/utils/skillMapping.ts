/**
 * Mapping helper for UI topics to backend skill IDs
 *
 * Maps old UI topic names (Russian) to new skill IDs from database.
 */

import { SkillType } from './data/taskBank';

// Mapping from UI topic names (Russian) to skill IDs
const TOPIC_TO_SKILL_ID: Record<string, string> = {
  // Arithmetic
  'Счёт': 'arithmetic_counting',
  'Сложение': 'arithmetic_addition',
  'Вычитание': 'arithmetic_subtraction',
  'Умножение': 'arithmetic_multiplication',
  'Деление': 'arithmetic_division',
  'Дроби': 'arithmetic_fractions',
  'Десятичные': 'arithmetic_decimals',
  'Разрядность': 'arithmetic_place_value',

  // Geometry
  'Фигуры': 'geometry_shapes',
  'Периметр': 'geometry_perimeter',
  'Площадь': 'geometry_area',

  // Logic
  'Паттерны': 'logic_patterns',
  'Последовательности': 'logic_sequences',
  'Задачи': 'logic_word_problems',
};

// Domain mapping
const SKILL_TYPE_TO_DOMAIN: Record<SkillType, string> = {
  'arithmetic': 'Arithmetic',
  'geometry': 'Geometry',
  'logic': 'Logic',
};

/**
 * Convert UI skill type and topic to backend skill ID
 */
export function getSkillIdFromUI(
  skillType: SkillType,
  topic?: string
): string[] {
  // If no specific topic, return all skills for domain
  if (!topic) {
    const domain = SKILL_TYPE_TO_DOMAIN[skillType];
    // Return all skills for this domain (will filter on backend)
    return Object.entries(TOPIC_TO_SKILL_ID)
      .filter(([_, skillId]) => skillId.startsWith(skillType))
      .map(([_, skillId]) => skillId);
  }

  // Map specific topic
  const skillId = TOPIC_TO_SKILL_ID[topic];

  if (!skillId) {
    console.warn(`[SkillMapping] No mapping found for topic: "${topic}"`);
    // Fallback to all skills for domain
    return getSkillIdFromUI(skillType);
  }

  return [skillId];
}

/**
 * Get domain from skill type
 */
export function getDomainFromSkillType(skillType: SkillType): string {
  return SKILL_TYPE_TO_DOMAIN[skillType];
}
