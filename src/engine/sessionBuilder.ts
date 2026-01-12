/**
 * 🎯 Adaptive Session Builder
 *
 * Builds training sessions that:
 * - Focus on user-selected or recommended skills
 * - Adapt difficulty based on performance
 * - Include prerequisite reinforcement
 * - Schedule spaced review
 * - NEVER repeat questions within a session
 * - Cap difficulty jumps to prevent frustration
 */

import {
  Question,
  GradeBand,
  DifficultyTier,
  QuestionLanguage,
  SkillId,
  ageToGradeBand,
  checkPrerequisites
} from '../types/question';
import {
  SkillStatsStore,
  getOrCreateSkillStats,
  isSkillMastered,
  getSkillsDueForReview,
  getWeakSkills
} from '../types/skillStats';
import {
  generateQuestion,
  getTemplatesForTopic,
  getAvailableTemplates
} from './questionGenerator';

// ==================== INTERFACES ====================

export interface SessionConfig {
  /** User's age (determines grade band) */
  userAge: number;

  /** Primary skill to focus on (60% of questions) */
  focusSkillId: SkillId;

  /** Total questions in session */
  questionCount: number;

  /** Language for questions */
  language: QuestionLanguage;

  /** User's skill stats */
  statsStore: SkillStatsStore;

  /** Set of mastered skills (for prerequisite checking) */
  masteredSkills: Set<SkillId>;

  /** Maximum difficulty tier to allow */
  maxDifficultyTier?: DifficultyTier;

  /** Starting difficulty tier (adaptive) */
  startingDifficultyTier?: DifficultyTier;
}

export interface SessionPlan {
  /** All questions for the session (no duplicates) */
  questions: Question[];

  /** Breakdown of question sources */
  breakdown: {
    focus: number;
    prerequisite: number;
    review: number;
  };

  /** Skill IDs covered in this session */
  skillsCovered: SkillId[];

  /** Difficulty range */
  difficultyRange: {
    min: DifficultyTier;
    max: DifficultyTier;
  };
}

// ==================== CONSTANTS ====================

const FOCUS_PERCENTAGE = 0.6; // 60% focus skill
const PREREQUISITE_PERCENTAGE = 0.2; // 20% prerequisites
const REVIEW_PERCENTAGE = 0.2; // 20% spaced review

const MAX_DIFFICULTY_JUMP = 1; // Can only jump 1 tier at a time
const VARIANTS_PER_TEMPLATE = 100; // How many variants exist per (template, gradeBand, tier)

// ==================== SESSION BUILDER ====================

/**
 * Build an adaptive training session
 */
export function buildSession(config: SessionConfig): SessionPlan {
  const {
    userAge,
    focusSkillId,
    questionCount,
    language,
    statsStore,
    masteredSkills,
    maxDifficultyTier = 5,
    startingDifficultyTier
  } = config;

  const gradeBand = ageToGradeBand(userAge);
  const usedQuestionIds = new Set<string>(); // Enforce uniqueness
  const questions: Question[] = [];

  // Calculate question distribution
  const focusCount = Math.floor(questionCount * FOCUS_PERCENTAGE);
  const prereqCount = Math.floor(questionCount * PREREQUISITE_PERCENTAGE);
  const reviewCount = questionCount - focusCount - prereqCount;

  let breakdown = {
    focus: 0,
    prerequisite: 0,
    review: 0
  };

  // Determine starting difficulty based on stats
  const focusStats = getOrCreateSkillStats(statsStore, focusSkillId);
  let currentTier: DifficultyTier = startingDifficultyTier || determineStartingDifficulty(focusStats);

  // 1. Add focus skill questions (60%)
  const focusQuestions = generateQuestionsForSkill(
    focusSkillId,
    focusCount,
    gradeBand,
    currentTier,
    maxDifficultyTier,
    language,
    usedQuestionIds,
    masteredSkills
  );
  questions.push(...focusQuestions);
  breakdown.focus = focusQuestions.length;

  // 2. Add prerequisite reinforcement (20%)
  const prereqSkills = getPrerequisiteSkills(focusSkillId, statsStore);
  const prereqQuestions = generateQuestionsForSkills(
    prereqSkills,
    prereqCount,
    gradeBand,
    Math.max(1, (currentTier - 1) as DifficultyTier), // Easier than focus
    maxDifficultyTier,
    language,
    usedQuestionIds,
    masteredSkills
  );
  questions.push(...prereqQuestions);
  breakdown.prerequisite = prereqQuestions.length;

  // 3. Add spaced review questions (20%)
  const reviewSkills = getSkillsDueForReview(statsStore, 5);
  const reviewQuestions = generateQuestionsForSkills(
    reviewSkills,
    reviewCount,
    gradeBand,
    currentTier,
    maxDifficultyTier,
    language,
    usedQuestionIds,
    masteredSkills
  );
  questions.push(...reviewQuestions);
  breakdown.review = reviewQuestions.length;

  // Shuffle questions so focus/prereq/review are mixed
  const shuffledQuestions = shuffleArray(questions);

  // Get skill coverage
  const skillsCovered = Array.from(new Set(shuffledQuestions.map(q => q.skillId)));

  // Get difficulty range
  const tiers = shuffledQuestions.map(q => q.difficultyTier);
  const difficultyRange = {
    min: Math.min(...tiers) as DifficultyTier,
    max: Math.max(...tiers) as DifficultyTier
  };

  return {
    questions: shuffledQuestions,
    breakdown,
    skillsCovered,
    difficultyRange
  };
}

