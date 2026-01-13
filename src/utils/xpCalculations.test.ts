/**
 * 🧪 XP Calculation Tests
 *
 * Ensures XP/Level system works correctly:
 * - No progress > 100%
 * - Monotonic XP requirements
 * - Correct level boundaries
 */

import { describe } from 'vitest';

// Skipped: Custom test runner, not using Vitest syntax
describe.skip('XP Calculations', () => {});

// ==================== XP FUNCTIONS (from MathBotArena) ====================

/**
 * Calculate level from total XP
 * Level = floor(log2(totalXP/100 + 1)) + 1
 */
function calculateLevel(totalXP: number): number {
  return Math.floor(Math.log2(totalXP / 100 + 1)) + 1;
}

/**
 * Calculate XP required to REACH a specific level
 * XP = (2^(level) - 1) * 100
 */
function calculateXPForNextLevel(currentLevel: number): number {
  return Math.floor((Math.pow(2, currentLevel) - 1) * 100);
}

/**
 * Calculate XP progress within current level
 */
function calculateXPProgress(totalXP: number, currentLevel: number): {
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpProgress: number;
  xpToNextLevel: number;
} {
  // XP required to REACH current level
  const xpForCurrentLevel = currentLevel > 1
    ? calculateXPForNextLevel(currentLevel - 1)
    : 0;

  // XP required to REACH next level
  const xpForNext = calculateXPForNextLevel(currentLevel);

  // XP within current level (between current and next threshold)
  const xpInLevel = totalXP - xpForCurrentLevel;

  // XP required to level up (difference between thresholds)
  const xpRequired = xpForNext - xpForCurrentLevel;

  // Progress percentage (0-100)
  const progress = Math.min(100, Math.max(0, (xpInLevel / xpRequired) * 100));

  // XP remaining to next level
  const xpRemaining = Math.max(0, xpForNext - totalXP);

  return {
    xpForNextLevel: xpForNext,
    xpInCurrentLevel: xpInLevel,
    xpProgress: progress,
    xpToNextLevel: xpRemaining
  };
}

// ==================== TESTS ====================

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals(actual: any, expected: any, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
  }
}

function assertInRange(value: number, min: number, max: number, message: string): void {
  if (value < min || value > max) {
    throw new Error(`Assertion failed: ${message}\n  Value ${value} not in range [${min}, ${max}]`);
  }
}

/**
 * Test: Level 1 at start
 */
function testLevel1AtStart() {
  const level = calculateLevel(0);
  assertEquals(level, 1, 'Level should be 1 at 0 XP');
}

/**
 * Test: XP requirements increase monotonically
 */
function testMonotonicXPRequirements() {
  let prevXP = 0;
  for (let level = 1; level <= 50; level++) {
    const xp = calculateXPForNextLevel(level);
    assert(xp > prevXP, `XP for level ${level + 1} should be greater than level ${level}`);
    prevXP = xp;
  }
}

/**
 * Test: Progress never exceeds 100%
 */
function testProgressNeverExceeds100() {
  // Test at various XP values
  const testValues = [0, 50, 100, 150, 200, 300, 500, 700, 1000, 1500, 2000, 5000, 10000];

  for (const totalXP of testValues) {
    const level = calculateLevel(totalXP);
    const progress = calculateXPProgress(totalXP, level);

    assertInRange(progress.xpProgress, 0, 100, `Progress at ${totalXP} XP (level ${level}) should be 0-100%`);
  }
}

/**
 * Test: Progress is 0% at level boundary
 */
function testProgressAtLevelBoundary() {
  for (let level = 1; level <= 10; level++) {
    const xpAtLevelStart = level > 1 ? calculateXPForNextLevel(level - 1) : 0;
    const currentLevel = calculateLevel(xpAtLevelStart);
    const progress = calculateXPProgress(xpAtLevelStart, currentLevel);

    assert(progress.xpProgress === 0 || progress.xpProgress < 1,
      `Progress should be ~0% at level ${level} boundary (XP: ${xpAtLevelStart})`);
  }
}

