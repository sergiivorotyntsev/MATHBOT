/**
 * 📈 Skill Gain System v3.0 - GAME STATS UPDATE
 *
 * Calculates and applies skill gains based on:
 * - Math topic practiced
 * - XP earned
 * - Difficulty level
 * - Speed performance
 *
 * Uses skillWeights config to distribute gains across:
 * - Math skills (topic proficiency)
 * - Game stats (RPG battle stats)
 */

import { AvatarProfile, SkillChangeEvent } from '../avatar/types';
import { MathSkillKey } from '../types/mathSkills';
import { GameStats, applyStatChanges, clampStat } from '../types/gameStats';
import { MathSkills, applySkillChanges, clampSkill } from '../types/mathSkills';
import { calculateSkillGains as calcGainsFromWeights } from '../config/skillWeights';

// ==================== TYPES ====================

export interface SkillGainResult {
  mathSkills: Partial<MathSkills>;
  gameStats: Partial<GameStats>;
}

// ==================== CALCULATE SKILL GAINS ====================

/**
 * Calculate skill gains for a completed task
 *
 * @param topic - The math topic being practiced
 * @param xpEarned - XP earned from the task
 * @param correct - Whether answer was correct
 * @param timeSpent - Time spent on task (seconds)
 * @param timeLimit - Time limit for task (seconds)
 * @returns Object with mathSkills and gameStats gains
 */
export function calculateSkillGains(
  topic: MathSkillKey,
  xpEarned: number,
  correct: boolean,
  timeSpent: number = 0,
  timeLimit: number = 45
): SkillGainResult {
  if (!correct || xpEarned <= 0) {
    return { mathSkills: {}, gameStats: {} };
  }

  // Calculate speed bonus (0-1)
  const speedRatio = timeLimit > 0 ? Math.min(1, timeSpent / timeLimit) : 1;
  const speedBonus = Math.max(0, 1 - speedRatio); // 0 = slow, 1 = instant

  // Estimate difficulty from XP (rough heuristic)
  // baseXP=15, so ~15-25 = easy, ~25-40 = medium, ~40+ = hard
  const estimatedDifficulty = Math.min(5, Math.max(1, Math.floor(xpEarned / 10)));

  // Use skillWeights to calculate gains
  const gains = calcGainsFromWeights(
    topic,
    xpEarned,
    estimatedDifficulty,
    correct,
    speedBonus
  );

  return gains;
}

// ==================== APPLY SKILL GAINS ====================

/**
 * Apply skill gains to avatar profile
 *
 * @param avatar - Current avatar profile
 * @param gains - Skill gains to apply
 * @param reason - Reason for skill change (for history)
 * @returns Updated avatar profile
 */
export function applySkillGains(
  avatar: AvatarProfile,
  gains: SkillGainResult,
  reason: string = 'training'
): AvatarProfile {
  const now = Date.now();
  const skillHistory: SkillChangeEvent[] = [...avatar.skillHistory];

  // Apply math skill gains
  const newMathSkills = applySkillChanges(avatar.mathSkills, gains.mathSkills);

  // Track math skill changes in history
  for (const [skill, gain] of Object.entries(gains.mathSkills)) {
    if (typeof gain === 'number' && gain !== 0) {
      const oldValue = avatar.mathSkills[skill as MathSkillKey];
      const newValue = newMathSkills[skill as MathSkillKey];

      skillHistory.push({
        timestamp: now,
        skill: skill,
        change: gain,
        newValue: newValue,
        reason: 'training',
        details: reason
      });
    }
  }

  // Apply game stat gains
  const newGameStats = applyStatChanges(avatar.gameStats, gains.gameStats);

  // Track game stat changes in history
  for (const [stat, gain] of Object.entries(gains.gameStats)) {
    if (typeof gain === 'number' && gain !== 0) {
      const oldValue = avatar.gameStats[stat as keyof GameStats];
      const newValue = newGameStats[stat as keyof GameStats];

      skillHistory.push({
        timestamp: now,
        skill: stat,
        change: gain,
        newValue: newValue,
        reason: 'training',
        details: reason
      });
    }
  }

  // Keep history manageable (last 100 events)
  const trimmedHistory = skillHistory.slice(-100);

  return {
    ...avatar,
    mathSkills: newMathSkills,
    gameStats: newGameStats,
    skillHistory: trimmedHistory,
    lastTrainingAt: now,
    lastActiveAt: now
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get total skill progress (0-100%)
 * Average of all math skills
 */
export function getTotalMathProgress(mathSkills: MathSkills): number {
  const skills = Object.values(mathSkills);
  if (skills.length === 0) return 0;

  const sum = skills.reduce((acc, val) => acc + (val || 0), 0);
  const avg = sum / skills.length;

  return clampSkill(avg);
}

/**
 * Get total game stats power (0-100%)
 * Average of all game stats
 */
export function getTotalGamePower(gameStats: GameStats): number {
  const stats = Object.values(gameStats);
  if (stats.length === 0) return 0;

  const sum = stats.reduce((acc, val) => acc + (val || 0), 0);
  const avg = sum / stats.length;

  return clampStat(avg);
}

/**
 * Get skill level from skill value (0-100 → level 1-10)
 */
export function getSkillLevel(skillValue: number): number {
  return Math.floor(clampSkill(skillValue) / 10) + 1;
}

/**
 * Check if skill leveled up
 */
export function didSkillLevelUp(oldValue: number, newValue: number): boolean {
  return getSkillLevel(newValue) > getSkillLevel(oldValue);
}

/**
 * Format skill gains for display
 */
export function formatSkillGains(gains: SkillGainResult): string {
  const mathGains = Object.entries(gains.mathSkills)
    .filter(([_, gain]) => (gain || 0) > 0)
    .map(([skill, gain]) => `${skill}: +${gain?.toFixed(1)}`)
    .join(', ');

  const gameGains = Object.entries(gains.gameStats)
    .filter(([_, gain]) => (gain || 0) > 0)
    .map(([stat, gain]) => `${stat}: +${gain?.toFixed(1)}`)
    .join(', ');

  return `Math: ${mathGains || 'none'}\nStats: ${gameGains || 'none'}`;
}

console.log('📈 Skill Gain System v3.0 loaded (Game Stats Update)');
