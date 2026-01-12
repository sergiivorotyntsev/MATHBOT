/**
 * 🔄 Data Migration Utilities
 *
 * Migrates old avatar profiles to new system:
 * - Old CoreSkills (arithmetic, geometry, logic, speed, accuracy, focus) → New GameStats
 * - Old SecondarySkills → MathSkills (unchanged structure, just renamed concept)
 *
 * CRITICAL: Preserves user progress during system upgrade
 */

import { GameStats, createDefaultGameStats, clampStat } from '../types/gameStats';
import { MathSkills, createDefaultMathSkills, clampSkill } from '../types/mathSkills';

// Old system types (for migration only)
interface OldCoreSkills {
  arithmetic: number;
  geometry: number;
  logic: number;
  speed: number;
  accuracy: number;
  focus: number;
}

interface OldSecondarySkills {
  addition: number;
  subtraction: number;
  multiplication: number;
  division: number;
  fractions: number;
  decimals: number;
  percentages: number;
  shapes: number;
  perimeter: number;
  area: number;
  volume: number;
  angles: number;
  patterns: number;
  sequences: number;
  problemSolving: number;
  wordProblems: number;
}

/**
 * Migrate old CoreSkills to new GameStats
 *
 * Mapping strategy:
 * - arithmetic → strength (math power = physical power)
 * - geometry → defense (spatial awareness = defense)
 * - logic → magic (pattern recognition = spellcasting)
 * - speed → agility (speed = agility)
 * - accuracy → luck (precision = fortune)
 * - focus → focus (unchanged)
 * - wisdom = average of arithmetic, geometry, logic (knowledge accumulation)
 *
 * All stats clamped to 1-100 range
 */
export function migrateOldCoreSkillsToGameStats(oldSkills: OldCoreSkills): GameStats {
  const defaults = createDefaultGameStats();

  // Direct mappings
  const strength = clampStat(oldSkills.arithmetic);
  const agility = clampStat(oldSkills.speed);
  const defense = clampStat(oldSkills.geometry);
  const magic = clampStat(oldSkills.logic);
  const luck = clampStat(oldSkills.accuracy);
  const focus = clampStat(oldSkills.focus);

  // Wisdom = average of math skills (knowledge accumulation)
  const wisdom = clampStat(
    Math.round((oldSkills.arithmetic + oldSkills.geometry + oldSkills.logic) / 3)
  );

  return {
    strength,
    agility,
    defense,
    magic,
    wisdom,
    luck,
    focus
  };
}

/**
 * Migrate old SecondarySkills to MathSkills
 *
 * Structure is identical, just conceptually renamed.
 * We preserve all values as-is.
 */
export function migrateOldSecondarySkillsToMathSkills(oldSkills: OldSecondarySkills): MathSkills {
  return {
    addition: clampSkill(oldSkills.addition || 0),
    subtraction: clampSkill(oldSkills.subtraction || 0),
    multiplication: clampSkill(oldSkills.multiplication || 0),
    division: clampSkill(oldSkills.division || 0),
    fractions: clampSkill(oldSkills.fractions || 0),
    decimals: clampSkill(oldSkills.decimals || 0),
    percentages: clampSkill(oldSkills.percentages || 0),
    shapes: clampSkill(oldSkills.shapes || 0),
    perimeter: clampSkill(oldSkills.perimeter || 0),
    area: clampSkill(oldSkills.area || 0),
    volume: clampSkill(oldSkills.volume || 0),
    angles: clampSkill(oldSkills.angles || 0),
    patterns: clampSkill(oldSkills.patterns || 0),
    sequences: clampSkill(oldSkills.sequences || 0),
    problemSolving: clampSkill(oldSkills.problemSolving || 0),
    wordProblems: clampSkill(oldSkills.wordProblems || 0)
  };
}

/**
 * Detect if an avatar profile needs migration
 */
export function needsMigration(avatarProfile: any): boolean {
  if (!avatarProfile) return false;

  // Check if it has old structure (coreSkills with arithmetic/geometry/logic)
  if (
    avatarProfile.coreSkills &&
    'arithmetic' in avatarProfile.coreSkills &&
    !('strength' in avatarProfile.coreSkills)
  ) {
    return true;
  }

  return false;
}

/**
 * Migrate complete avatar profile
 */
export function migrateAvatarProfile(oldProfile: any): any {
  if (!needsMigration(oldProfile)) {
    return oldProfile; // Already migrated or new profile
  }

  console.log('🔄 Migrating avatar profile from old system...');

  const migratedProfile = {
    ...oldProfile,
    gameStats: migrateOldCoreSkillsToGameStats(oldProfile.coreSkills),
    mathSkills: migrateOldSecondarySkillsToMathSkills(oldProfile.secondarySkills)
  };

  // Remove old fields
  delete migratedProfile.coreSkills;
  delete migratedProfile.secondarySkills;

  console.log('✅ Migration complete!');
  console.log('  Old arithmetic:', oldProfile.coreSkills.arithmetic, '→ New strength:', migratedProfile.gameStats.strength);
  console.log('  Old geometry:', oldProfile.coreSkills.geometry, '→ New defense:', migratedProfile.gameStats.defense);
  console.log('  Old logic:', oldProfile.coreSkills.logic, '→ New magic:', migratedProfile.gameStats.magic);

  return migratedProfile;
}

/**
 * Migrate skill history events
 * Updates skill names in history from old → new
 */
export function migrateSkillHistory(skillHistory: any[]): any[] {
  if (!skillHistory || skillHistory.length === 0) return [];

  const skillMapping: Record<string, string> = {
    arithmetic: 'strength',
    geometry: 'defense',
    logic: 'magic',
    speed: 'agility',
    accuracy: 'luck'
    // focus remains focus
  };

  return skillHistory.map(event => {
    const newSkill = skillMapping[event.skill] || event.skill;
    return {
      ...event,
      skill: newSkill,
      details: event.details ? `[Migrated] ${event.details}` : '[Migrated from old system]'
    };
  });
}

/**
 * Safe migration wrapper with error handling
 */
export function safelyMigrateProfile(profile: any): any {
  try {
    if (!profile) return null;

    if (needsMigration(profile)) {
      const migrated = migrateAvatarProfile(profile);

      // Migrate skill history if exists
      if (profile.skillHistory && profile.skillHistory.length > 0) {
        migrated.skillHistory = migrateSkillHistory(profile.skillHistory);
      }

      return migrated;
    }

    return profile;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.warn('⚠️ Returning original profile to prevent data loss');
    return profile;
  }
}

console.log('🔄 Data migration utilities loaded');
