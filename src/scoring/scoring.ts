/**
 * 📊 Scoring System
 *
 * Unified scoring module for calculating XP rewards based on:
 * - Speed coefficient (1.00-1.15)
 * - Difficulty coefficient
 * - Accuracy
 * - Combo bonuses
 */

// ==================== TYPES ====================

export interface ScoreBreakdown {
  basePoints: number;
  speedCoefficient: number;
  difficultyCoefficient: number;
  accuracyCoefficient: number;
  comboBonus: number;
  totalScore: number;
  xpGained: number;
}

export interface ScoreCalculationParams {
  correct: boolean;
  timeSpent: number; // seconds
  timeLimit: number; // seconds
  difficulty: number; // 1-5
  combo: number; // current combo count
  taskType?: 'training' | 'learning' | 'pvp';
}

// ==================== CONSTANTS ====================

const BASE_XP = 15;
const SPEED_COEFFICIENT_MIN = 1.0;
const SPEED_COEFFICIENT_MAX = 1.15;
const COMBO_MULTIPLIER = 0.05; // 5% per combo level

// Difficulty coefficients
const DIFFICULTY_COEFFICIENTS: Record<number, number> = {
  1: 1.0,
  2: 1.15,
  3: 1.3,
  4: 1.5,
  5: 1.75
};

// Training type coefficients (for PHASE 2 expansion)
export const TRAINING_TYPE_COEFFICIENTS: Record<string, number> = {
  focused: 1.0,        // Focused Topic - standard
  mixed: 1.1,          // Mixed Topics - 10% bonus
  speedRun: 1.2,       // Speed Run - 20% bonus
  accuracy: 1.15,      // Accuracy Mode - 15% bonus
  challenge: 1.3,      // Challenge Mode - 30% bonus
  mastery: 1.5         // Mastery Mode - 50% bonus
};

// ==================== SPEED COEFFICIENT CALCULATION ====================

/**
 * Calculate speed coefficient based on time spent
 * Formula: coefficient = clamp(1.0, 1.15, 1.0 + 0.15 * (1 - timeSpent/timeLimit))
 *
 * Examples:
 * - Answer in 0s (instant): 1.15 (max)
 * - Answer in 50% of time: 1.075
 * - Answer at time limit: 1.00 (min)
 * - Answer after time limit: 1.00 (min, clamped)
 */
export function calculateSpeedCoefficient(
  timeSpent: number,
  timeLimit: number
): number {
  if (timeLimit <= 0) return SPEED_COEFFICIENT_MIN;

  const timeRatio = Math.min(1, timeSpent / timeLimit);
  const coefficient = SPEED_COEFFICIENT_MIN +
    (SPEED_COEFFICIENT_MAX - SPEED_COEFFICIENT_MIN) * (1 - timeRatio);

  return Math.max(
    SPEED_COEFFICIENT_MIN,
    Math.min(SPEED_COEFFICIENT_MAX, coefficient)
  );
}

// ==================== COMBO BONUS CALCULATION ====================

/**
 * Calculate combo bonus
 * Formula: combo * COMBO_MULTIPLIER (5% per combo level)
 *
 * Examples:
 * - Combo 0: 0% bonus
 * - Combo 5: 25% bonus
 * - Combo 10: 50% bonus
 */
export function calculateComboBonus(combo: number): number {
  return combo * COMBO_MULTIPLIER;
}

// ==================== MAIN SCORING FUNCTION ====================

/**
 * Calculate final score and XP with detailed breakdown
 */
export function calculateScore(params: ScoreCalculationParams): ScoreBreakdown {
  const {
    correct,
    timeSpent,
    timeLimit,
    difficulty,
    combo,
    taskType = 'training'
  } = params;

  // If answer is incorrect, return zero score
  if (!correct) {
    return {
      basePoints: 0,
      speedCoefficient: 0,
      difficultyCoefficient: 0,
      accuracyCoefficient: 0,
      comboBonus: 0,
      totalScore: 0,
      xpGained: 0
    };
  }

  // Calculate coefficients
  const speedCoef = calculateSpeedCoefficient(timeSpent, timeLimit);
  const difficultyCoef = DIFFICULTY_COEFFICIENTS[difficulty] || 1.0;
  const accuracyCoef = 1.0; // Full accuracy for correct answer
  const comboBonus = calculateComboBonus(combo);

  // Calculate base points
  const basePoints = BASE_XP;

  // Calculate total score
  // Formula: basePoints * speedCoef * difficultyCoef * accuracyCoef * (1 + comboBonus)
  const totalScore = Math.floor(
    basePoints *
    speedCoef *
    difficultyCoef *
    accuracyCoef *
    (1 + comboBonus)
  );

  return {
    basePoints,
    speedCoefficient: speedCoef,
    difficultyCoefficient: difficultyCoef,
    accuracyCoefficient: accuracyCoef,
    comboBonus,
    totalScore,
    xpGained: totalScore
  };
}

// ==================== LEGACY COMPATIBILITY ====================

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateScore() instead
 */
export function calculateXPReward(
  baseXP: number,
  combo: number,
  timeTaken: number,
  timeLimit: number,
  difficulty: number,
  superSkillActive: boolean = false
): number {
  const score = calculateScore({
    correct: true,
    timeSpent: timeTaken,
    timeLimit,
    difficulty,
    combo
  });

  // Apply super skill multiplier if active
  return superSkillActive ? Math.floor(score.xpGained * 1.5) : score.xpGained;
}

// ==================== SCORE BREAKDOWN FORMATTING ====================

/**
 * Format score breakdown for display in UI
 */
export function formatScoreBreakdown(breakdown: ScoreBreakdown): string {
  return `
📊 Разбор очков:

Базовые очки: ${breakdown.basePoints}
⚡ Коэффициент скорости: x${breakdown.speedCoefficient.toFixed(2)}
⭐ Коэффициент сложности: x${breakdown.difficultyCoefficient.toFixed(2)}
🎯 Коэффициент точности: x${breakdown.accuracyCoefficient.toFixed(2)}
🔥 Бонус комбо: +${(breakdown.comboBonus * 100).toFixed(0)}%

💰 Итого XP: ${breakdown.xpGained}
  `.trim();
}

// ==================== EXPORTS ====================

export default {
  calculateScore,
  calculateSpeedCoefficient,
  calculateComboBonus,
  calculateXPReward,
  formatScoreBreakdown,
  TRAINING_TYPE_COEFFICIENTS
};

console.log('📊 Scoring system loaded');
