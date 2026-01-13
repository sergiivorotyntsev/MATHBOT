/**
 * Attempts API Routes
 *
 * Records every answer attempt and updates mastery.
 * Single source of truth for progress tracking.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { requireUser } from '../middleware/auth';
import { CreateAttemptSchema } from '../validators/schemas';

const router = Router();

// ==================== POST /api/attempts ====================

/**
 * Record answer attempt
 * Auto-updates mastery records
 */
router.post('/', requireUser, async (req, res) => {
  try {
    const data = CreateAttemptSchema.parse({
      ...req.body,
      userId: req.userId, // From middleware
    });

    // Validate references exist
    const [user, session, question] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.userId } }),
      prisma.session.findUnique({ where: { id: data.sessionId } }),
      prisma.question.findUnique({ where: { id: data.questionId } }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Create attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        questionId: data.questionId,
        isCorrect: data.isCorrect,
        selected: data.selected,
        timeMs: data.timeMs,
        difficultyAtTime: data.difficultyAtTime,
      },
    });

    // Update or create mastery record
    await updateMastery(data.userId, question.skillId, data.isCorrect, data.timeMs);

    res.status(201).json(attempt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Attempts API] Create error:', error);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

// ==================== GET /api/attempts/session/:sessionId ====================

/**
 * Get all attempts for a session
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const attempts = await prisma.attempt.findMany({
      where: { sessionId },
      include: {
        question: {
          select: {
            id: true,
            prompt: true,
            skillId: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({ attempts });
  } catch (error) {
    console.error('[Attempts API] Get session attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// ==================== GET /api/attempts/user/:userId/recent ====================

/**
 * Get user's recent attempts
 */
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            prompt: true,
            skillId: true,
            domain: true,
            topic: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    res.json({ attempts });
  } catch (error) {
    console.error('[Attempts API] Get user attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// ==================== HELPER: Update Mastery ====================

/**
 * Update mastery record based on attempt
 * Implements SM-2 spaced repetition algorithm
 */
async function updateMastery(
  userId: string,
  skillId: string,
  isCorrect: boolean,
  responseTimeMs: number
): Promise<void> {
  // Get or create mastery record
  let mastery = await prisma.mastery.findUnique({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
  });

  if (!mastery) {
    mastery = await prisma.mastery.create({
      data: {
        userId,
        skillId,
        masteryScore: 0,
        rollingAccuracy: 0,
        streak: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        easeFactor: 2.5, // SM-2 default
        repetitions: 0,
        intervalDays: 0,
      },
    });
  }

  // Update basic stats
  const newTotalAttempts = mastery.totalAttempts + 1;
  const newCorrectAttempts = mastery.correctAttempts + (isCorrect ? 1 : 0);
  const newRollingAccuracy = newCorrectAttempts / newTotalAttempts;
  const newStreak = isCorrect ? mastery.streak + 1 : 0;

  // Calculate SM-2 quality (0-5 scale)
  // Map: correct + fast = 5, correct + slow = 3, incorrect = 0-2
  let quality: number;
  if (isCorrect) {
    // Fast response: < 10 seconds = quality 5, > 30 seconds = quality 3
    const seconds = responseTimeMs / 1000;
    if (seconds < 10) {
      quality = 5; // Perfect recall
    } else if (seconds < 20) {
      quality = 4; // Good recall
    } else {
      quality = 3; // Recall with hesitation
    }
  } else {
    // Incorrect: quality 0 (complete blackout)
    quality = 0;
  }

  // SM-2 Algorithm
  let newEaseFactor = mastery.easeFactor;
  let newRepetitions = mastery.repetitions;
  let newIntervalDays = mastery.intervalDays;

  if (quality >= 3) {
    // Correct answer: update ease factor and repetitions
    newEaseFactor = mastery.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum 1.3

    newRepetitions = mastery.repetitions + 1;

    // Calculate interval
    if (newRepetitions === 1) {
      newIntervalDays = 1;
    } else if (newRepetitions === 2) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(mastery.intervalDays * newEaseFactor);
    }
  } else {
    // Incorrect answer: reset repetitions, shrink interval
    newRepetitions = 0;
    newIntervalDays = 1;
    // Ease factor stays the same (don't penalize learning)
  }

  // Calculate next review date
  const now = new Date();
  const dueAt = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

  // Calculate mastery score (0-1): based on ease factor and repetitions
  // EF ranges from 1.3 to 2.5+ (normalized to 0-1)
  // Repetitions: 0-10+ (normalized to 0-0.5)
  const efScore = Math.min((newEaseFactor - 1.3) / 1.2, 1.0); // 0-1
  const repScore = Math.min(newRepetitions / 10, 0.5); // 0-0.5
  const newMasteryScore = Math.min(efScore * 0.7 + repScore + newRollingAccuracy * 0.3, 1.0);

  // Update mastery record
  await prisma.mastery.update({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
    data: {
      totalAttempts: newTotalAttempts,
      correctAttempts: newCorrectAttempts,
      rollingAccuracy: newRollingAccuracy,
      streak: newStreak,
      masteryScore: newMasteryScore,
      lastSeenAt: now,
      dueAt,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
      intervalDays: newIntervalDays,
      currentDifficulty: mastery.currentDifficulty,
    },
  });
}

export default router;
