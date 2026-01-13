/**
 * Admin API Routes
 *
 * Bank health checks, CSV import/export, audit logs.
 * All endpoints require admin authentication.
 */

import { Router } from 'express';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require admin
router.use(requireAdmin);

// ==================== GET /api/admin/health ====================

/**
 * Bank health dashboard
 * Checks: orphan skills, domain/topic mismatches, duplicates, invalid metadata
 */
router.get('/health', async (req, res) => {
  try {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check for questions with invalid skillId
    const questions = await prisma.question.findMany({
      include: {
        skill: true,
      },
    });

    const orphanQuestions = questions.filter(q => !q.skill);
    if (orphanQuestions.length > 0) {
      errors.push(`${orphanQuestions.length} questions reference non-existent skills`);
    }

    // 2. Check domain/topic mismatches
    const domainMismatches = questions.filter(
      q => q.skill && q.domain !== q.skill.domain
    );
    if (domainMismatches.length > 0) {
      errors.push(`${domainMismatches.length} questions have domain mismatch with their skill`);
    }

    const topicMismatches = questions.filter(
      q => q.skill && q.topic !== q.skill.topic
    );
    if (topicMismatches.length > 0) {
      errors.push(`${topicMismatches.length} questions have topic mismatch with their skill`);
    }

    // 3. Check for unvalidated questions
    const unvalidated = await prisma.question.count({
      where: { validated: false },
    });
    if (unvalidated > 0) {
      warnings.push(`${unvalidated} questions are not validated`);
    }

    // 4. Check for duplicate content hashes
    const duplicateHashes = await prisma.question.groupBy({
      by: ['contentHash'],
      having: {
        contentHash: {
          _count: {
            gt: 1,
          },
        },
      },
      _count: true,
    });
    if (duplicateHashes.length > 0) {
      warnings.push(`${duplicateHashes.length} potential duplicate question groups`);
    }

    // 5. Check difficulty distribution
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: {
        difficulty: 'asc',
      },
    });

    // Warn if no questions at certain difficulties
    for (let i = 1; i <= 10; i++) {
      const count = difficultyStats.find(s => s.difficulty === i)?._count || 0;
      if (count === 0) {
        warnings.push(`No questions at difficulty level ${i}`);
      }
    }

    // 6. Check for skills with no questions
    const skillsWithoutQuestions = await prisma.skill.findMany({
      where: {
        questions: {
          none: {},
        },
      },
    });
    if (skillsWithoutQuestions.length > 0) {
      warnings.push(`${skillsWithoutQuestions.length} skills have no questions`);
    }

    // 7. Check for questions without choices
    const questionsWithoutChoices = questions.filter(q => {
      const choices = JSON.parse(q.choices);
      return !Array.isArray(choices) || choices.length < 2;
    });
    if (questionsWithoutChoices.length > 0) {
      errors.push(`${questionsWithoutChoices.length} questions have invalid choices (< 2)`);
    }

    // 8. Check for invalid difficulty/grade band combinations
    const invalidGradeBands = questions.filter(q => {
      const gradeOrder = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];
      const minIdx = gradeOrder.indexOf(q.gradeMin);
      const maxIdx = gradeOrder.indexOf(q.gradeMax);
      return minIdx === -1 || maxIdx === -1 || minIdx > maxIdx;
    });
    if (invalidGradeBands.length > 0) {
      errors.push(`${invalidGradeBands.length} questions have invalid grade band ranges`);
    }

    res.json({
      status: errors.length === 0 ? 'healthy' : 'errors',
      errors,
      warnings,
      stats: {
        totalQuestions: questions.length,
        totalSkills: await prisma.skill.count(),
        validated: questions.filter(q => q.validated).length,
        difficultyDistribution: difficultyStats,
      },
    });
  } catch (error) {
    console.error('[Admin API] Health check error:', error);
    res.status(500).json({ error: 'Failed to run health check' });
  }
});

// ==================== GET /api/admin/stats ====================

