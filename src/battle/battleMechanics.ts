/**
 * ⚔️ MathBot Arena - Battle Mechanics
 * Core battle system with damage calculation, combos, and special effects
 */

import { Task, SkillType } from '../data/taskBank';
import { AvatarType } from '../data/avatars';

// ==================== TYPES ====================

export interface BattleHero {
  id: string;
  userId: string;
  name: string;
  archetype: AvatarType;
  level: number;

  // Combat Stats
  maxHP: number;
  currentHP: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;

  // Skill Levels
  arithmeticLevel: number;
  geometryLevel: number;
  logicLevel: number;

  // Battle State
  comboStreak: number;
  dodgeChance: number;
  blockChance: number;
  ultimateCharge: number; // 0-100

  // Active Effects
  activeBuffs: Buff[];
  activeDebuffs: Debuff[];
}

export interface Buff {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'speed' | 'crit';
  value: number; // Multiplier or flat bonus
  duration: number; // Rounds remaining
  icon: string;
}

export interface Debuff extends Buff {
  // Same structure, but negative effects
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  isBlocked: boolean;
  displayText: string;
  animation: AnimationType;
}

export type AnimationType =
  | 'normal_hit'
  | 'critical_hit'
  | 'dodge'
  | 'block'
  | 'ultimate';

export interface RoundResult {
  type: 'ATTACK' | 'DRAW' | 'BOTH_WRONG';
  attacker?: string; // player ID
  defender?: string;
  damage?: DamageResult;
  winner?: string;
}

// ==================== BATTLE HERO CREATION ====================

export function createBattleHero(
  userId: string,
  name: string,
  archetype: AvatarType,
  level: number,
  skillLevels: {
    arithmetic: number;
    geometry: number;
    logic: number;
  }
): BattleHero {
  // Calculate stats based on levels
  const maxHP = 100 + (level * 10);
  const attack = 10 + (skillLevels.arithmetic * 2);
  const defense = 10 + (skillLevels.geometry * 2);
  const speed = 10 + (skillLevels.logic * 2);

  // Archetype bonuses
  let archetypeBonus = {
    attack: 0,
    defense: 0,
    speed: 0,
    critRate: 5
  };

  switch (archetype) {
    case 'warrior':
      archetypeBonus.attack = 10;
      archetypeBonus.critRate = 10;
      break;
    case 'scholar':
      archetypeBonus.speed = 10;
      archetypeBonus.critRate = 7;
      break;
    case 'artist':
      archetypeBonus.defense = 10;
      archetypeBonus.critRate = 8;
      break;
    case 'engineer':
      archetypeBonus.attack = 5;
      archetypeBonus.defense = 5;
      break;
  }

  return {
    id: generateBattleId(),
    userId,
    name,
    archetype,
    level,

    maxHP,
    currentHP: maxHP,
    attack: attack + archetypeBonus.attack,
    defense: defense + archetypeBonus.defense,
    speed: speed + archetypeBonus.speed,
    critRate: archetypeBonus.critRate,
    critDamage: 150, // 150% damage on crit

    arithmeticLevel: skillLevels.arithmetic,
    geometryLevel: skillLevels.geometry,
    logicLevel: skillLevels.logic,

    comboStreak: 0,
    dodgeChance: Math.min(speed / 10, 25), // Max 25%
    blockChance: Math.min(defense / 10, 20), // Max 20%
    ultimateCharge: 0,

    activeBuffs: [],
    activeDebuffs: []
  };
}

// ==================== DAMAGE CALCULATION ====================

export function calculateDamage(
  attacker: BattleHero,
  defender: BattleHero,
  question: Task,
  timeTaken: number
): DamageResult {
  const timeLimit = question.time || 45;

  // 1. BASE DAMAGE (from question difficulty)
  let baseDamage = question.d * 10; // Difficulty 1-6 → 10-60 damage

  // 2. ATTACK MULTIPLIER
  const attackMultiplier = 1 + (attacker.attack / 100);
  baseDamage *= attackMultiplier;

  // 3. SPEED BONUS (faster = more damage)
  const speedRatio = timeTaken / timeLimit;
  let speedBonus = 1.0;

  if (speedRatio <= 0.25) speedBonus = 1.5;      // Ultra fast: +50%
  else if (speedRatio <= 0.5) speedBonus = 1.3;  // Fast: +30%
  else if (speedRatio <= 0.75) speedBonus = 1.1; // Normal: +10%
  else speedBonus = 0.9;                         // Slow: -10%

  baseDamage *= speedBonus;

  // 4. SKILL TYPE BONUS (matching specialty)
  const skillBonus = getSkillBonus(attacker, question.skillType);
  baseDamage *= skillBonus;

  // 5. COMBO MULTIPLIER
  const comboMultiplier = 1 + (attacker.comboStreak * 0.05); // +5% per combo
  baseDamage *= comboMultiplier;

  // 6. APPLY BUFFS/DEBUFFS
  const buffMultiplier = calculateBuffMultiplier(attacker.activeBuffs);
  baseDamage *= buffMultiplier;

  // 7. CRITICAL HIT CHECK
  const isCritical = Math.random() * 100 < attacker.critRate;
  if (isCritical) {
    baseDamage *= (attacker.critDamage / 100);
  }

  // 8. DEFENSE REDUCTION
  const defenseMultiplier = 1 - (defender.defense / (defender.defense + 100));
  let finalDamage = baseDamage * defenseMultiplier;

  // 9. DODGE CHECK
  const dodgeRoll = Math.random() * 100;
  const isDodged = dodgeRoll < defender.dodgeChance;

  if (isDodged) {
    return {
      damage: 0,
      isCritical: false,
      isDodged: true,
      isBlocked: false,
      displayText: 'DODGE!',
      animation: 'dodge'
    };
  }

  // 10. BLOCK CHECK (50% damage reduction)
  const blockRoll = Math.random() * 100;
  const isBlocked = blockRoll < defender.blockChance;

  if (isBlocked) {
    finalDamage *= 0.5;
  }

  // 11. ROUND DAMAGE
  finalDamage = Math.floor(finalDamage);

  // Ensure minimum damage of 1 if not dodged
  finalDamage = Math.max(1, finalDamage);

  return {
    damage: finalDamage,
    isCritical,
    isDodged: false,
    isBlocked,
    displayText: isCritical ? 'CRITICAL!' : isBlocked ? 'BLOCKED!' : '',
    animation: isCritical ? 'critical_hit' : 'normal_hit'
  };
}

