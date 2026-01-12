/**
 * 📉 Skill Decay System
 *
 * Handles skill degradation after inactivity:
 * - 5-day grace period (no decay)
 * - 20% decay over next 7 days (gradual, not instant)
 * - Logs decay events to skill history
 */

import { AvatarProfile, CoreSkills, SecondarySkills } from '../avatar/types';

// ==================== CONSTANTS ====================

const GRACE_PERIOD_DAYS = 5;
const DECAY_PERIOD_DAYS = 7;
const MAX_DECAY_PERCENTAGE = 0.20; // 20%

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Skills that decay (not all skills decay equally)
const CORE_SKILLS_DECAY_RATES: Record<keyof CoreSkills, number> = {
  arithmetic: 1.0,   // Full decay rate
  geometry: 1.0,     // Full decay rate
  logic: 0.8,        // 80% of normal decay (logic is more persistent)
  speed: 1.2,        // 120% decay (speed degrades faster)
  accuracy: 1.0,     // Full decay rate
  focus: 0.9         // 90% decay (focus is somewhat persistent)
};

const SECONDARY_SKILLS_DECAY_RATES: Record<keyof SecondarySkills, number> = {
  addition: 1.0,
  subtraction: 1.0,
  multiplication: 1.0,
  division: 1.0,
  fractions: 1.2,        // Decays faster (harder to maintain)
  decimals: 1.2,         // Decays faster
  percentages: 1.1,      // Decays slightly faster
  shapes: 0.9,           // Decays slower (visual memory is persistent)
  perimeter: 1.0,
  area: 1.0,
  volume: 1.1,
  angles: 1.0,
  patterns: 0.8,         // Decays slower (pattern recognition is persistent)
  sequences: 0.8,        // Decays slower
  deduction: 0.7,        // Decays slowest (deduction skills are very persistent)
  problemSolving: 0.7,   // Decays slowest
  concentration: 1.0,
  timeManagement: 1.0
};

// ==================== DECAY CALCULATION ====================

/**
 * Calculate decay factor based on days inactive
 *
 * Formula:
 * - Days 0-5: No decay (grace period)
 * - Days 6-12: Linear decay from 0% to 20%
 * - Days 13+: Capped at 20% decay
 *
 * Returns a decay factor between 0.0 and 0.20
 */
export function calculateDecayFactor(daysInactive: number): number {
  if (daysInactive <= GRACE_PERIOD_DAYS) {
    return 0; // No decay during grace period
  }

  const daysInDecayPeriod = daysInactive - GRACE_PERIOD_DAYS;

  if (daysInDecayPeriod >= DECAY_PERIOD_DAYS) {
    return MAX_DECAY_PERCENTAGE; // Max decay reached
  }

  // Linear decay: 0% to 20% over 7 days
  return MAX_DECAY_PERCENTAGE * (daysInDecayPeriod / DECAY_PERIOD_DAYS);
}

/**
 * Get days since last activity
 */
export function getDaysSinceLastActivity(lastActiveAt: number): number {
  const now = Date.now();
  const timeDiff = now - lastActiveAt;
  return Math.floor(timeDiff / MS_PER_DAY);
}

// ==================== APPLY SKILL DECAY ====================

/**
 * Apply skill decay to avatar profile
 * Returns updated avatar with decay applied and history logged
 */