/**
 * Overall bank statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalQuestions,
      totalSkills,
      totalUsers,
      totalSessions,
      totalAttempts,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.skill.count(),
      prisma.user.count(),
      prisma.session.count(),
      prisma.attempt.count(),
    ]);

    const byDomain = await prisma.question.groupBy({
      by: ['domain'],
      _count: true,
    });

    const byGrade = await prisma.question.groupBy({
      by: ['gradeMin'],
      _count: true,
    });

    const byDifficulty = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: {
        difficulty: 'asc',
      },
    });

    res.json({
      totalQuestions,
      totalSkills,
      totalUsers,
      totalSessions,
      totalAttempts,
      byDomain,
      byGrade,
      byDifficulty,
    });
  } catch (error) {
    console.error('[Admin API] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== GET /api/admin/duplicates ====================

/**
 * Find potential duplicate questions
 */
router.get('/duplicates', async (req, res) => {
  try {
    const duplicateHashes = await prisma.question.groupBy({
      by: ['contentHash'],
      having: {
        contentHash: {
          _count: {
            gt: 1,
          },
        },
      },
      _count: true,
    });

    const duplicateGroups = await Promise.all(
      duplicateHashes.map(async (group) => {
        const questions = await prisma.question.findMany({
          where: {
            contentHash: group.contentHash,
          },
          include: {
            skill: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        });

        return {
          contentHash: group.contentHash,
          count: group._count,
          questions: questions.map(q => ({
            id: q.id,
            skillId: q.skillId,
            skillName: q.skill?.displayName,
            prompt: q.prompt,
            difficulty: q.difficulty,
            createdAt: q.createdAt,
          })),
        };
      })
    );

    res.json({
      duplicateGroups,
      totalGroups: duplicateGroups.length,
    });
  } catch (error) {
    console.error('[Admin API] Duplicates error:', error);
    res.status(500).json({ error: 'Failed to find duplicates' });
  }
});

// ==================== GET /api/admin/orphans ====================

/**
 * Find questions with invalid references
 */
router.get('/orphans', async (req, res) => {
  try {
    const allQuestions = await prisma.question.findMany({
      include: {
        skill: true,
      },
    });

    const orphans = allQuestions.filter(q => !q.skill);

    const domainMismatches = allQuestions.filter(
      q => q.skill && q.domain !== q.skill.domain
    );

    const topicMismatches = allQuestions.filter(
      q => q.skill && q.topic !== q.skill.topic
    );

    res.json({
      orphanQuestions: orphans.map(q => ({
        id: q.id,
        skillId: q.skillId,
        prompt: q.prompt.substring(0, 100),
        domain: q.domain,
        topic: q.topic,
      })),
      domainMismatches: domainMismatches.map(q => ({
        id: q.id,
        skillId: q.skillId,
        questionDomain: q.domain,
        skillDomain: q.skill!.domain,
        prompt: q.prompt.substring(0, 100),
      })),
      topicMismatches: topicMismatches.map(q => ({
        id: q.id,
        skillId: q.skillId,
        questionTopic: q.topic,
        skillTopic: q.skill!.topic,
        prompt: q.prompt.substring(0, 100),
      })),
      totalOrphans: orphans.length,
      totalDomainMismatches: domainMismatches.length,
      totalTopicMismatches: topicMismatches.length,
    });
  } catch (error) {
    console.error('[Admin API] Orphans error:', error);
    res.status(500).json({ error: 'Failed to find orphans' });
  }
});

// ==================== GET /api/admin/audit ====================

/**
 * Get audit log
 */
router.get('/audit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.auditLog.count();

    res.json({
      logs: logs.map(log => ({
        ...log,
        changes: log.changes ? JSON.parse(log.changes) : null,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[Admin API] Audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// ==================== POST /api/admin/audit ====================

/**
 * Create audit log entry
 */
router.post('/audit', async (req, res) => {
  try {
    const { userId, action, entity, entityId, changes } = req.body;

    const log = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
      },
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('[Admin API] Create audit log error:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

export default router;
