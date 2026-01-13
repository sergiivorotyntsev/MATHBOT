/**
 * 🔌 Question Adapter
 *
 * Bridges the new Question system with existing MathBotArena code.
 * Converts between new Question format and old Task format.
 */

import { Question, SkillId } from '../types/question';
import { Task, SkillType } from '../data/taskBank';

// ==================== TYPE CONVERSIONS ====================

/**
 * Convert new Question to old Task format
 */
export function questionToTask(question: Question, index: number): TaskWithOptions {
  // Map skill ID to old SkillType
  const skillType = mapSkillIdToSkillType(question.skillId);

  // Check if all choices are numeric
  const isNumericQuestion = question.choices.every(c => {
    const parsed = parseFloat(c);
    return !isNaN(parsed) && String(parsed) === c.trim();
  });

  // Convert choices and answer based on question type
  let choices: (number | string)[];
  let correctAnswer: number | string;

  if (isNumericQuestion) {
    // Numeric question: convert to numbers
    choices = question.choices.map(c => parseFloat(c));
    correctAnswer = parseFloat(question.correctAnswer);
  } else {
    // Text question: keep as strings (Shapes, Patterns, Word Problems)
    choices = question.choices;
    correctAnswer = question.correctAnswer;
  }

  return {
    // Old Task fields
    q: question.prompt,
    a: correctAnswer,
    skill: skillType,
    d: question.difficultyTier,
    t: question.topic,
    time: getTimeForDifficulty(question.difficultyTier),

    // TaskWithOptions fields
    options: choices,
    index,

    // Metadata for tracking
    _questionId: question.id,
    _skillId: question.skillId
  };
}

/**
 * Convert array of Questions to TaskWithOptions array
 */
export function questionsToTasks(questions: Question[]): TaskWithOptions[] {
  return questions.map((q, i) => questionToTask(q, i));
}

/**
 * Map new SkillId to old SkillType
 */
function mapSkillIdToSkillType(skillId: SkillId): SkillType {
  // Parse skill ID: "domain_topic_subtopic"
  const parts = skillId.split('_');
  const domain = parts[0];

  if (domain === 'arithmetic') return 'arithmetic';
  if (domain === 'geometry') return 'geometry';
  if (domain === 'logic') return 'logic';

  // Default fallback
  return 'arithmetic';
}

/**
 * Map old SkillType to new SkillId (best effort)
 */
export function skillTypeToSkillId(skillType: SkillType, topic?: string): SkillId {
  if (topic) {
    const topicSlug = topic.toLowerCase().replace(/\s+/g, '_');
    return `${skillType}_${topicSlug}`;
  }

  // Default skill IDs for each type
  const defaults: Record<SkillType, SkillId> = {
    arithmetic: 'arithmetic_addition',
    geometry: 'geometry_perimeter',
    logic: 'logic_patterns'
  };

  return defaults[skillType];
}

/**
 * Get time limit based on difficulty tier
 */
function getTimeForDifficulty(tier: number): number {
  const timeByTier: Record<number, number> = {
    1: 60, // Easy: 60 seconds
    2: 50,
    3: 45,
    4: 40,
    5: 30  // Hard: 30 seconds
  };

  return timeByTier[tier] || 45;
}

// ==================== EXTENDED TYPES ====================

/**
 * Extended TaskWithOptions that includes new system metadata
 */
export interface TaskWithOptions extends Task {
  options: (number | string)[];  // Support both numeric and text answers
  index: number;
  _questionId?: string;  // Track original question ID
  _skillId?: SkillId;    // Track skill ID for stats
}

// ==================== SESSION HELPERS ====================

/**
 * Extract question ID from task (if available)
 */
export function getQuestionIdFromTask(task: TaskWithOptions): string | null {
  return task._questionId || null;
}

/**
 * Extract skill ID from task (if available)
 */
export function getSkillIdFromTask(task: TaskWithOptions): SkillId | null {
  return task._skillId || skillTypeToSkillId(task.skill, task.t);
}

/**
 * Check if task came from new question system
 */
export function isNewSystemTask(task: TaskWithOptions): boolean {
  return !!(task._questionId && task._skillId);
}

// ==================== VALIDATION ====================

/**
 * Validate that no duplicate question IDs exist in session
 */
export function validateNoDuplicateQuestions(tasks: TaskWithOptions[]): boolean {
  const ids = tasks
    .map(t => getQuestionIdFromTask(t))
    .filter(id => id !== null);

  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    console.error('❌ Duplicate questions detected in session!');
    return false;
  }

  return true;
}

/**
 * Log session summary for debugging
 */
export function logSessionSummary(tasks: TaskWithOptions[]): void {
  const newSystemCount = tasks.filter(isNewSystemTask).length;
  const oldSystemCount = tasks.length - newSystemCount;

  console.log('[Session Summary]');
  console.log(`  Total questions: ${tasks.length}`);
  console.log(`  New system: ${newSystemCount}`);
  console.log(`  Old system: ${oldSystemCount}`);

  if (newSystemCount > 0) {
    const skills = new Set(
      tasks
        .filter(isNewSystemTask)
        .map(t => getSkillIdFromTask(t))
        .filter(s => s !== null)
    );
    console.log(`  Skills covered: ${Array.from(skills).join(', ')}`);
  }

  validateNoDuplicateQuestions(tasks);
}