export function applySkillDecay(avatar: AvatarProfile): AvatarProfile {
  const daysInactive = getDaysSinceLastActivity(avatar.lastActiveAt);

  // No decay if within grace period
  if (daysInactive <= GRACE_PERIOD_DAYS) {
    return avatar;
  }

  const baseDecayFactor = calculateDecayFactor(daysInactive);
  const updatedAvatar = { ...avatar };
  const timestamp = Date.now();
  const reason = `Затухание навыка (${daysInactive} дней неактивности)`;

  // Apply decay to core skills
  Object.entries(updatedAvatar.coreSkills).forEach(([skill, value]) => {
    const skillKey = skill as keyof CoreSkills;
    const skillDecayRate = CORE_SKILLS_DECAY_RATES[skillKey];
    const actualDecayFactor = baseDecayFactor * skillDecayRate;

    const decayAmount = Math.floor(value * actualDecayFactor);

    if (decayAmount > 0) {
      const newValue = Math.max(1, value - decayAmount); // Never go below 1
      updatedAvatar.coreSkills[skillKey] = newValue;

      // Log to history
      updatedAvatar.skillHistory.push({
        skill: skillKey,
        change: -(value - newValue),
        newValue,
        timestamp,
        reason
      });
    }
  });

  // Apply decay to secondary skills
  Object.entries(updatedAvatar.secondarySkills).forEach(([skill, value]) => {
    const skillKey = skill as keyof SecondarySkills;
    const skillDecayRate = SECONDARY_SKILLS_DECAY_RATES[skillKey];
    const actualDecayFactor = baseDecayFactor * skillDecayRate;

    const decayAmount = Math.floor(value * actualDecayFactor);

    if (decayAmount > 0) {
      const newValue = Math.max(1, value - decayAmount); // Never go below 1
      updatedAvatar.secondarySkills[skillKey] = newValue;

      // Log to history
      updatedAvatar.skillHistory.push({
        skill: skillKey,
        change: -(value - newValue),
        newValue,
        timestamp,
        reason
      });
    }
  });

  // Limit history to last 100 events
  if (updatedAvatar.skillHistory.length > 100) {
    updatedAvatar.skillHistory = updatedAvatar.skillHistory.slice(-100);
  }

  return updatedAvatar;
}

// ==================== DECAY PREVENTION ====================

/**
 * Check if decay will occur and return warning information
 */
export interface DecayWarning {
  willDecay: boolean;
  daysUntilDecay: number;
  currentDecayFactor: number;
  message: string;
}

export function getDecayWarning(lastActiveAt: number): DecayWarning {
  const daysInactive = getDaysSinceLastActivity(lastActiveAt);
  const decayFactor = calculateDecayFactor(daysInactive);

  if (daysInactive < GRACE_PERIOD_DAYS) {
    return {
      willDecay: false,
      daysUntilDecay: GRACE_PERIOD_DAYS - daysInactive,
      currentDecayFactor: 0,
      message: `✅ Навыки в безопасности! Осталось ${GRACE_PERIOD_DAYS - daysInactive} дней до начала затухания.`
    };
  }

  if (daysInactive < GRACE_PERIOD_DAYS + DECAY_PERIOD_DAYS) {
    const decayPercentage = (decayFactor * 100).toFixed(0);
    return {
      willDecay: true,
      daysUntilDecay: 0,
      currentDecayFactor: decayFactor,
      message: `⚠️ Навыки затухают! Текущее затухание: ${decayPercentage}%. Тренируйтесь, чтобы восстановить!`
    };
  }

  return {
    willDecay: true,
    daysUntilDecay: 0,
    currentDecayFactor: MAX_DECAY_PERCENTAGE,
    message: `❌ Максимальное затухание навыков (20%)! Пора вернуться к тренировкам!`
  };
}

/**
 * Freeze streak if user has freeze powerup
 */
export function freezeStreak(avatar: AvatarProfile): AvatarProfile {
  return {
    ...avatar,
    streakFrozen: true
  };
}

/**
 * Unfreeze streak
 */
export function unfreezeStreak(avatar: AvatarProfile): AvatarProfile {
  return {
    ...avatar,
    streakFrozen: false
  };
}

// ==================== EXPORTS ====================

export default {
  calculateDecayFactor,
  getDaysSinceLastActivity,
  applySkillDecay,
  getDecayWarning,
  freezeStreak,
  unfreezeStreak,
  GRACE_PERIOD_DAYS,
  DECAY_PERIOD_DAYS,
  MAX_DECAY_PERCENTAGE
};

console.log('📉 Skill decay system loaded');
