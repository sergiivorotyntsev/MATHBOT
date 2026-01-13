/**
 * 📊 Attempt Logging System
 *
 * Persistent storage of every question attempt to enable:
 * - Progress tracking
 * - Skill mastery computation
 * - Adaptive difficulty
 * - Spaced repetition
 * - Learning analytics
 *
 * CRITICAL: Every answer MUST be logged exactly once.
 */

import { SkillId } from '../types/question';
import { updateSkillStats } from '../types/skillStats';

// ==================== TYPES ====================

export interface AttemptRecord {
  /** Unique attempt ID */
  attemptId: string;

  /** Timestamp (ms since epoch) */
  timestamp: number;

  /** Session mode */
  mode: 'training' | 'bot' | 'learning';

  /** Question that was answered */
  questionId: string;

  /** Skill being practiced */
  skillId: SkillId;

  /** Was answer correct? */
  correct: boolean;

  /** Response time (milliseconds) */
  responseTimeMs: number;

  /** Difficulty score (0-1) */
  difficultyScore: number;

  /** Session ID (groups attempts together) */
  sessionId: string;

  /** User age at time of attempt */
  userAge?: number;

  /** XP earned (if applicable) */
  xpGained?: number;
}

export interface AttemptLog {
  /** Format version for migrations */
  version: string;

  /** All attempt records */
  attempts: AttemptRecord[];

  /** Last updated timestamp */
  lastUpdated: number;
}

// ==================== CONSTANTS ====================

const STORAGE_KEY = 'mathbot_attempts_v1';
const MAX_RECORDS = 10000; // Keep last 10k attempts
const CURRENT_VERSION = '1.0.0';

// ==================== CORE FUNCTIONS ====================

/**
 * Record a new attempt (MUST be called for every answer)
 */
export function recordAttempt(attempt: AttemptRecord): void {
  try {
    // Load existing log
    const log = loadAttemptLog();

    // Add new attempt
    log.attempts.push(attempt);

    // Trim if exceeds max
    if (log.attempts.length > MAX_RECORDS) {
      const excess = log.attempts.length - MAX_RECORDS;
      log.attempts.splice(0, excess); // Remove oldest
      console.log(`[AttemptLog] Trimmed ${excess} old attempts`);
    }

    // Update metadata
    log.lastUpdated = Date.now();

    // Save to localStorage
    saveAttemptLog(log);

    // Update skill statistics
    updateSkillStats({
      skillId: attempt.skillId,
      correct: attempt.correct,
      timeMs: attempt.responseTimeMs,
      xpGained: attempt.xpGained || 0,
      timestamp: attempt.timestamp,
      difficultyTier: Math.ceil(attempt.difficultyScore * 5) // Convert 0-1 to 1-5
    });

    console.log(`[AttemptLog] Recorded ${attempt.correct ? '✅' : '❌'} attempt for ${attempt.skillId}`);
  } catch (error) {
    console.error('[AttemptLog] Failed to record attempt:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Get all attempts (or filtered subset)
 */
export function getAttempts(filter?: {
  skillId?: SkillId;
  sessionId?: string;
  mode?: 'training' | 'bot' | 'learning';
  since?: number; // timestamp
}): AttemptRecord[] {
  const log = loadAttemptLog();
  let attempts = log.attempts;

  if (filter) {
    if (filter.skillId) {
      attempts = attempts.filter(a => a.skillId === filter.skillId);
    }
    if (filter.sessionId) {
      attempts = attempts.filter(a => a.sessionId === filter.sessionId);
    }
    if (filter.mode) {
      attempts = attempts.filter(a => a.mode === filter.mode);
    }
    if (filter.since) {
      attempts = attempts.filter(a => a.timestamp >= filter.since);
    }
  }

  return attempts;
}

/**
 * Get attempt statistics for a skill
 */
export function getSkillAttemptStats(skillId: SkillId): {
  totalAttempts: number;
  correct: number;
  accuracy: number;
  avgResponseTimeMs: number;
  lastAttemptTimestamp: number;
  recentStreak: number; // consecutive correct in last N attempts
} {
  const attempts = getAttempts({ skillId });

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      correct: 0,
      accuracy: 0,
      avgResponseTimeMs: 0,
      lastAttemptTimestamp: 0,
      recentStreak: 0
    };
  }

  const correct = attempts.filter(a => a.correct).length;
  const totalTime = attempts.reduce((sum, a) => sum + a.responseTimeMs, 0);
  const lastAttempt = Math.max(...attempts.map(a => a.timestamp));

  // Calculate recent streak (last 10 attempts)
  const recent = attempts.slice(-10);
  let streak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i].correct) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalAttempts: attempts.length,
    correct,
    accuracy: (correct / attempts.length) * 100,
    avgResponseTimeMs: totalTime / attempts.length,
    lastAttemptTimestamp: lastAttempt,
    recentStreak: streak
  };
}

/**
 * Get session summary
 */
export function getSessionSummary(sessionId: string): {
  attempts: AttemptRecord[];
  totalQuestions: number;
  correct: number;
  accuracy: number;
  totalTimeMs: number;
  avgTimeMs: number;
  skillsCovered: SkillId[];
} {
  const attempts = getAttempts({ sessionId });
  const correct = attempts.filter(a => a.correct).length;
  const totalTimeMs = attempts.reduce((sum, a) => sum + a.responseTimeMs, 0);
  const skillsCovered = Array.from(new Set(attempts.map(a => a.skillId)));

  return {
    attempts,
    totalQuestions: attempts.length,
    correct,
    accuracy: attempts.length > 0 ? (correct / attempts.length) * 100 : 0,
    totalTimeMs,
    avgTimeMs: attempts.length > 0 ? totalTimeMs / attempts.length : 0,
    skillsCovered
  };
}

