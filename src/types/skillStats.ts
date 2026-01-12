/**
 * 📊 Per-Skill Statistics Tracking
 *
 * This module tracks detailed statistics for each skill to enable:
 * - Accurate progress dashboards
 * - Adaptive difficulty
 * - Spaced repetition
 * - Mastery computation
 */

import { SkillId } from './question';

// ==================== INTERFACES ====================

/**
 * Statistics for a single skill
 */
export interface SkillStatistics {
  /** Skill identifier */
  skillId: SkillId;

  /** Total attempts (includes both correct and incorrect) */
  attempts: number;

  /** Number of correct answers */
  correct: number;

  /** Accuracy percentage (0-100) */
  accuracy: number;

  /** Current streak of correct answers */
  currentStreak: number;

  /** Best streak ever achieved */
  bestStreak: number;

  /** Timestamp of last attempt */
  lastSeen: number;

  /** Timestamp of last incorrect answer */
  lastWrong: number;

  /** Mastery score (0-1, computed from multiple factors) */
  masteryScore: number;

  /** History of recent performance (last 20 attempts) */
  recentHistory: boolean[]; // true = correct, false = incorrect

  /** Average time taken per question (milliseconds) */
  avgTimeMs: number;

  /** Total XP earned from this skill */
  xpEarned: number;
}

/**
 * Answer event for updating stats
 */
export interface AnswerEvent {
  /** Skill that was practiced */
  skillId: SkillId;

  /** Was the answer correct? */
  correct: boolean;

  /** Time taken to answer (milliseconds) */
  timeMs: number;

  /** XP earned for this answer */
  xpGained: number;

  /** Timestamp of the event */
  timestamp: number;

  /** Question difficulty tier */
  difficultyTier: number;
}

/**
 * Complete stats store (all skills for a user)
 */
export interface SkillStatsStore {
  /** Map of skillId -> statistics */
  skills: Map<SkillId, SkillStatistics>;

  /** Last updated timestamp */
  lastUpdated: number;

  /** Version for migration */
  version: string;
}

// ==================== CONSTANTS ====================

const MASTERY_THRESHOLD = 0.7; // 70% mastery score = "mastered"
const MIN_ATTEMPTS_FOR_MASTERY = 5; // Need at least 5 attempts to claim mastery
const RECENT_HISTORY_SIZE = 20; // Track last 20 attempts
const SPACED_REVIEW_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ==================== FUNCTIONS ====================

/**
 * Create initial empty statistics for a skill
 */
export function createInitialSkillStats(skillId: SkillId): SkillStatistics {
  return {
    skillId,
    attempts: 0,
    correct: 0,
    accuracy: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSeen: 0,
    lastWrong: 0,
    masteryScore: 0,
    recentHistory: [],
    avgTimeMs: 0,
    xpEarned: 0
  };
}

/**
 * Update skill statistics based on an answer event
 */
export function updateSkillStats(
  stats: SkillStatistics,
  event: AnswerEvent
): SkillStatistics {
  const newStats = { ...stats };

  // Update counts
  newStats.attempts += 1;
  if (event.correct) {
    newStats.correct += 1;
    newStats.currentStreak += 1;
    newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
  } else {
    newStats.currentStreak = 0;
    newStats.lastWrong = event.timestamp;
  }

  // Update accuracy
  newStats.accuracy = (newStats.correct / newStats.attempts) * 100;

  // Update recent history (keep last N attempts)
  newStats.recentHistory = [...newStats.recentHistory, event.correct].slice(-RECENT_HISTORY_SIZE);

  // Update average time
  const totalTime = stats.avgTimeMs * stats.attempts + event.timeMs;
  newStats.avgTimeMs = totalTime / newStats.attempts;

  // Update timestamps
  newStats.lastSeen = event.timestamp;

  // Update XP
  newStats.xpEarned += event.xpGained;

  // Recalculate mastery score
  newStats.masteryScore = calculateMasteryScore(newStats);

  return newStats;
}

/**
 * Calculate mastery score (0-1) based on multiple factors
 *
 * Factors considered:
 * - Accuracy (40% weight)
 * - Recent performance (30% weight)
 * - Consistency/streak (20% weight)
 * - Recency (10% weight)
 */
