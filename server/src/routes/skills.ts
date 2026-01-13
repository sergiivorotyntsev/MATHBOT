/**
 * Skills API Routes
 *
 * Manages skill taxonomy (domain, topic, prerequisites, grade bands)
 * All skills must exist in DB before questions can reference them.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import {
  CreateSkillSchema,
  UpdateSkillSchema,
  DomainSchema,
  GradeBandSchema
} from '../validators/schemas';

const router = Router();

// ==================== GET /api/skills ====================

/**
 * List all skills with optional filters
 * Query params: domain, topic, gradeMin, gradeMax
 */
router.get('/', async (req, res) => {
  try {
    const { domain, topic, gradeMin, gradeMax } = req.query;

    const skills = await prisma.skill.findMany({
      where: {
        ...(domain && { domain: domain as string }),
        ...(topic && { topic: topic as string }),
        ...(gradeMin && { gradeMin: gradeMin as string }),
        ...(gradeMax && { gradeMax: gradeMax as string }),
      },
      orderBy: [
        { domain: 'asc' },
        { topic: 'asc' },
      ],
    });

    res.json({
      skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('[Skills API] List error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// ==================== GET /api/skills/:id ====================

/**
 * Get single skill by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            difficulty: true,
            gradeMin: true,
            gradeMax: true,
          },
          orderBy: { difficulty: 'asc' },
        },
      },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Parse JSON fields
    const skillWithParsed = {
      ...skill,
      prerequisites: JSON.parse(skill.prerequisites) as string[],
      ccssStandards: JSON.parse(skill.ccssStandards) as string[],
      questionCount: skill.questions.length,
    };

    res.json(skillWithParsed);
  } catch (error) {
    console.error('[Skills API] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

// ==================== POST /api/skills ====================

/**
 * Create new skill (ADMIN ONLY)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = CreateSkillSchema.parse(req.body);

    // Check if skill ID already exists
    const existing = await prisma.skill.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      return res.status(409).json({ error: 'Skill ID already exists' });
    }

    // Create skill
    const skill = await prisma.skill.create({
      data: {
        id: data.id,
        domain: data.domain,
        topic: data.topic,
        subtopic: data.subtopic,
        displayName: data.displayName,
        description: data.description,
        prerequisites: JSON.stringify(data.prerequisites),
        gradeMin: data.gradeMin,
        gradeMax: data.gradeMax,
        estimatedMinutes: data.estimatedMinutes,
        priority: data.priority,
        ccssStandards: JSON.stringify(data.ccssStandards),
      },
    });

    res.status(201).json({
      skill: {
        ...skill,
        prerequisites: JSON.parse(skill.prerequisites),
        ccssStandards: JSON.parse(skill.ccssStandards),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Skills API] Create error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

// ==================== PUT /api/skills/:id ====================

/**
 * Update skill (ADMIN ONLY)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateSkillSchema.parse(req.body);

    // Check if skill exists
    const existing = await prisma.skill.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Update skill
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.domain && { domain: data.domain }),
        ...(data.topic && { topic: data.topic }),
        ...(data.subtopic !== undefined && { subtopic: data.subtopic }),
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.prerequisites && { prerequisites: JSON.stringify(data.prerequisites) }),
        ...(data.gradeMin && { gradeMin: data.gradeMin }),
        ...(data.gradeMax && { gradeMax: data.gradeMax }),
        ...(data.estimatedMinutes && { estimatedMinutes: data.estimatedMinutes }),
        ...(data.priority && { priority: data.priority }),
        ...(data.ccssStandards && { ccssStandards: JSON.stringify(data.ccssStandards) }),
      },
    });

    res.json({
      skill: {
        ...skill,
        prerequisites: JSON.parse(skill.prerequisites),
        ccssStandards: JSON.parse(skill.ccssStandards),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Skills API] Update error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// ==================== DELETE /api/skills/:id ====================

/**
 * Delete skill (ADMIN ONLY)
 * WARNING: Cascades to all questions with this skillId
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if skill exists
    const existing = await prisma.skill.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Delete skill (cascades to questions)
    await prisma.skill.delete({
      where: { id },
    });

    res.json({
      message: 'Skill deleted',
      deletedQuestions: existing._count.questions,
    });
  } catch (error) {
    console.error('[Skills API] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

export default router;