/**
 * Determine starting difficulty based on skill stats
 */
function determineStartingDifficulty(stats: any): DifficultyTier {
  if (stats.attempts === 0) return 1; // Start easy for new skills

  const accuracy = stats.accuracy;
  const mastery = stats.masteryScore;

  // High mastery = harder difficulty
  if (mastery >= 0.8 && accuracy >= 85) return 4;
  if (mastery >= 0.6 && accuracy >= 75) return 3;
  if (mastery >= 0.4 && accuracy >= 65) return 2;

  return 1; // Default to easiest
}

/**
 * Generate questions for a single skill
 */
function generateQuestionsForSkill(
  skillId: SkillId,
  count: number,
  gradeBand: GradeBand,
  startingTier: DifficultyTier,
  maxTier: DifficultyTier,
  language: QuestionLanguage,
  usedIds: Set<string>,
  masteredSkills: Set<SkillId>
): Question[] {
  const questions: Question[] = [];
  let currentTier = startingTier;

  // Find templates matching this skill
  const templates = findTemplatesForSkill(skillId);

  if (templates.length === 0) {
    console.warn(`No templates found for skill: ${skillId}`);
    return questions;
  }

  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loops

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;

    // Pick random template and variant
    const template = templates[Math.floor(Math.random() * templates.length)];
    const variant = Math.floor(Math.random() * VARIANTS_PER_TEMPLATE);

    try {
      const question = generateQuestion(
        template.templateId,
        variant,
        gradeBand,
        currentTier,
        language
      );

      // Check uniqueness and prerequisites
      if (!usedIds.has(question.id) && checkPrerequisites(question, masteredSkills)) {
        questions.push(question);
        usedIds.add(question.id);

        // Adaptive difficulty: gradually increase if needed
        if (questions.length % 3 === 0 && currentTier < maxTier) {
          currentTier = Math.min(maxTier, (currentTier + 1) as DifficultyTier);
        }
      }
    } catch (error) {
      console.error(`Error generating question: ${error}`);
    }
  }

  return questions;
}

/**
 * Generate questions for multiple skills
 */
function generateQuestionsForSkills(
  skillIds: SkillId[],
  count: number,
  gradeBand: GradeBand,
  tier: DifficultyTier,
  maxTier: DifficultyTier,
  language: QuestionLanguage,
  usedIds: Set<string>,
  masteredSkills: Set<SkillId>
): Question[] {
  if (skillIds.length === 0) return [];

  const questionsPerSkill = Math.ceil(count / skillIds.length);
  const allQuestions: Question[] = [];

  for (const skillId of skillIds) {
    const questions = generateQuestionsForSkill(
      skillId,
      questionsPerSkill,
      gradeBand,
      tier,
      maxTier,
      language,
      usedIds,
      masteredSkills
    );
    allQuestions.push(...questions);
  }

  // Return only the requested count
  return allQuestions.slice(0, count);
}