// ==================== HELPER FUNCTIONS ====================

function getSkillBonus(hero: BattleHero, questionType: SkillType): number {
  let bonus = 1.0;

  switch (questionType) {
    case 'arithmetic':
      if (hero.arithmeticLevel >= hero.geometryLevel && hero.arithmeticLevel >= hero.logicLevel) {
        bonus = 1.2; // +20% if strongest skill
      } else if (hero.arithmeticLevel >= 20) {
        bonus = 1.1; // +10% if decent level
      }
      break;

    case 'geometry':
      if (hero.geometryLevel >= hero.arithmeticLevel && hero.geometryLevel >= hero.logicLevel) {
        bonus = 1.2;
      } else if (hero.geometryLevel >= 20) {
        bonus = 1.1;
      }
      break;

    case 'logic':
      if (hero.logicLevel >= hero.arithmeticLevel && hero.logicLevel >= hero.geometryLevel) {
        bonus = 1.2;
      } else if (hero.logicLevel >= 20) {
        bonus = 1.1;
      }
      break;
  }

  return bonus;
}

function calculateBuffMultiplier(buffs: Buff[]): number {
  let multiplier = 1.0;

  for (const buff of buffs) {
    if (buff.type === 'attack') {
      multiplier *= (1 + buff.value);
    }
  }

  return multiplier;
}

function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== BATTLE ROUND RESOLUTION ====================

export interface AnswerSubmission {
  playerId: string;
  answer: number;
  correct: boolean;
  timeTaken: number; // seconds
  timestamp: number;
}

export function resolveRound(
  player1: BattleHero,
  player2: BattleHero,
  question: Task,
  answer1: AnswerSubmission,
  answer2: AnswerSubmission
): RoundResult {
  const p1Correct = answer1.correct;
  const p2Correct = answer2.correct;

  // Case 1: Only Player 1 answered correctly
  if (p1Correct && !p2Correct) {
    const damage = calculateDamage(player1, player2, question, answer1.timeTaken);
    player2.currentHP -= damage.damage;
    player1.comboStreak++;
    player2.comboStreak = 0;

    return {
      type: 'ATTACK',
      attacker: player1.id,
      defender: player2.id,
      damage
    };
  }

  // Case 2: Only Player 2 answered correctly
  if (!p1Correct && p2Correct) {
    const damage = calculateDamage(player2, player1, question, answer2.timeTaken);
    player1.currentHP -= damage.damage;
    player2.comboStreak++;
    player1.comboStreak = 0;

    return {
      type: 'ATTACK',
      attacker: player2.id,
      defender: player1.id,
      damage
    };
  }

  // Case 3: Both answered correctly - faster wins
  if (p1Correct && p2Correct) {
    if (answer1.timeTaken < answer2.timeTaken) {
      const damage = calculateDamage(player1, player2, question, answer1.timeTaken);
      player2.currentHP -= damage.damage;
      player1.comboStreak++;

      return {
        type: 'ATTACK',
        attacker: player1.id,
        defender: player2.id,
        damage
      };
    } else {
      const damage = calculateDamage(player2, player1, question, answer2.timeTaken);
      player1.currentHP -= damage.damage;
      player2.comboStreak++;

      return {
        type: 'ATTACK',
        attacker: player2.id,
        defender: player1.id,
        damage
      };
    }
  }

  // Case 4: Both answered incorrectly - draw
  player1.comboStreak = 0;
  player2.comboStreak = 0;

  return {
    type: 'BOTH_WRONG'
  };
}

// ==================== ULTIMATE SKILLS ====================