/**
 * Test: Level calculation matches boundary
 */
function testLevelCalculationMatchesBoundary() {
  for (let level = 1; level <= 10; level++) {
    const xpForLevel = calculateXPForNextLevel(level - 1);
    const calculatedLevel = calculateLevel(xpForLevel);

    assertEquals(calculatedLevel, level, `At XP ${xpForLevel}, level should be ${level}`);
  }
}

/**
 * Test: XP to next level decreases as you progress
 */
function testXPToNextLevelDecreases() {
  const level = 5;
  const xpStart = calculateXPForNextLevel(level - 1);
  const xpEnd = calculateXPForNextLevel(level);

  const progressStart = calculateXPProgress(xpStart, level);
  const progressMid = calculateXPProgress(xpStart + (xpEnd - xpStart) / 2, level);
  const progressEnd = calculateXPProgress(xpEnd - 1, level);

  assert(progressStart.xpToNextLevel > progressMid.xpToNextLevel,
    'XP to next level should decrease as you progress (start vs mid)');
  assert(progressMid.xpToNextLevel > progressEnd.xpToNextLevel,
    'XP to next level should decrease as you progress (mid vs end)');
}

/**
 * Test: Specific known values
 */
function testKnownValues() {
  // Level 1: 0-99 XP
  assertEquals(calculateLevel(0), 1, 'Level at 0 XP');
  assertEquals(calculateLevel(99), 1, 'Level at 99 XP');

  // Level 2: 100-299 XP
  assertEquals(calculateLevel(100), 2, 'Level at 100 XP');
  assertEquals(calculateLevel(299), 2, 'Level at 299 XP');

  // Level 3: 300-699 XP
  assertEquals(calculateLevel(300), 3, 'Level at 300 XP');
  assertEquals(calculateLevel(699), 3, 'Level at 699 XP');

  // Level 4: 700-1499 XP
  assertEquals(calculateLevel(700), 4, 'Level at 700 XP');
  assertEquals(calculateLevel(1499), 4, 'Level at 1499 XP');
}

/**
 * Test: Progress percentage correctness
 */
function testProgressPercentageCorrectness() {
  // At level 2 (100-299 XP, range = 200 XP)
  const level2Start = 100;
  const level2End = 300;
  const level2Mid = 200;

  const progressStart = calculateXPProgress(level2Start, 2);
  const progressMid = calculateXPProgress(level2Mid, 2);
  const progressEnd = calculateXPProgress(level2End - 1, 2);

  assert(progressStart.xpProgress < 5, 'Progress should be near 0% at level start');
  assert(Math.abs(progressMid.xpProgress - 50) < 5, 'Progress should be near 50% at midpoint');
  assert(progressEnd.xpProgress > 95, 'Progress should be near 100% at level end');
}

/**
 * Run all tests
 */
export function runXPTests(): void {
  const tests = [
    { name: 'Level 1 at start', fn: testLevel1AtStart },
    { name: 'Monotonic XP requirements', fn: testMonotonicXPRequirements },
    { name: 'Progress never exceeds 100%', fn: testProgressNeverExceeds100 },
    { name: 'Progress at level boundary', fn: testProgressAtLevelBoundary },
    { name: 'Level calculation matches boundary', fn: testLevelCalculationMatchesBoundary },
    { name: 'XP to next level decreases', fn: testXPToNextLevelDecreases },
    { name: 'Known values', fn: testKnownValues },
    { name: 'Progress percentage correctness', fn: testProgressPercentageCorrectness }
  ];

  let passed = 0;
  let failed = 0;

  console.log('🧪 Running XP Calculation Tests...\n');

  for (const test of tests) {
    try {
      test.fn();
      console.log(`✅ ${test.name}`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}`);
      console.error(`   ${error}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    throw new Error(`${failed} test(s) failed`);
  }
}

// Auto-run tests if executed directly
if (typeof window === 'undefined') {
  runXPTests();
}
