/**
 * 🎯 CANONICAL SKILLS TAXONOMY
 *
 * This is the single source of truth for all skills in MathBot Arena.
 * Every UI element, question, and progress tracker MUST reference this taxonomy.
 *
 * NON-NEGOTIABLE: Skills defined here are the ONLY valid skills.
 */

import { GradeBand, QuestionDomain, QuestionTopic, SkillId } from '../types/question';

// ==================== SKILL DEFINITION ====================

export interface SkillDefinition {
  /** Canonical skill ID (immutable) */
  id: SkillId;

  /** Display names */
  name: {
    en: string;
    ru: string;
  };

  /** High-level category */
  category: 'arithmetic' | 'geometry' | 'logic';

  /** Question domain (for filtering) */
  domain: QuestionDomain;

  /** Primary topic */
  topic: QuestionTopic;

  /** Subtopic (optional) */
  subtopic?: string;

  /** Recommended grade range */
  gradeRange: {
    min: GradeBand;
    max: GradeBand;
  };

  /** Prerequisite skills (must be mastered first) */
  prerequisites: SkillId[];

  /** Estimated mastery time (hours) */
  estimatedMasteryHours: number;

  /** Minimum question bank size required */
  minQuestionCount: number;

  /** CCSS standard codes */
  ccssStandards: string[];

  /** Priority (1=core, 2=standard, 3=advanced) */
  priority: 1 | 2 | 3;
}

// ==================== SKILL REGISTRY ====================

/**
 * Complete list of all skills in MathBot Arena
 * Format: domain_topic(_subtopic)
 */
