/**
 * Sessions API Routes
 *
 * Creates training sessions with question selection from DB.
 * Enforces: no duplicates, skill matching, difficulty progression.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { requireUser } from '../middleware/auth';
import { CreateSessionSchema, UpdateSessionSchema } from '../validators/schemas';

const router = Router();

// ==================== POST /api/sessions ====================

/**
 * Create new session
 * Calls session builder to select questions from DB
 */
router.post('/', requireUser, async (req, res) => {
  try {
    const data = CreateSessionSchema.parse({
      ...req.body,
      userId: req.userId, // From middleware
    });

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate skills exist
    const skills = await prisma.skill.findMany({
      where: {
        id: { in: data.selectedSkillIds },
      },
    });

    if (skills.length !== data.selectedSkillIds.length) {
      const foundIds = skills.map(s => s.id);
      const missing = data.selectedSkillIds.filter(id => !foundIds.includes(id));
      return res.status(400).json({
        error: 'Invalid skillIds',
        missing,
      });
    }

    // TODO: Call session builder service to select questions
    // For now, select random questions matching criteria
    const questions = await prisma.question.findMany({
      where: {
        skillId: { in: data.selectedSkillIds },
        difficulty: { lte: data.targetDifficulty },
        ageMin: { lte: user.age },
        ageMax: { gte: user.age },
        validated: true,
      },
      take: data.questionCount,
      orderBy: {
        id: 'asc', // TODO: Replace with smart selection
      },
    });

    if (questions.length === 0) {
      return res.status(404).json({
        error: 'No questions found',
        message: 'No validated questions match the selected criteria',
      });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        mode: data.mode,
        selectedSkillIds: JSON.stringify(data.selectedSkillIds),
        targetDifficulty: data.targetDifficulty,
        questionCount: data.questionCount,
      },
    });

    // Create session questions (join table)
    await prisma.sessionQuestion.createMany({
      data: questions.map((q, index) => ({
        sessionId: session.id,
        questionId: q.id,
        orderIndex: index,
      })),
    });

    // Fetch full session with questions
    const fullSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        sessionQuestions: {
          include: {
            question: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    res.status(201).json({
      session: {
        ...fullSession,
        selectedSkillIds: JSON.parse(fullSession!.selectedSkillIds),
        questions: fullSession!.sessionQuestions.map(sq => ({
          ...sq.question,
          choices: JSON.parse(sq.question.choices),
          tags: JSON.parse(sq.question.tags),
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Sessions API] Create error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ==================== GET /api/sessions/:id ====================

/**
 * Get session with questions
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            age: true,
            gradeBand: true,
          },
        },
        sessionQuestions: {
          include: {
            question: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        attempts: {
          select: {
            id: true,
            questionId: true,
            isCorrect: true,
            timeMs: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      ...session,
      selectedSkillIds: JSON.parse(session.selectedSkillIds),
      questions: session.sessionQuestions.map(sq => ({
        ...sq.question,
        choices: JSON.parse(sq.question.choices),
        tags: JSON.parse(sq.question.tags),
      })),
    });
  } catch (error) {
    console.error('[Sessions API] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// ==================== PUT /api/sessions/:id ====================

/**
 * Update session (mark as ended, update stats)
 */
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateSessionSchema.parse(req.body);

    const session = await prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only owner can update
    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        ...(data.endedAt && { endedAt: data.endedAt }),
        ...(data.questionsCompleted !== undefined && { questionsCompleted: data.questionsCompleted }),
        ...(data.correctCount !== undefined && { correctCount: data.correctCount }),
        ...(data.totalTimeMs !== undefined && { totalTimeMs: data.totalTimeMs }),
      },
    });

    res.json({
      ...updated,
      selectedSkillIds: JSON.parse(updated.selectedSkillIds),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Sessions API] Update error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// ==================== GET /api/sessions/user/:userId ====================

/**
 * Get user's session history
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const sessions = await prisma.session.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            sessionQuestions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const total = await prisma.session.count({
      where: { userId },
    });

    res.json({
      sessions: sessions.map(s => ({
        ...s,
        selectedSkillIds: JSON.parse(s.selectedSkillIds),
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Sessions API] User sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch user sessions' });
  }
});

export default router;
