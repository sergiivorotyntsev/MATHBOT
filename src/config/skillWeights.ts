/**
 * ⚖️ Skill Weights Configuration
 *
 * Defines how solving tasks in each math topic affects:
 * 1. Math skill gains (which math skills improve)
 * 2. Game stat gains (which battle stats improve)
 *
 * This creates the connection between learning math and character progression.
 */

import { MathSkillKey } from '../types/mathSkills';
import { GameStats } from '../types/gameStats';

export interface SkillGainWeights {
  // Math skills that improve
  mathSkills: Partial<Record<MathSkillKey, number>>;

  // Game stats that improve
  gameStats: Partial<Record<keyof GameStats, number>>;
}

/**
 * Skill weights for each math topic
 *
 * Weights are distributed as percentages (sum should be ~100% per category)
 * Higher weight = faster skill gain
 */
export const SKILL_WEIGHTS: Record<MathSkillKey, SkillGainWeights> = {
  // ==================== ARITHMETIC ====================

  addition: {
    mathSkills: {
      addition: 60,          // Primary skill
      subtraction: 10,       // Related
      problemSolving: 30     // Generic improvement
    },
    gameStats: {
      strength: 40,          // Addition builds mental "strength"
      focus: 30,             // Requires concentration
      wisdom: 30             // Basic math knowledge
    }
  },

  subtraction: {
    mathSkills: {
      subtraction: 60,
      addition: 10,
      problemSolving: 30
    },
    gameStats: {
      strength: 40,
      focus: 30,
      wisdom: 30
    }
  },

  multiplication: {
    mathSkills: {
      multiplication: 60,
      division: 10,          // Inverse operation
      problemSolving: 30
    },
    gameStats: {
      strength: 50,          // Multiplication = power
      magic: 20,             // Pattern recognition (spellcasting)
      wisdom: 30
    }
  },

  division: {
    mathSkills: {
      division: 60,
      multiplication: 10,
      fractions: 10,         // Foundation for fractions
      problemSolving: 20
    },
    gameStats: {
      strength: 40,
      wisdom: 40,            // Division requires understanding
      focus: 20
    }
  },

  fractions: {
    mathSkills: {
      fractions: 60,
      division: 10,
      decimals: 10,
      problemSolving: 20
    },
    gameStats: {
      wisdom: 50,            // Complex concept
      magic: 30,             // Abstract thinking
      focus: 20
    }
  },

  decimals: {
    mathSkills: {
      decimals: 60,
      fractions: 10,
      percentages: 10,
      problemSolving: 20
    },
    gameStats: {
      wisdom: 50,
      agility: 20,           // Precision
      focus: 30
    }
  },

  percentages: {
    mathSkills: {
      percentages: 60,
      decimals: 10,
      fractions: 10,
      problemSolving: 20
    },
    gameStats: {
      wisdom: 60,            // Real-world application
      luck: 20,              // Probability understanding
      focus: 20
    }
  },

  // ==================== GEOMETRY ====================

  shapes: {
    mathSkills: {
      shapes: 60,
      perimeter: 20,
      area: 10,
      problemSolving: 10
    },
    gameStats: {
      defense: 40,           // Shapes = structure = defense
      wisdom: 30,
      magic: 30              // Spatial thinking
    }
  },

  perimeter: {
    mathSkills: {
      perimeter: 60,
      shapes: 10,
      addition: 10,
      problemSolving: 20
    },
    gameStats: {
      defense: 50,           // Perimeter = boundaries
      wisdom: 30,
      focus: 20
    }
  },

  area: {
    mathSkills: {
      area: 60,
      perimeter: 10,
      multiplication: 10,
      problemSolving: 20
    },
    gameStats: {
      defense: 50,
      wisdom: 30,
      strength: 20           // Area calculations
    }
  },

  volume: {
    mathSkills: {
      volume: 60,
      area: 10,
      multiplication: 10,
      problemSolving: 20
    },
    gameStats: {
      defense: 60,           // 3D thinking = strong defense
      wisdom: 30,
      magic: 10
    }
  },

  angles: {
    mathSkills: {
      angles: 60,
      shapes: 20,
      problemSolving: 20
    },
    gameStats: {
      agility: 40,           // Angles = precision/movement
      wisdom: 30,
      defense: 30
    }
  },

  // ==================== LOGIC & PROBLEM SOLVING ====================

  patterns: {
    mathSkills: {
      patterns: 60,
      sequences: 20,
      problemSolving: 20
    },
    gameStats: {
      magic: 60,             // Pattern recognition = magic
      wisdom: 30,
      focus: 10
    }
  },

  sequences: {
    mathSkills: {
      sequences: 60,
      patterns: 20,
      problemSolving: 20
    },
    gameStats: {
      magic: 50,
      wisdom: 30,
      luck: 20               // Predicting sequences
    }
  },

  problemSolving: {
    mathSkills: {
      problemSolving: 70,
      patterns: 15,
      sequences: 15
    },
    gameStats: {
      wisdom: 50,            // Problem solving = wisdom
      focus: 30,
      magic: 20
    }
  },

  wordProblems: {
    mathSkills: {
      wordProblems: 60,
      problemSolving: 30,
      addition: 5,
      multiplication: 5
    },
    gameStats: {
      wisdom: 60,            // Reading comprehension + math
      focus: 30,             // Attention to detail
      strength: 10
    }
  }
};

