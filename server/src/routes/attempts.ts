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
 * Implements simple spaced repetition logic
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
      },
    });
  }

  // Update stats
  const newTotalAttempts = mastery.totalAttempts + 1;
  const newCorrectAttempts = mastery.correctAttempts + (isCorrect ? 1 : 0);
  const newRollingAccuracy = newCorrectAttempts / newTotalAttempts;

  const newStreak = isCorrect ? mastery.streak + 1 : 0;

  // Simple mastery score: weighted average of accuracy and streak bonus
  const accuracyScore = newRollingAccuracy * 0.7;
  const streakBonus = Math.min(newStreak / 10, 0.3); // Max 30% bonus from streak
  const newMasteryScore = Math.min(accuracyScore + streakBonus, 1.0);

  // Calculate next review date (simplified SM-2)
  const now = new Date();
  let interval = 1; // days

  if (newMasteryScore >= 0.9) {
    interval = 7; // Mastered: review in 1 week
  } else if (newMasteryScore >= 0.7) {
    interval = 3; // Good: review in 3 days
  } else if (newMasteryScore >= 0.5) {
    interval = 1; // Medium: review tomorrow
  } else {
    interval = 0; // Weak: review today
  }

  const dueAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

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
      currentDifficulty: mastery.currentDifficulty, // TODO: Adapt based on performance
    },
  });
}

export default router;