/**
 * Find templates that match a skill ID
 */
function findTemplatesForSkill(skillId: SkillId): any[] {
  // Parse skill ID to extract topic
  const parts = skillId.split('_');
  const topicSlug = parts[1];

  // Find templates matching this topic
  const allTemplates = getAvailableTemplates();
  return allTemplates.filter(t => {
    const templateTopicSlug = t.topic.toLowerCase().replace(/\s+/g, '_');
    return templateTopicSlug === topicSlug;
  });
}

/**
 * Get prerequisite skills for a given skill
 */
function getPrerequisiteSkills(skillId: SkillId, statsStore: SkillStatsStore): SkillId[] {
  // For now, use heuristic based on skill hierarchy
  // In production, this would come from the question schema

  const parts = skillId.split('_');
  const domain = parts[0];
  const topic = parts[1];

  const prerequisites: SkillId[] = [];

  // Arithmetic prerequisites
  if (domain === 'arithmetic') {
    if (topic === 'multiplication') {
      prerequisites.push('arithmetic_addition');
    } else if (topic === 'division') {
      prerequisites.push('arithmetic_multiplication');
    } else if (topic === 'fractions') {
      prerequisites.push('arithmetic_division');
    }
  }

  // Geometry prerequisites
  if (domain === 'geometry') {
    if (topic === 'area') {
      prerequisites.push('arithmetic_multiplication');
    } else if (topic === 'perimeter') {
      prerequisites.push('arithmetic_addition');
    }
  }

  // Filter to only prerequisites that have been attempted
  return prerequisites.filter(prereq => {
    const stats = statsStore.skills.get(prereq);
    return stats && stats.attempts > 0;
  });
}

/**
 * Build a recommended session (adaptive)
 */
export function buildRecommendedSession(
  userAge: number,
  statsStore: SkillStatsStore,
  masteredSkills: Set<SkillId>,
  questionCount: number = 10,
  language: QuestionLanguage = 'en'
): SessionPlan {
  // Find weakest skill or skill due for review
  const weakSkills = getWeakSkills(statsStore, 3);
  const reviewSkills = getSkillsDueForReview(statsStore, 3);

  let focusSkillId: SkillId;

  if (weakSkills.length > 0) {
    // Focus on weakest skill
    focusSkillId = weakSkills[0];
  } else if (reviewSkills.length > 0) {
    // Focus on review
    focusSkillId = reviewSkills[0];
  } else {
    // Default to addition (always a good starting point)
    focusSkillId = 'arithmetic_addition';
  }

  return buildSession({
    userAge,
    focusSkillId,
    questionCount,
    language,
    statsStore,
    masteredSkills
  });
}

/**
 * Build a grade-aligned session
 */
export function buildGradeSession(
  userAge: number,
  grade: number,
  statsStore: SkillStatsStore,
  masteredSkills: Set<SkillId>,
  questionCount: number = 10,
  language: QuestionLanguage = 'en'
): SessionPlan {
  // Map grade to appropriate skills
  const focusSkillId = getSkillForGrade(grade);

  return buildSession({
    userAge,
    focusSkillId,
    questionCount,
    language,
    statsStore,
    masteredSkills
  });
}

/**
 * Get appropriate skill for grade level
 */
function getSkillForGrade(grade: number): SkillId {
  if (grade <= 2) return 'arithmetic_addition';
  if (grade <= 3) return 'arithmetic_subtraction';
  if (grade <= 4) return 'arithmetic_multiplication';
  if (grade <= 5) return 'arithmetic_division';
  if (grade <= 6) return 'geometry_perimeter';
  if (grade <= 7) return 'geometry_area';
  return 'logic_patterns';
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Validate session (no duplicates)
 */
export function validateSession(plan: SessionPlan): boolean {
  const ids = plan.questions.map(q => q.id);
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    console.error('Session contains duplicate questions!');
    return false;
  }

  return true;
}