/**
 * Clear all attempts (use with caution!)
 */
export function clearAttemptLog(): void {
  if (confirm('⚠️ Delete all attempt history? This cannot be undone!')) {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[AttemptLog] All attempts cleared');
  }
}

/**
 * Export attempts as JSON (for backup/analysis)
 */
export function exportAttempts(): string {
  const log = loadAttemptLog();
  return JSON.stringify(log, null, 2);
}

/**
 * Import attempts from JSON (overwrites existing)
 */
export function importAttempts(jsonData: string): void {
  try {
    const log = JSON.parse(jsonData) as AttemptLog;

    // Validate structure
    if (!log.version || !Array.isArray(log.attempts)) {
      throw new Error('Invalid attempt log format');
    }

    saveAttemptLog(log);
    console.log(`[AttemptLog] Imported ${log.attempts.length} attempts`);
  } catch (error) {
    console.error('[AttemptLog] Import failed:', error);
    throw error;
  }
}

// ==================== STORAGE HELPERS ====================

function loadAttemptLog(): AttemptLog {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      // Initialize new log
      return {
        version: CURRENT_VERSION,
        attempts: [],
        lastUpdated: Date.now()
      };
    }

    const log = JSON.parse(data) as AttemptLog;

    // Migration logic (if needed in future)
    if (log.version !== CURRENT_VERSION) {
      console.log(`[AttemptLog] Migrating from ${log.version} to ${CURRENT_VERSION}`);
      // Add migration logic here when versions change
    }

    return log;
  } catch (error) {
    console.error('[AttemptLog] Failed to load, initializing new log:', error);
    return {
      version: CURRENT_VERSION,
      attempts: [],
      lastUpdated: Date.now()
    };
  }
}

function saveAttemptLog(log: AttemptLog): void {
  try {
    const data = JSON.stringify(log);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('[AttemptLog] Failed to save:', error);

    // Check if quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('[AttemptLog] Storage quota exceeded, trimming old attempts');

      // Trim to 50% of max
      log.attempts = log.attempts.slice(-Math.floor(MAX_RECORDS / 2));

      try {
        const data = JSON.stringify(log);
        localStorage.setItem(STORAGE_KEY, data);
        console.log('[AttemptLog] Successfully saved after trimming');
      } catch (retryError) {
        console.error('[AttemptLog] Still failed after trimming:', retryError);
      }
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate unique attempt ID
 */
export function generateAttemptId(): string {
  return `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate difficulty score from tier (1-5 → 0-1)
 */
export function tierToDifficultyScore(tier: number): number {
  return Math.max(0, Math.min(1, (tier - 1) / 4)); // Maps 1→0, 3→0.5, 5→1
}

/**
 * Get attempts from last N days
 */
export function getRecentAttempts(days: number): AttemptRecord[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return getAttempts({ since });
}

/**
 * Get daily attempt count for last N days (for charts)
 */
export function getDailyAttemptCounts(days: number = 7): { date: string; count: number }[] {
  const attempts = getRecentAttempts(days);
  const counts = new Map<string, number>();

  for (const attempt of attempts) {
    const date = new Date(attempt.timestamp).toISOString().split('T')[0];
    counts.set(date, (counts.get(date) || 0) + 1);
  }

  // Fill in missing days with 0
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    result.push({ date, count: counts.get(date) || 0 });
  }

  return result;
}

// ==================== DIAGNOSTIC FUNCTIONS ====================

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  recordCount: number;
  sizeBytes: number;
  oldestAttempt: number;
  newestAttempt: number;
} {
  const log = loadAttemptLog();
  const data = localStorage.getItem(STORAGE_KEY) || '';

  return {
    recordCount: log.attempts.length,
    sizeBytes: data.length * 2, // Rough estimate (UTF-16)
    oldestAttempt: log.attempts.length > 0 ? log.attempts[0].timestamp : 0,
    newestAttempt: log.attempts.length > 0 ? log.attempts[log.attempts.length - 1].timestamp : 0
  };
}

/**
 * Validate log integrity
 */
export function validateAttemptLog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const log = loadAttemptLog();

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const attempt of log.attempts) {
    if (ids.has(attempt.attemptId)) {
      errors.push(`Duplicate attempt ID: ${attempt.attemptId}`);
    }
    ids.add(attempt.attemptId);
  }

  // Check timestamp ordering
  for (let i = 1; i < log.attempts.length; i++) {
    if (log.attempts[i].timestamp < log.attempts[i - 1].timestamp) {
      errors.push(`Attempts not in chronological order at index ${i}`);
    }
  }

  // Check required fields
  for (const [idx, attempt] of log.attempts.entries()) {
    if (!attempt.attemptId) errors.push(`Missing attemptId at index ${idx}`);
    if (!attempt.questionId) errors.push(`Missing questionId at index ${idx}`);
    if (!attempt.skillId) errors.push(`Missing skillId at index ${idx}`);
    if (typeof attempt.correct !== 'boolean') errors.push(`Invalid correct at index ${idx}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
