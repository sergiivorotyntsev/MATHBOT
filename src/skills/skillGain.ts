/**
 * ✨ Skill Gain System
 *
 * Maps tasks to avatar skills and distributes XP
 * Primary skill gets 70%, secondary skills get 30% total
 */

import { AvatarProfile, CoreSkills, SecondarySkills } from '../avatar/types';
import { SkillType } from '../data/taskBank';

// ==================== TYPES ====================

export interface SkillMapping {
  primaryCoreSkill: keyof CoreSkills;
  secondaryCoreSkills: Array<keyof CoreSkills>;
  primarySecondarySkills: Array<keyof SecondarySkills>;
  secondarySecondarySkills: Array<keyof SecondarySkills>;
}

export interface SkillGainResult {
  coreSkillGains: Partial<Record<keyof CoreSkills, number>>;
  secondarySkillGains: Partial<Record<keyof SecondarySkills, number>>;
  totalXPDistributed: number;
}

// ==================== SKILL MAPPINGS ====================

/**
 * Map task types to avatar skills
 * Each task type affects multiple skills with different weights
 */
export const SKILL_MAPPINGS: Record<SkillType, SkillMapping> = {
  arithmetic: {
    primaryCoreSkill: 'arithmetic',
    secondaryCoreSkills: ['speed', 'accuracy'],
    primarySecondarySkills: ['addition', 'subtraction', 'multiplication', 'division'],
    secondarySecondarySkills: ['concentration', 'timeManagement']
  },
  geometry: {
    primaryCoreSkill: 'geometry',
    secondaryCoreSkills: ['logic', 'accuracy'],
    primarySecondarySkills: ['shapes', 'area', 'perimeter', 'angles'],
    secondarySecondarySkills: ['problemSolving', 'concentration']
  },
  logic: {
    primaryCoreSkill: 'logic',
    secondaryCoreSkills: ['focus', 'accuracy'],
    primarySecondarySkills: ['patterns', 'sequences', 'deduction', 'problemSolving'],
    secondarySecondarySkills: ['concentration', 'timeManagement']
  }
};

// ==================== DISTRIBUTION WEIGHTS ====================

const PRIMARY_CORE_WEIGHT = 0.40;      // 40% to primary core skill
const SECONDARY_CORE_WEIGHT = 0.15;    // 15% total to secondary core skills
const PRIMARY_SECONDARY_WEIGHT = 0.30; // 30% total to primary secondary skills
const SECONDARY_SECONDARY_WEIGHT = 0.15; // 15% total to secondary secondary skills

// ==================== SKILL GAIN CALCULATION ====================

/**
 * Calculate skill gains from completing a task
 */
export function calculateSkillGains(
  taskType: SkillType,
  xpGained: number,
  correct: boolean,
  timeTaken: number,
  timeLimit: number
): SkillGainResult {
  if (!correct || xpGained <= 0) {
    return {
      coreSkillGains: {},
      secondarySkillGains: {},
      totalXPDistributed: 0
    };
  }

  const mapping = SKILL_MAPPINGS[taskType];
  const coreSkillGains: Partial<Record<keyof CoreSkills, number>> = {};
  const secondarySkillGains: Partial<Record<keyof SecondarySkills, number>> = {};

  // Primary core skill (40%)
  const primaryCoreXP = Math.floor(xpGained * PRIMARY_CORE_WEIGHT);
  coreSkillGains[mapping.primaryCoreSkill] = primaryCoreXP;

  // Secondary core skills (15% total, divided equally)
  const secondaryCoreXPEach = Math.floor(
    (xpGained * SECONDARY_CORE_WEIGHT) / mapping.secondaryCoreSkills.length
  );
  mapping.secondaryCoreSkills.forEach(skill => {
    coreSkillGains[skill] = (coreSkillGains[skill] || 0) + secondaryCoreXPEach;
  });

  // Speed skill bonus if answered quickly
  if (timeTaken < timeLimit * 0.5) {
    coreSkillGains.speed = (coreSkillGains.speed || 0) + Math.floor(xpGained * 0.05);
  }

  // Accuracy skill bonus (always, since correct answer)
  coreSkillGains.accuracy = (coreSkillGains.accuracy || 0) + Math.floor(xpGained * 0.05);

  // Focus skill bonus if no errors (would need combo tracking)
  coreSkillGains.focus = (coreSkillGains.focus || 0) + Math.floor(xpGained * 0.03);

  // Primary secondary skills (30% total, divided equally)
  const primarySecondaryXPEach = Math.floor(
    (xpGained * PRIMARY_SECONDARY_WEIGHT) / mapping.primarySecondarySkills.length
  );
  mapping.primarySecondarySkills.forEach(skill => {
    secondarySkillGains[skill] = (secondarySkillGains[skill] || 0) + primarySecondaryXPEach;
  });

  // Secondary secondary skills (15% total, divided equally)
  const secondarySecondaryXPEach = Math.floor(
    (xpGained * SECONDARY_SECONDARY_WEIGHT) / mapping.secondarySecondarySkills.length
  );
  mapping.secondarySecondarySkills.forEach(skill => {
    secondarySkillGains[skill] = (secondarySkillGains[skill] || 0) + secondarySecondaryXPEach;
  });

  // Calculate total distributed
  const totalCoreXP = Object.values(coreSkillGains).reduce((sum, val) => sum + val, 0);
  const totalSecondaryXP = Object.values(secondarySkillGains).reduce((sum, val) => sum + val, 0);

  return {
    coreSkillGains,
    secondarySkillGains,
    totalXPDistributed: totalCoreXP + totalSecondaryXP
  };
}

