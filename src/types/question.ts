/**
 * 📚 Unified Question Schema
 *
 * This is the single source of truth for all questions in MathBot Arena.
 * Every question MUST conform to this schema to ensure:
 * - Proper grade/age alignment
 * - Consistent difficulty progression
 * - Accurate skill tracking
 * - No duplicate questions in sessions
 */

// ==================== ENUMS & CONSTANTS ====================

export type QuestionDomain = 'Arithmetic' | 'Geometry' | 'Logic';

export type QuestionLanguage = 'ru' | 'en';

export type QuestionSource = 'generated' | 'curated';

// Grade bands aligned with US school grades
export type GradeBand = 'K-1' | '2-3' | '4-5' | '6-7' | '8-9' | '10-12';

// Age bands for easier mapping
export type AgeBand = '5-6' | '7-8' | '9-10' | '11-12' | '13-14' | '15-18';

// Difficulty tier within a specific topic (1=easiest, 5=hardest)
export type DifficultyTier = 1 | 2 | 3 | 4 | 5;

// ==================== TOPICS BY DOMAIN ====================

export const ARITHMETIC_TOPICS = [
  'Counting',
  'Place Value',
  'Addition',
  'Subtraction',
  'Multiplication',
  'Division',
  'Fractions',
  'Decimals',
  'Percentages',
  'Ratios',
  'Order of Operations',
  'Integers',
  'Exponents',
  'Square Roots'
] as const;

export const GEOMETRY_TOPICS = [
  'Shapes',
  'Lines and Angles',
  'Perimeter',
  'Area',
  'Volume',
  'Symmetry',
  'Transformations',
  'Coordinate Geometry',
  'Pythagorean Theorem',
  'Trigonometry'
] as const;

export const LOGIC_TOPICS = [
  'Patterns',
  'Sequences',
  'Classification',
  'Word Problems',
  'Time and Calendar',
  'Money',
  'Measurement',
  'Data and Graphs',
  'Probability',
  'Combinatorics',
  'Problem Solving'
] as const;

export type ArithmeticTopic = typeof ARITHMETIC_TOPICS[number];
export type GeometryTopic = typeof GEOMETRY_TOPICS[number];
export type LogicTopic = typeof LOGIC_TOPICS[number];
export type QuestionTopic = ArithmeticTopic | GeometryTopic | LogicTopic;

// ==================== SKILL IDs ====================

/**
 * Skill IDs map directly to dashboard tiles
 * Format: domain_topic_subtopic
 */
export type SkillId = string;

// ==================== MAIN QUESTION INTERFACE ====================

export interface Question {
  // ===== Identity =====
  /** Stable, deterministic ID (hash of template + params) */
  id: string;

  /** Language of the question */
  language: QuestionLanguage;

  // ===== Content =====
  /** Question text/prompt */
  prompt: string;

  /** Answer choices (empty for open-ended) */
  choices: string[];

  /** Correct answer */
  correctAnswer: string;

  /** Brief explanation of solution */
  explanation: string;

  // ===== Taxonomy =====
  /** High-level domain */
  domain: QuestionDomain;

  /** Specific topic within domain */
  topic: QuestionTopic;

  /** Skill ID for tracking (maps to dashboard) */
  skillId: SkillId;

  // ===== Difficulty & Grade Level =====
  /** Target grade band (US school grades) */
  gradeBand: GradeBand;

  /** Target age band */
  ageBand: AgeBand;

  /** Difficulty within topic (1-5) */
  difficultyTier: DifficultyTier;

  /** Global difficulty score (1-10 or ELO-like) */
  globalDifficulty: number;

  // ===== Dependencies =====
  /** Required skills before attempting this question */
  prerequisites: SkillId[];

  // ===== Metadata =====
  /** Tags for filtering/search */
  tags: string[];

  /** Source of question */
  source: QuestionSource;

  /** Version for tracking updates */
  version: string;

  // ===== Generation Metadata (for generated questions) =====
  /** Template ID if generated */
  templateId?: string;

  /** Generation parameters (for reproducibility) */
  generationParams?: Record<string, any>;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Map age to grade band
 */
export function ageToGradeBand(age: number): GradeBand {
  if (age <= 6) return 'K-1';
  if (age <= 8) return '2-3';
  if (age <= 10) return '4-5';
  if (age <= 12) return '6-7';
  if (age <= 14) return '8-9';
  return '10-12';
}

/**
 * Map age to age band
 */
export function ageToAgeBand(age: number): AgeBand {
  if (age <= 6) return '5-6';
  if (age <= 8) return '7-8';
  if (age <= 10) return '9-10';
  if (age <= 12) return '11-12';
  if (age <= 14) return '13-14';
  return '15-18';
}

/**
 * Map grade band to age band
 */
export function gradeBandToAgeBand(gradeBand: GradeBand): AgeBand {
  const mapping: Record<GradeBand, AgeBand> = {
    'K-1': '5-6',
    '2-3': '7-8',
    '4-5': '9-10',
    '6-7': '11-12',
    '8-9': '13-14',
    '10-12': '15-18'
  };
  return mapping[gradeBand];
}

/**
 * Get domain from topic
 */
export function getTopicDomain(topic: QuestionTopic): QuestionDomain {
  if (ARITHMETIC_TOPICS.includes(topic as any)) return 'Arithmetic';
  if (GEOMETRY_TOPICS.includes(topic as any)) return 'Geometry';
  if (LOGIC_TOPICS.includes(topic as any)) return 'Logic';
  throw new Error(`Unknown topic: ${topic}`);
}

/**
 * Create skill ID from domain and topic
 */
export function createSkillId(domain: QuestionDomain, topic: QuestionTopic, subtopic?: string): SkillId {
  const parts = [domain.toLowerCase(), topic.toLowerCase().replace(/\s+/g, '_')];
  if (subtopic) {
    parts.push(subtopic.toLowerCase().replace(/\s+/g, '_'));
  }
  return parts.join('_');
}

/**
 * Parse skill ID back to components
 */
export function parseSkillId(skillId: SkillId): { domain: string; topic: string; subtopic?: string } {
  const parts = skillId.split('_');
  return {
    domain: parts[0],
    topic: parts[1],
    subtopic: parts[2]
  };
}

/**
 * Calculate global difficulty from tier and grade band
 * Formula: base difficulty from grade + tier offset
 */
export function calculateGlobalDifficulty(gradeBand: GradeBand, tier: DifficultyTier): number {
  const gradeBase: Record<GradeBand, number> = {
    'K-1': 1,
    '2-3': 2,
    '4-5': 4,
    '6-7': 6,
    '8-9': 8,
    '10-12': 9
  };

  const base = gradeBase[gradeBand];
  const tierOffset = (tier - 1) * 0.5; // Each tier adds 0.5 to difficulty

  return Math.min(10, Math.max(1, base + tierOffset));
}

/**
 * Check if question is appropriate for age
 */
export function isQuestionAppropriate(question: Question, age: number): boolean {
  const userAgeBand = ageToAgeBand(age);
  const userGradeBand = ageToGradeBand(age);

  return question.ageBand === userAgeBand || question.gradeBand === userGradeBand;
}

/**
 * Check if prerequisites are met
 */
export function checkPrerequisites(question: Question, masteredSkills: Set<SkillId>): boolean {
  if (question.prerequisites.length === 0) return true;

  return question.prerequisites.every(prereq => masteredSkills.has(prereq));
}