export function calculateMasteryScore(stats: SkillStatistics): number {
  if (stats.attempts < MIN_ATTEMPTS_FOR_MASTERY) {
    // Not enough data yet
    return stats.accuracy / 100 * 0.5; // Partial score based on accuracy
  }

  // 1. Accuracy component (40%)
  const accuracyScore = stats.accuracy / 100;

  // 2. Recent performance component (30%)
  const recentCorrect = stats.recentHistory.filter(x => x).length;
  const recentTotal = stats.recentHistory.length;
  const recentScore = recentTotal > 0 ? recentCorrect / recentTotal : accuracyScore;

  // 3. Consistency component (20%)
  const streakScore = Math.min(1, stats.bestStreak / 10); // Max out at 10 streak

  // 4. Recency component (10%)
  const timeSinceLastSeen = Date.now() - stats.lastSeen;
  const daysSince = timeSinceLastSeen / (24 * 60 * 60 * 1000);
  const recencyScore = Math.max(0, 1 - daysSince / 30); // Decay over 30 days

  // Weighted average
  const mastery =
    accuracyScore * 0.4 +
    recentScore * 0.3 +
    streakScore * 0.2 +
    recencyScore * 0.1;

  return Math.min(1, Math.max(0, mastery));
}

/**
 * Check if a skill is mastered
 */
export function isSkillMastered(stats: SkillStatistics): boolean {
  return (
    stats.attempts >= MIN_ATTEMPTS_FOR_MASTERY &&
    stats.masteryScore >= MASTERY_THRESHOLD
  );
}

/**
 * Check if a skill needs review (spaced repetition)
 */
export function needsReview(stats: SkillStatistics): boolean {
  if (stats.attempts === 0) return false;

  const timeSinceLastSeen = Date.now() - stats.lastSeen;

  // If recently got wrong, prioritize review
  if (stats.lastWrong > stats.lastSeen - 60000) {
    return true;
  }

  // If mastered, review less frequently
  if (isSkillMastered(stats)) {
    return timeSinceLastSeen > SPACED_REVIEW_INTERVAL_MS * 7; // Weekly review
  }

  // If not mastered, review more frequently
  return timeSinceLastSeen > SPACED_REVIEW_INTERVAL_MS; // Daily review
}

/**
 * Get weak skills (need practice)
 */
export function getWeakSkills(store: SkillStatsStore, limit: number = 5): SkillId[] {
  const skills = Array.from(store.skills.values())
    .filter(s => s.attempts >= MIN_ATTEMPTS_FOR_MASTERY)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, limit);

  return skills.map(s => s.skillId);
}

/**
 * Get skills due for review
 */
export function getSkillsDueForReview(store: SkillStatsStore, limit: number = 5): SkillId[] {
  const skills = Array.from(store.skills.values())
    .filter(needsReview)
    .sort((a, b) => a.lastSeen - b.lastSeen) // Oldest first
    .slice(0, limit);

  return skills.map(s => s.skillId);
}

/**
 * Get recommended skills for next session
 */
export function getRecommendedSkills(
  store: SkillStatsStore,
  masteredSkills: Set<SkillId>
): SkillId[] {
  // Priority order:
  // 1. Skills with recent mistakes
  // 2. Skills due for review
  // 3. Weak skills
  // 4. Skills never attempted (from prerequisites)

  const recentMistakes = Array.from(store.skills.values())
    .filter(s => s.lastWrong > Date.now() - 3600000) // Last hour
    .sort((a, b) => b.lastWrong - a.lastWrong)
    .slice(0, 2)
    .map(s => s.skillId);

  const dueForReview = getSkillsDueForReview(store, 2);
  const weakSkills = getWeakSkills(store, 2);

  // Combine and deduplicate
  const recommended = [
    ...recentMistakes,
    ...dueForReview,
    ...weakSkills
  ];

  return Array.from(new Set(recommended)).slice(0, 5);
}

/**
 * Create initial stats store
 */
export function createInitialStatsStore(): SkillStatsStore {
  return {
    skills: new Map(),
    lastUpdated: Date.now(),
    version: '1.0.0'
  };
}

/**
 * Serialize stats store for localStorage
 */
export function serializeStatsStore(store: SkillStatsStore): string {
  const obj = {
    skills: Array.from(store.skills.entries()),
    lastUpdated: store.lastUpdated,
    version: store.version
  };
  return JSON.stringify(obj);
}

/**
 * Deserialize stats store from localStorage
 */
export function deserializeStatsStore(json: string): SkillStatsStore {
  const obj = JSON.parse(json);
  return {
    skills: new Map(obj.skills),
    lastUpdated: obj.lastUpdated,
    version: obj.version
  };
}

/**
 * Get or create skill stats
 */
export function getOrCreateSkillStats(
  store: SkillStatsStore,
  skillId: SkillId
): SkillStatistics {
  if (!store.skills.has(skillId)) {
    store.skills.set(skillId, createInitialSkillStats(skillId));
  }
  return store.skills.get(skillId)!;
}

/**
 * Record an answer and update stats
 */
export function recordAnswer(
  store: SkillStatsStore,
  event: AnswerEvent
): SkillStatsStore {
  const stats = getOrCreateSkillStats(store, event.skillId);
  const updatedStats = updateSkillStats(stats, event);

  store.skills.set(event.skillId, updatedStats);
  store.lastUpdated = Date.now();

  return store;
}