// ==================== APPLY SKILL GAINS ====================

/**
 * Apply skill gains to avatar profile
 * Returns updated avatar profile with skill history events
 */
export function applySkillGains(
  avatar: AvatarProfile,
  gains: SkillGainResult,
  reason: string = 'Completed task'
): AvatarProfile {
  const updatedAvatar = { ...avatar };
  const timestamp = Date.now();

  // Apply core skill gains
  Object.entries(gains.coreSkillGains).forEach(([skill, xp]) => {
    const skillKey = skill as keyof CoreSkills;
    const currentValue = updatedAvatar.coreSkills[skillKey];
    const newValue = Math.min(100, currentValue + Math.floor(xp / 10)); // Scale XP to skill points

    if (newValue !== currentValue) {
      updatedAvatar.coreSkills[skillKey] = newValue;

      // Add to history
      updatedAvatar.skillHistory.push({
        skill: skillKey,
        change: newValue - currentValue,
        newValue,
        timestamp,
        reason
      });
    }
  });

  // Apply secondary skill gains
  Object.entries(gains.secondarySkillGains).forEach(([skill, xp]) => {
    const skillKey = skill as keyof SecondarySkills;
    const currentValue = updatedAvatar.secondarySkills[skillKey];
    const newValue = Math.min(100, currentValue + Math.floor(xp / 15)); // Scale XP to skill points

    if (newValue !== currentValue) {
      updatedAvatar.secondarySkills[skillKey] = newValue;

      // Add to history
      updatedAvatar.skillHistory.push({
        skill: skillKey,
        change: newValue - currentValue,
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

  // Update last training timestamp
  updatedAvatar.lastTrainingAt = timestamp;
  updatedAvatar.lastActiveAt = timestamp;

  return updatedAvatar;
}

// ==================== DETAILED BREAKDOWN ====================

/**
 * Get a detailed breakdown of skill gains for UI display
 */
export function formatSkillGainBreakdown(gains: SkillGainResult): string {
  const lines: string[] = ['📈 Улучшение навыков:'];

  if (Object.keys(gains.coreSkillGains).length > 0) {
    lines.push('\n🌟 Основные навыки:');
    Object.entries(gains.coreSkillGains).forEach(([skill, xp]) => {
      lines.push(`  ${skill}: +${Math.floor(xp / 10)} очков`);
    });
  }

  if (Object.keys(gains.secondarySkillGains).length > 0) {
    lines.push('\n📚 Дополнительные навыки:');
    Object.entries(gains.secondarySkillGains).forEach(([skill, xp]) => {
      lines.push(`  ${skill}: +${Math.floor(xp / 15)} очков`);
    });
  }

  return lines.join('\n');
}

// ==================== EXPORTS ====================

export default {
  calculateSkillGains,
  applySkillGains,
  formatSkillGainBreakdown,
  SKILL_MAPPINGS
};

console.log('✨ Skill gain system loaded');
