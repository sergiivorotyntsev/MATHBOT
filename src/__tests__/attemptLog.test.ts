/**
 * 🧪 Attempt Logging Tests
 *
 * Tests the persistent attempt logging system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordAttempt,
  getAttempts,
  getSkillAttemptStats,
  clearAttemptLog,
  exportAttemptLog,
  importAttemptLog,
  generateAttemptId,
  tierToDifficultyScore
} from '../progress/attemptLog';
import type { AttemptRecord } from '../progress/attemptLog';

describe('Attempt Recording', () => {
  beforeEach(() => {
    // Clear log before each test
    clearAttemptLog();
  });

  it('should record a correct attempt', () => {
    const attempt: AttemptRecord = {
      attemptId: generateAttemptId(),
      timestamp: Date.now(),
      mode: 'training',
      questionId: 'q_123',
      skillId: 'arithmetic_addition',
      correct: true,
      responseTimeMs: 5000,
      difficultyScore: 0.6,
      sessionId: 'session_1',
      userAge: 8,
      xpGained: 25
    };

    recordAttempt(attempt);

    const attempts = getAttempts({ skillId: 'arithmetic_addition' });
    expect(attempts.length).toBe(1);
    expect(attempts[0].correct).toBe(true);
    expect(attempts[0].questionId).toBe('q_123');
  });

  it('should record an incorrect attempt', () => {
    const attempt: AttemptRecord = {
      attemptId: generateAttemptId(),
      timestamp: Date.now(),
      mode: 'training',
      questionId: 'q_456',
      skillId: 'geometry_shapes',
      correct: false,
      responseTimeMs: 12000,
      difficultyScore: 0.8,
      sessionId: 'session_1',
      userAge: 7,
      xpGained: 0
    };

    recordAttempt(attempt);

    const attempts = getAttempts({ skillId: 'geometry_shapes' });
    expect(attempts.length).toBe(1);
    expect(attempts[0].correct).toBe(false);
    expect(attempts[0].xpGained).toBe(0);
  });

  it('should record multiple attempts', () => {
    const attempts: AttemptRecord[] = [
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: 'training',
        questionId: 'q_1',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 1000,
        mode: 'training',
        questionId: 'q_2',
        skillId: 'arithmetic_addition',
        correct: false,
        responseTimeMs: 8000,
        difficultyScore: 0.7,
        sessionId: 'session_1',
        xpGained: 0
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 2000,
        mode: 'training',
        questionId: 'q_3',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 6000,
        difficultyScore: 0.6,
        sessionId: 'session_1',
        xpGained: 25
      }
    ];

    attempts.forEach(recordAttempt);

    const recorded = getAttempts({ skillId: 'arithmetic_addition' });
    expect(recorded.length).toBe(3);
  });

  it('should generate unique attempt IDs', () => {
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const id = generateAttemptId();
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }

    expect(ids.size).toBe(100);
  });
});

describe('Attempt Filtering', () => {
  beforeEach(() => {
    clearAttemptLog();

    // Add test data
    const testData: AttemptRecord[] = [
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() - 10000,
        mode: 'training',
        questionId: 'q_1',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() - 5000,
        mode: 'bot',
        questionId: 'q_2',
        skillId: 'geometry_shapes',
        correct: false,
        responseTimeMs: 8000,
        difficultyScore: 0.7,
        sessionId: 'session_2',
        xpGained: 0
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: 'training',
        questionId: 'q_3',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 4000,
        difficultyScore: 0.6,
        sessionId: 'session_3',
        xpGained: 25
      }
    ];

    testData.forEach(recordAttempt);
  });

  it('should filter by skillId', () => {
    const additionAttempts = getAttempts({ skillId: 'arithmetic_addition' });
    const shapesAttempts = getAttempts({ skillId: 'geometry_shapes' });

    expect(additionAttempts.length).toBe(2);
    expect(shapesAttempts.length).toBe(1);

    additionAttempts.forEach(a => {
      expect(a.skillId).toBe('arithmetic_addition');
    });
  });

  it('should filter by mode', () => {
    const trainingAttempts = getAttempts({ mode: 'training' });
    const botAttempts = getAttempts({ mode: 'bot' });

    expect(trainingAttempts.length).toBe(2);
    expect(botAttempts.length).toBe(1);
  });

  it('should filter by correctness', () => {
    const correctAttempts = getAttempts({ correct: true });
    const incorrectAttempts = getAttempts({ correct: false });

    expect(correctAttempts.length).toBe(2);
    expect(incorrectAttempts.length).toBe(1);
  });

  it('should filter by sessionId', () => {
    const session1 = getAttempts({ sessionId: 'session_1' });
    const session2 = getAttempts({ sessionId: 'session_2' });

    expect(session1.length).toBe(1);
    expect(session2.length).toBe(1);
  });

  it('should filter by time range', () => {
    const now = Date.now();
    const recent = getAttempts({
      startTime: now - 6000,
      endTime: now + 1000
    });

    expect(recent.length).toBe(2); // Last 2 attempts
  });
});

describe('Skill Statistics', () => {
  beforeEach(() => {
    clearAttemptLog();
  });

  it('should calculate correct statistics for a skill', () => {
    const attempts: AttemptRecord[] = [
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: 'training',
        questionId: 'q_1',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 1000,
        mode: 'training',
        questionId: 'q_2',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 6000,
        difficultyScore: 0.6,
        sessionId: 'session_1',
        xpGained: 25
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 2000,
        mode: 'training',
        questionId: 'q_3',
        skillId: 'arithmetic_addition',
        correct: false,
        responseTimeMs: 10000,
        difficultyScore: 0.8,
        sessionId: 'session_1',
        xpGained: 0
      }
    ];

    attempts.forEach(recordAttempt);

    const stats = getSkillAttemptStats('arithmetic_addition');

    expect(stats.totalAttempts).toBe(3);
    expect(stats.correct).toBe(2);
    expect(stats.accuracy).toBeCloseTo(0.667, 2); // 2/3
    expect(stats.avgResponseTimeMs).toBeCloseTo(7000, 0); // (5000 + 6000 + 10000) / 3
  });

  it('should return zero stats for skill with no attempts', () => {
    const stats = getSkillAttemptStats('geometry_shapes');

    expect(stats.totalAttempts).toBe(0);
    expect(stats.correct).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.avgResponseTimeMs).toBe(0);
    expect(stats.lastAttemptTimestamp).toBe(0);
    expect(stats.recentStreak).toBe(0);
  });

  it('should calculate recent streak correctly', () => {
    const attempts: AttemptRecord[] = [
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: 'training',
        questionId: 'q_1',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 1000,
        mode: 'training',
        questionId: 'q_2',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 2000,
        mode: 'training',
        questionId: 'q_3',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      }
    ];

    attempts.forEach(recordAttempt);

    const stats = getSkillAttemptStats('arithmetic_addition');
    expect(stats.recentStreak).toBe(3);
  });
});

describe('Export/Import', () => {
  beforeEach(() => {
    clearAttemptLog();
  });

  it('should export attempt log', () => {
    const attempt: AttemptRecord = {
      attemptId: generateAttemptId(),
      timestamp: Date.now(),
      mode: 'training',
      questionId: 'q_1',
      skillId: 'arithmetic_addition',
      correct: true,
      responseTimeMs: 5000,
      difficultyScore: 0.5,
      sessionId: 'session_1',
      xpGained: 20
    };

    recordAttempt(attempt);

    const exported = exportAttemptLog();
    expect(exported).toBeDefined();
    expect(exported.attempts.length).toBe(1);
    expect(exported.version).toBe(1);
  });

  it('should import attempt log', () => {
    const data = {
      version: 1,
      attempts: [
        {
          attemptId: 'test_123',
          timestamp: Date.now(),
          mode: 'training' as const,
          questionId: 'q_1',
          skillId: 'arithmetic_addition' as const,
          correct: true,
          responseTimeMs: 5000,
          difficultyScore: 0.5,
          sessionId: 'session_1',
          xpGained: 20
        }
      ],
      lastUpdated: Date.now()
    };

    importAttemptLog(data);

    const attempts = getAttempts({});
    expect(attempts.length).toBe(1);
    expect(attempts[0].attemptId).toBe('test_123');
  });

  it('should preserve data through export/import cycle', () => {
    const originalAttempts: AttemptRecord[] = [
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now(),
        mode: 'training',
        questionId: 'q_1',
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      },
      {
        attemptId: generateAttemptId(),
        timestamp: Date.now() + 1000,
        mode: 'bot',
        questionId: 'q_2',
        skillId: 'geometry_shapes',
        correct: false,
        responseTimeMs: 8000,
        difficultyScore: 0.7,
        sessionId: 'session_2',
        xpGained: 0
      }
    ];

    originalAttempts.forEach(recordAttempt);

    const exported = exportAttemptLog();
    clearAttemptLog();
    importAttemptLog(exported);

    const imported = getAttempts({});
    expect(imported.length).toBe(2);
    expect(imported[0].questionId).toBe('q_1');
    expect(imported[1].questionId).toBe('q_2');
  });
});

describe('Utility Functions', () => {
  it('should convert tier to difficulty score', () => {
    expect(tierToDifficultyScore(1)).toBeCloseTo(0, 1);
    expect(tierToDifficultyScore(3)).toBeCloseTo(0.5, 1);
    expect(tierToDifficultyScore(5)).toBeCloseTo(1, 1);
  });

  it('should clamp difficulty score to 0-1', () => {
    expect(tierToDifficultyScore(0)).toBeGreaterThanOrEqual(0);
    expect(tierToDifficultyScore(10)).toBeLessThanOrEqual(1);
  });
});

describe('Data Integrity', () => {
  beforeEach(() => {
    clearAttemptLog();
  });

  it('should handle max record limit', () => {
    // Attempt log has MAX_RECORDS limit (10,000)
    // This test verifies it doesn't crash with many records

    for (let i = 0; i < 100; i++) {
      recordAttempt({
        attemptId: generateAttemptId(),
        timestamp: Date.now() + i,
        mode: 'training',
        questionId: `q_${i}`,
        skillId: 'arithmetic_addition',
        correct: i % 2 === 0,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: i % 2 === 0 ? 20 : 0
      });
    }

    const attempts = getAttempts({});
    expect(attempts.length).toBe(100);
  });

  it('should maintain chronological order', () => {
    const timestamps = [1000, 2000, 3000, 4000, 5000];

    timestamps.forEach((ts, i) => {
      recordAttempt({
        attemptId: generateAttemptId(),
        timestamp: ts,
        mode: 'training',
        questionId: `q_${i}`,
        skillId: 'arithmetic_addition',
        correct: true,
        responseTimeMs: 5000,
        difficultyScore: 0.5,
        sessionId: 'session_1',
        xpGained: 20
      });
    });

    const attempts = getAttempts({});
    for (let i = 1; i < attempts.length; i++) {
      expect(attempts[i].timestamp).toBeGreaterThanOrEqual(attempts[i - 1].timestamp);
    }
  });
});
