/**
 * 🔍 Question Bank Validator
 *
 * Dev-only validation to ensure question bank integrity:
 * - All question IDs are unique
 * - Required fields are present
 * - Topic values belong to known enums
 * - Minimum questions exist per domain
 */

import {
  Question,
  QuestionDomain,
  QuestionTopic,
  ARITHMETIC_TOPICS,
  GEOMETRY_TOPICS,
  LOGIC_TOPICS
} from '../types/question';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalQuestions: number;
    uniqueIds: number;
    byDomain: Record<QuestionDomain, number>;
    byTopic: Record<string, number>;
  };
}

const VALID_TOPICS = new Set<string>([
  ...ARITHMETIC_TOPICS,
  ...GEOMETRY_TOPICS,
  ...LOGIC_TOPICS
]);

const MIN_QUESTIONS_PER_DOMAIN = 50; // At least 50 questions per domain
const MIN_QUESTIONS_PER_TOPIC = 10;  // At least 10 questions per topic

/**
 * Validate a question bank
 */
export function validateQuestionBank(questions: Question[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Track IDs for uniqueness
  const seenIds = new Set<string>();
  const duplicateIds: string[] = [];

  // Track coverage
  const byDomain: Record<QuestionDomain, number> = {
    'Arithmetic': 0,
    'Geometry': 0,
    'Logic': 0
  };
  const byTopic: Record<string, number> = {};

  // Validate each question
  questions.forEach((q, index) => {
    // 1. Check required fields
    if (!q.id) {
      errors.push(`Question at index ${index}: missing 'id'`);
    }
    if (!q.prompt) {
      errors.push(`Question ${q.id || index}: missing 'prompt'`);
    }
    if (!q.correctAnswer) {
      errors.push(`Question ${q.id || index}: missing 'correctAnswer'`);
    }
    if (!q.domain) {
      errors.push(`Question ${q.id || index}: missing 'domain'`);
    }
    if (!q.topic) {
      errors.push(`Question ${q.id || index}: missing 'topic'`);
    }
    if (!q.skillId) {
      errors.push(`Question ${q.id || index}: missing 'skillId'`);
    }

    // 2. Check ID uniqueness
    if (q.id) {
      if (seenIds.has(q.id)) {
        duplicateIds.push(q.id);
        errors.push(`Duplicate question ID: ${q.id}`);
      }
      seenIds.add(q.id);
    }

    // 3. Validate domain
    if (q.domain && !['Arithmetic', 'Geometry', 'Logic'].includes(q.domain)) {
      errors.push(`Question ${q.id}: invalid domain '${q.domain}' (must be Arithmetic, Geometry, or Logic)`);
    }

    // 4. Validate topic belongs to known list
    if (q.topic && !VALID_TOPICS.has(q.topic)) {
      warnings.push(`Question ${q.id}: unknown topic '${q.topic}' (not in predefined topic list)`);
    }

    // 5. Validate difficulty tier
    if (q.difficultyTier && (q.difficultyTier < 1 || q.difficultyTier > 5)) {
      errors.push(`Question ${q.id}: invalid difficultyTier ${q.difficultyTier} (must be 1-5)`);
    }

    // 6. Validate choices for multiple choice
    if (q.choices && q.choices.length > 0) {
      if (!q.choices.includes(q.correctAnswer)) {
        errors.push(`Question ${q.id}: correctAnswer '${q.correctAnswer}' not in choices [${q.choices.join(', ')}]`);
      }
    }

    // Track stats
    if (q.domain) {
      byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
    }
    if (q.topic) {
      byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    }
  });

  // 7. Check minimum coverage per domain
  (Object.keys(byDomain) as QuestionDomain[]).forEach(domain => {
    const count = byDomain[domain];
    if (count < MIN_QUESTIONS_PER_DOMAIN) {
      warnings.push(`Domain '${domain}' has only ${count} questions (recommended: ${MIN_QUESTIONS_PER_DOMAIN}+)`);
    }
  });

  // 8. Check minimum coverage per topic
  Object.entries(byTopic).forEach(([topic, count]) => {
    if (count < MIN_QUESTIONS_PER_TOPIC) {
      warnings.push(`Topic '${topic}' has only ${count} questions (recommended: ${MIN_QUESTIONS_PER_TOPIC}+)`);
    }
  });

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    stats: {
      totalQuestions: questions.length,
      uniqueIds: seenIds.size,
      byDomain,
      byTopic
    }
  };
}

/**
 * Run validation and log results (dev mode only)
 */
export function validateAndLog(questions: Question[]): boolean {
  if (import.meta.env.PROD) {
    return true; // Skip validation in production
  }

  console.log('[QuestionValidator] Validating question bank...');

  const result = validateQuestionBank(questions);

  console.log(`[QuestionValidator] Total: ${result.stats.totalQuestions} questions, ${result.stats.uniqueIds} unique IDs`);
  console.log('[QuestionValidator] Coverage by domain:', result.stats.byDomain);
  console.log('[QuestionValidator] Coverage by topic:', result.stats.byTopic);

  if (result.errors.length > 0) {
    console.error(`[QuestionValidator] ❌ ${result.errors.length} ERRORS:`);
    result.errors.forEach(err => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn(`[QuestionValidator] ⚠️ ${result.warnings.length} warnings:`);
    result.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  if (result.valid) {
    console.log('[QuestionValidator] ✅ Validation passed!');
  } else {
    console.error('[QuestionValidator] ❌ Validation FAILED - fix errors above');
  }

  return result.valid;
}

/**
 * Assert that questions match selected filters (for session validation)
 */
export function assertTopicFidelity(
  questions: Question[],
  expectedDomain?: QuestionDomain,
  expectedTopic?: QuestionTopic
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  questions.forEach(q => {
    if (expectedDomain && q.domain !== expectedDomain) {
      violations.push(`Question ${q.id}: expected domain '${expectedDomain}' but got '${q.domain}'`);
    }

    if (expectedTopic && q.topic !== expectedTopic) {
      violations.push(`Question ${q.id}: expected topic '${expectedTopic}' but got '${q.topic}'`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}