export interface UltimateSkill {
  id: string;
  archetype: AvatarType;
  name: string;
  description: string;
  chargeRequired: number; // 0-100
  effect: (user: BattleHero, target: BattleHero) => UltimateResult;
}

export interface UltimateResult {
  damage?: number;
  buff?: Buff;
  debuff?: Debuff;
  heal?: number;
  animation: string;
}

export const ULTIMATE_SKILLS: Record<AvatarType, UltimateSkill> = {
  scholar: {
    id: 'perfect_calculation',
    archetype: 'scholar',
    name: 'Perfect Calculation',
    description: 'Doubles combo multiplier for 3 rounds',
    chargeRequired: 100,
    effect: (user, target) => {
      const buff: Buff = {
        id: 'combo_boost',
        name: 'Perfect Calculation',
        type: 'attack',
        value: 1.0, // 100% bonus (doubles)
        duration: 3,
        icon: '🧠'
      };

      user.activeBuffs.push(buff);

      return {
        buff,
        animation: 'scholar_ultimate'
      };
    }
  },

  warrior: {
    id: 'lightning_strike',
    archetype: 'warrior',
    name: 'Lightning Strike',
    description: 'Massive instant damage',
    chargeRequired: 100,
    effect: (user, target) => {
      const damage = Math.floor(target.maxHP * 0.3); // 30% max HP
      target.currentHP -= damage;

      return {
        damage,
        animation: 'warrior_ultimate'
      };
    }
  },

  artist: {
    id: 'spatial_vision',
    archetype: 'artist',
    name: 'Spatial Vision',
    description: 'Guaranteed crit next 2 attacks',
    chargeRequired: 100,
    effect: (user, target) => {
      // Temporarily set crit rate to 100%
      const originalCritRate = user.critRate;
      user.critRate = 100;

      // Note: Need to restore after 2 attacks in actual implementation
      const buff: Buff = {
        id: 'guaranteed_crit',
        name: 'Spatial Vision',
        type: 'crit',
        value: 100,
        duration: 2,
        icon: '🎨'
      };

      user.activeBuffs.push(buff);

      return {
        buff,
        animation: 'artist_ultimate'
      };
    }
  },

  engineer: {
    id: 'calculation_engine',
    archetype: 'engineer',
    name: 'Calculation Engine',
    description: 'Gain shield and attack boost',
    chargeRequired: 100,
    effect: (user, target) => {
      const shield = Math.floor(user.maxHP * 0.2); // 20% max HP shield
      user.currentHP = Math.min(user.maxHP, user.currentHP + shield);

      const buff: Buff = {
        id: 'engine_boost',
        name: 'Calculation Engine',
        type: 'attack',
        value: 0.5, // +50% attack
        duration: 3,
        icon: '⚙️'
      };

      user.activeBuffs.push(buff);

      return {
        heal: shield,
        buff,
        animation: 'engineer_ultimate'
      };
    }
  }
};

// ==================== BUFF/DEBUFF PROCESSING ====================

export function processTurnEffects(hero: BattleHero): void {
  // Reduce buff durations
  hero.activeBuffs = hero.activeBuffs
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);

  // Reduce debuff durations
  hero.activeDebuffs = hero.activeDebuffs
    .map(debuff => ({ ...debuff, duration: debuff.duration - 1 }))
    .filter(debuff => debuff.duration > 0);
}

export function chargeUltimate(hero: BattleHero, roundWon: boolean): void {
  if (roundWon) {
    hero.ultimateCharge = Math.min(100, hero.ultimateCharge + 20); // +20 per win
  } else {
    hero.ultimateCharge = Math.min(100, hero.ultimateCharge + 5); // +5 for participating
  }
}

export function canUseUltimate(hero: BattleHero): boolean {
  return hero.ultimateCharge >= 100;
}

export function useUltimate(
  user: BattleHero,
  target: BattleHero
): UltimateResult {
  const skill = ULTIMATE_SKILLS[user.archetype];

  if (!canUseUltimate(user)) {
    throw new Error('Ultimate not charged');
  }

  const result = skill.effect(user, target);

  // Reset charge
  user.ultimateCharge = 0;

  return result;
}

// ==================== BATTLE STATE CHECKING ====================

export function isBattleOver(hero1: BattleHero, hero2: BattleHero): boolean {
  return hero1.currentHP <= 0 || hero2.currentHP <= 0;
}

export function getWinner(hero1: BattleHero, hero2: BattleHero): BattleHero | null {
  if (hero1.currentHP <= 0 && hero2.currentHP <= 0) {
    return null; // Draw (rare)
  }

  if (hero1.currentHP <= 0) return hero2;
  if (hero2.currentHP <= 0) return hero1;

  return null; // Battle not over
}

// ==================== EXPORTS ====================

export default {
  createBattleHero,
  calculateDamage,
  resolveRound,
  ULTIMATE_SKILLS,
  processTurnEffects,
  chargeUltimate,
  canUseUltimate,
  useUltimate,
  isBattleOver,
  getWinner
};

console.log('⚔️ Battle Mechanics loaded');
console.log('🎯 Ultimate Skills:', Object.keys(ULTIMATE_SKILLS).length);
