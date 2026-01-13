/**
 * Users API Routes
 *
 * User management and progress tracking.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { requireUser, requireAdmin } from '../middleware/auth';
import { CreateUserSchema, UpdateUserSchema } from '../validators/schemas';

const router = Router();

// ==================== POST /api/users ====================

/**
 * Create new user
 */
router.post('/', async (req, res) => {
  try {
    const data = CreateUserSchema.parse(req.body);

    // Check if email already exists
    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        age: data.age,
        gradeBand: data.gradeBand,
        email: data.email,
        role: data.role,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Users API] Create error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ==================== GET /api/users/:id ====================

/**
 * Get user profile
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sessions: true,
            attempts: true,
            mastery: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[Users API] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ==================== PUT /api/users/:id ====================

/**
 * Update user
 */
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only owner or admin can update
    if (user.id !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.age && { age: data.age }),
        ...(data.gradeBand && { gradeBand: data.gradeBand }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role && { role: data.role }),
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Users API] Update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ==================== GET /api/users/:id/mastery ====================

/**
 * Get user's mastery records (progress by skill)
 */
router.get('/:id/mastery', async (req, res) => {
  try {
    const { id } = req.params;

    const mastery = await prisma.mastery.findMany({
      where: { userId: id },
      include: {
        skill: {
          select: {
            id: true,
            displayName: true,
            domain: true,
            topic: true,
          },
        },
      },
      orderBy: {
        masteryScore: 'desc',
      },
    });

    res.json({ mastery });
  } catch (error) {
    console.error('[Users API] Get mastery error:', error);
    res.status(500).json({ error: 'Failed to fetch mastery' });
  }
});

// ==================== GET /api/users/:id/mastery/due ====================

/**
 * Get skills due for review (spaced repetition)
 */
router.get('/:id/mastery/due', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const now = new Date();

    const dueSkills = await prisma.mastery.findMany({
      where: {
        userId: id,
        dueAt: {
          lte: now,
        },
      },
      include: {
        skill: {
          select: {
            id: true,
            displayName: true,
            domain: true,
            topic: true,
          },
        },
      },
      orderBy: {
        dueAt: 'asc', // Most overdue first
      },
      take: limit,
    });

    res.json({ dueSkills });
  } catch (error) {
    console.error('[Users API] Get due skills error:', error);
    res.status(500).json({ error: 'Failed to fetch due skills' });
  }
});

// ==================== GET /api/users/:id/stats ====================

/**
 * Get user statistics summary
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const [totalSessions, totalAttempts, mastery] = await Promise.all([
      prisma.session.count({ where: { userId: id } }),
      prisma.attempt.count({ where: { userId: id } }),
      prisma.mastery.findMany({ where: { userId: id } }),
    ]);

    const totalCorrect = await prisma.attempt.count({
      where: {
        userId: id,
        isCorrect: true,
      },
    });

    const overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    const averageMastery = mastery.length > 0
      ? mastery.reduce((sum, m) => sum + m.masteryScore, 0) / mastery.length
      : 0;

    const masteredSkills = mastery.filter(m => m.masteryScore >= 0.8).length;

    res.json({
      totalSessions,
      totalAttempts,
      totalCorrect,
      overallAccuracy,
      averageMastery,
      totalSkillsTracked: mastery.length,
      masteredSkills,
    });
  } catch (error) {
    console.error('[Users API] Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== GET /api/users (ADMIN ONLY) ====================

/**
 * List all users (admin only)
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            sessions: true,
            attempts: true,
          },
        },
      },
    });

    const total = await prisma.user.count();

    res.json({
      users,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Users API] List error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