/**
 * Get skill weights for a specific topic
 */
export function getSkillWeights(topic: MathSkillKey): SkillGainWeights {
  return SKILL_WEIGHTS[topic];
}

/**
 * Calculate skill gains based on XP earned and topic
 *
 * @param topic - The math topic being practiced
 * @param xpEarned - XP earned from the task
 * @param difficulty - Task difficulty (1-5)
 * @param correct - Whether answer was correct
 * @param speedBonus - Speed bonus multiplier (0-1)
 * @returns Object with mathSkills and gameStats gains
 */
export function calculateSkillGains(
  topic: MathSkillKey,
  xpEarned: number,
  difficulty: number,
  correct: boolean,
  speedBonus: number = 0
): { mathSkills: Partial<Record<MathSkillKey, number>>; gameStats: Partial<Record<keyof GameStats, number>> } {
  if (!correct) {
    return { mathSkills: {}, gameStats: {} };
  }

  const weights = getSkillWeights(topic);

  // Base gain factor (adjusted by difficulty)
  const difficultyMultiplier = 0.5 + (difficulty * 0.1); // 0.6-1.0
  const speedMultiplier = 1.0 + (speedBonus * 0.5); // 1.0-1.5
  const baseFactor = (xpEarned / 100) * difficultyMultiplier * speedMultiplier;

  // Calculate math skill gains
  const mathSkills: Partial<Record<MathSkillKey, number>> = {};
  for (const [skill, weight] of Object.entries(weights.mathSkills)) {
    if (typeof weight === 'number') {
      mathSkills[skill as MathSkillKey] = baseFactor * (weight / 100);
    }
  }

  // Calculate game stat gains
  const gameStats: Partial<Record<keyof GameStats, number>> = {};
  for (const [stat, weight] of Object.entries(weights.gameStats)) {
    if (typeof weight === 'number') {
      gameStats[stat as keyof GameStats] = baseFactor * (weight / 100);
    }
  }

  return { mathSkills, gameStats };
}

/**
 * Get primary math skill for a topic (highest weight)
 */
export function getPrimarySkill(topic: MathSkillKey): MathSkillKey {
  return topic; // The topic itself is always the primary skill
}

/**
 * Get primary game stat for a topic (highest weight)
 */
export function getPrimaryGameStat(topic: MathSkillKey): keyof GameStats {
  const weights = getSkillWeights(topic);
  let maxWeight = 0;
  let primaryStat: keyof GameStats = 'wisdom';

  for (const [stat, weight] of Object.entries(weights.gameStats)) {
    if (typeof weight === 'number' && weight > maxWeight) {
      maxWeight = weight;
      primaryStat = stat as keyof GameStats;
    }
  }

  return primaryStat;
}

console.log('⚖️ Skill weights configuration loaded');