export const SKILL_REGISTRY: SkillDefinition[] = [
  // ==================== ARITHMETIC ====================

  // Counting
  {
    id: 'arithmetic_counting',
    name: { en: 'Counting & Numbers', ru: 'Счёт и числа' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Counting',
    gradeRange: { min: 'K-1', max: '2-3' },
    prerequisites: [],
    estimatedMasteryHours: 10,
    minQuestionCount: 300,
    ccssStandards: ['K.CC.A.1', 'K.CC.B.4', '1.NBT.A.1'],
    priority: 1
  },

  {
    id: 'arithmetic_place_value',
    name: { en: 'Place Value', ru: 'Разрядность' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Place Value',
    gradeRange: { min: 'K-1', max: '4-5' },
    prerequisites: ['arithmetic_counting'],
    estimatedMasteryHours: 8,
    minQuestionCount: 200,
    ccssStandards: ['1.NBT.B.2', '2.NBT.A.1', '3.NBT.A.1'],
    priority: 1
  },

  // Addition
  {
    id: 'arithmetic_addition',
    name: { en: 'Addition', ru: 'Сложение' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Addition',
    gradeRange: { min: 'K-1', max: '4-5' },
    prerequisites: ['arithmetic_counting'],
    estimatedMasteryHours: 15,
    minQuestionCount: 500,
    ccssStandards: ['K.OA.A.1', '1.OA.C.6', '2.NBT.B.5'],
    priority: 1
  },

  // Subtraction
  {
    id: 'arithmetic_subtraction',
    name: { en: 'Subtraction', ru: 'Вычитание' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Subtraction',
    gradeRange: { min: 'K-1', max: '4-5' },
    prerequisites: ['arithmetic_addition'],
    estimatedMasteryHours: 15,
    minQuestionCount: 500,
    ccssStandards: ['K.OA.A.2', '1.OA.C.6', '2.NBT.B.5'],
    priority: 1
  },

  // Multiplication
  {
    id: 'arithmetic_multiplication',
    name: { en: 'Multiplication', ru: 'Умножение' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Multiplication',
    gradeRange: { min: '2-3', max: '6-7' },
    prerequisites: ['arithmetic_addition'],
    estimatedMasteryHours: 20,
    minQuestionCount: 500,
    ccssStandards: ['3.OA.A.1', '3.OA.C.7', '4.NBT.B.5'],
    priority: 1
  },

  // Division
  {
    id: 'arithmetic_division',
    name: { en: 'Division', ru: 'Деление' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Division',
    gradeRange: { min: '2-3', max: '6-7' },
    prerequisites: ['arithmetic_multiplication'],
    estimatedMasteryHours: 20,
    minQuestionCount: 500,
    ccssStandards: ['3.OA.A.2', '3.OA.C.7', '4.NBT.B.6'],
    priority: 1
  },

  // Fractions
  {
    id: 'arithmetic_fractions',
    name: { en: 'Fractions', ru: 'Дроби' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Fractions',
    gradeRange: { min: '2-3', max: '6-7' },
    prerequisites: ['arithmetic_division'],
    estimatedMasteryHours: 25,
    minQuestionCount: 400,
    ccssStandards: ['3.NF.A.1', '4.NF.B.3', '5.NF.A.1'],
    priority: 1
  },

  // Decimals
  {
    id: 'arithmetic_decimals',
    name: { en: 'Decimals', ru: 'Десятичные дроби' },
    category: 'arithmetic',
    domain: 'Arithmetic',
    topic: 'Decimals',
    gradeRange: { min: '4-5', max: '8-9' },
    prerequisites: ['arithmetic_fractions'],
    estimatedMasteryHours: 20,
    minQuestionCount: 300,
    ccssStandards: ['4.NF.C.5', '5.NBT.A.3', '5.NBT.B.7'],
    priority: 1
  },

  // ==================== GEOMETRY ====================

  {
    id: 'geometry_shapes',
    name: { en: 'Shapes', ru: 'Фигуры' },
    category: 'geometry',
    domain: 'Geometry',
    topic: 'Shapes',
    gradeRange: { min: 'K-1', max: '4-5' },
    prerequisites: [],
    estimatedMasteryHours: 12,
    minQuestionCount: 300,
    ccssStandards: ['K.G.A.2', '1.G.A.1', '2.G.A.1'],
    priority: 1
  },

  {
    id: 'geometry_perimeter',
    name: { en: 'Perimeter', ru: 'Периметр' },
    category: 'geometry',
    domain: 'Geometry',
    topic: 'Perimeter',
    gradeRange: { min: '2-3', max: '6-7' },
    prerequisites: ['geometry_shapes', 'arithmetic_addition'],
    estimatedMasteryHours: 10,
    minQuestionCount: 200,
    ccssStandards: ['3.MD.D.8'],
    priority: 2
  },

  {
    id: 'geometry_area',
    name: { en: 'Area', ru: 'Площадь' },
    category: 'geometry',
    domain: 'Geometry',
    topic: 'Area',
    gradeRange: { min: '2-3', max: '6-7' },
    prerequisites: ['geometry_shapes', 'arithmetic_multiplication'],
    estimatedMasteryHours: 12,
    minQuestionCount: 200,
    ccssStandards: ['3.MD.C.5', '3.MD.C.6', '4.MD.A.3'],
    priority: 2
  },

  // ==================== LOGIC ====================

  {
    id: 'logic_patterns',
    name: { en: 'Patterns', ru: 'Паттерны' },
    category: 'logic',
    domain: 'Logic',
    topic: 'Patterns',
    gradeRange: { min: 'K-1', max: '4-5' },
    prerequisites: ['arithmetic_counting'],
    estimatedMasteryHours: 10,
    minQuestionCount: 300,
    ccssStandards: ['K.OA.A.5', '1.OA.D.7'],
    priority: 2
  },

  {
    id: 'logic_sequences',
    name: { en: 'Sequences', ru: 'Последовательности' },
    category: 'logic',
    domain: 'Logic',
    topic: 'Sequences',
    gradeRange: { min: '2-3', max: '8-9' },
    prerequisites: ['logic_patterns', 'arithmetic_addition'],
    estimatedMasteryHours: 15,
    minQuestionCount: 300,
    ccssStandards: ['4.OA.C.5'],
    priority: 2
  },

  {
    id: 'logic_word_problems',
    name: { en: 'Word Problems', ru: 'Текстовые задачи' },
    category: 'logic',
    domain: 'Logic',
    topic: 'Word Problems',
    gradeRange: { min: 'K-1', max: '8-9' },
    prerequisites: ['arithmetic_addition', 'arithmetic_subtraction'],
    estimatedMasteryHours: 25,
    minQuestionCount: 400,
    ccssStandards: ['1.OA.A.1', '2.OA.A.1', '3.OA.A.3', '4.OA.A.3'],
    priority: 1
  }
];

// ==================== LOOKUP FUNCTIONS ====================

/** Map for O(1) skill lookup */
const SKILL_MAP = new Map<SkillId, SkillDefinition>(
  SKILL_REGISTRY.map(skill => [skill.id, skill])
);

/**
 * Get skill definition by ID
 * @throws Error if skill doesn't exist
 */
export function getSkill(skillId: SkillId): SkillDefinition {
  const skill = SKILL_MAP.get(skillId);
  if (!skill) {
    throw new Error(`Unknown skill ID: ${skillId}. Must be defined in SKILL_REGISTRY.`);
  }
  return skill;
}

/**
 * Check if skill exists
 */
export function hasSkill(skillId: SkillId): boolean {
  return SKILL_MAP.has(skillId);
}

/**
 * Get all skills in a category
 */
export function getSkillsByCategory(category: 'arithmetic' | 'geometry' | 'logic'): SkillDefinition[] {
  return SKILL_REGISTRY.filter(s => s.category === category);
}

/**
 * Get all skills by domain
 */
export function getSkillsByDomain(domain: QuestionDomain): SkillDefinition[] {
  return SKILL_REGISTRY.filter(s => s.domain === domain);
}

/**
 * Get all skills by topic
 */
export function getSkillsByTopic(topic: QuestionTopic): SkillDefinition[] {
  return SKILL_REGISTRY.filter(s => s.topic === topic);
}

/**
 * Get skills appropriate for grade band
 */
export function getSkillsForGradeBand(gradeBand: GradeBand): SkillDefinition[] {
  return SKILL_REGISTRY.filter(skill => {
    return isGradeBandInRange(gradeBand, skill.gradeRange.min, skill.gradeRange.max);
  });
}

/**
 * Get all prerequisite skills (recursive)
 */
export function getAllPrerequisites(skillId: SkillId): SkillId[] {
  const skill = getSkill(skillId);
  const prerequisites: Set<SkillId> = new Set();

  const traverse = (id: SkillId) => {
    const s = getSkill(id);
    for (const prereq of s.prerequisites) {
      if (!prerequisites.has(prereq)) {
        prerequisites.add(prereq);
        traverse(prereq);
      }
    }
  };

  traverse(skillId);
  return Array.from(prerequisites);
}

/**
 * Check if user meets prerequisites for skill
 */
export function canAccessSkill(skillId: SkillId, masteredSkills: Set<SkillId>): boolean {
  const skill = getSkill(skillId);
  return skill.prerequisites.every(prereq => masteredSkills.has(prereq));
}

// ==================== HELPER FUNCTIONS ====================

function isGradeBandInRange(target: GradeBand, min: GradeBand, max: GradeBand): boolean {
  const order: GradeBand[] = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];
  const targetIdx = order.indexOf(target);
  const minIdx = order.indexOf(min);
  const maxIdx = order.indexOf(max);
  return targetIdx >= minIdx && targetIdx <= maxIdx;
}

// ==================== VALIDATION ====================

/**
 * Validate skill registry integrity
 * Called at build time and in tests
 */
export function validateSkillRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for duplicate IDs
  const ids = new Set<SkillId>();
  for (const skill of SKILL_REGISTRY) {
    if (ids.has(skill.id)) {
      errors.push(`Duplicate skill ID: ${skill.id}`);
    }
    ids.add(skill.id);
  }

  // Check prerequisites exist
  for (const skill of SKILL_REGISTRY) {
    for (const prereq of skill.prerequisites) {
      if (!hasSkill(prereq)) {
        errors.push(`Skill ${skill.id} has unknown prerequisite: ${prereq}`);
      }
    }
  }

  // Check for circular dependencies
  for (const skill of SKILL_REGISTRY) {
    try {
      getAllPrerequisites(skill.id);
    } catch (e) {
      errors.push(`Circular dependency detected for skill: ${skill.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
