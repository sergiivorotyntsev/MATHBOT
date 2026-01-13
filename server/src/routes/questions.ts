/**
 * Questions API Routes
 *
 * Manages question bank with strict validation.
 * Enforces: domain/topic match skills, no duplicates (contentHash), metadata completeness.
 */

import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../index';
import { requireAdmin } from '../middleware/auth';
import {
  CreateQuestionSchema,
  UpdateQuestionSchema,
  QuestionQuerySchema
} from '../validators/schemas';

const router = Router();

// ==================== HELPER: Content Hash ====================

/**
 * Generate content hash for duplicate detection
 */
function generateContentHash(prompt: string, choices: string[], correct: string): string {
  const normalized = `${prompt.toLowerCase().trim()}|${choices.map(c => c.toLowerCase().trim()).sort().join('|')}|${correct.toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

// ==================== GET /api/questions/search ====================

/**
 * Search questions with filters
 */
router.get('/search', async (req, res) => {
  try {
    const query = QuestionQuerySchema.parse({
      ...req.query,
      difficulty: req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined,
      ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
      ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
      validated: req.query.validated === 'true' ? true : req.query.validated === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    });

    const questions = await prisma.question.findMany({
      where: {
        ...(query.skillId && { skillId: query.skillId }),
        ...(query.domain && { domain: query.domain }),
        ...(query.topic && { topic: query.topic }),
        ...(query.difficulty && { difficulty: query.difficulty }),
        ...(query.ageMin && { ageMin: { gte: query.ageMin } }),
        ...(query.ageMax && { ageMax: { lte: query.ageMax } }),
        ...(query.gradeMin && { gradeMin: query.gradeMin }),
        ...(query.gradeMax && { gradeMax: query.gradeMax }),
        ...(query.locale && { locale: query.locale }),
        ...(query.validated !== undefined && { validated: query.validated }),
      },
      take: query.limit,
      skip: query.offset,
      orderBy: [
        { domain: 'asc' },
        { difficulty: 'asc' },
      ],
    });

    const total = await prisma.question.count({
      where: {
        ...(query.skillId && { skillId: query.skillId }),
        ...(query.domain && { domain: query.domain }),
        ...(query.topic && { topic: query.topic }),
        ...(query.difficulty && { difficulty: query.difficulty }),
        ...(query.validated !== undefined && { validated: query.validated }),
      },
    });

    // Parse JSON fields
    const parsedQuestions = questions.map(q => ({
      ...q,
      choices: JSON.parse(q.choices) as string[],
      tags: JSON.parse(q.tags) as string[],
    }));

    res.json({
      questions: parsedQuestions,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.errors,
      });
    }

    console.error('[Questions API] Search error:', error);
    res.status(500).json({ error: 'Failed to search questions' });
  }
});

// ==================== GET /api/questions/:id ====================

/**
 * Get single question by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
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
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({
      ...question,
      choices: JSON.parse(question.choices),
      tags: JSON.parse(question.tags),
    });
  } catch (error) {
    console.error('[Questions API] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// ==================== POST /api/questions ====================

/**
 * Create new question (ADMIN ONLY)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = CreateQuestionSchema.parse(req.body);

    // Validate skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: data.skillId },
    });

    if (!skill) {
      return res.status(400).json({
        error: 'Invalid skillId',
        message: `Skill "${data.skillId}" does not exist`,
      });
    }

    // Validate domain/topic match skill
    if (skill.domain !== data.domain) {
      return res.status(400).json({
        error: 'Domain mismatch',
        message: `Question domain "${data.domain}" doesn't match skill domain "${skill.domain}"`,
      });
    }

    if (skill.topic !== data.topic) {
      return res.status(400).json({
        error: 'Topic mismatch',
        message: `Question topic "${data.topic}" doesn't match skill topic "${skill.topic}"`,
      });
    }

    // Generate content hash
    const contentHash = generateContentHash(data.prompt, data.choices, data.correct);

    // Check for duplicates
    const duplicate = await prisma.question.findFirst({
      where: { contentHash },
    });

    if (duplicate) {
      return res.status(409).json({
        error: 'Duplicate question',
        message: 'A question with identical content already exists',
        duplicateId: duplicate.id,
      });
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        skillId: data.skillId,
        domain: data.domain,
        topic: data.topic,
        subtopic: data.subtopic,
        difficulty: data.difficulty,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        gradeMin: data.gradeMin,
        gradeMax: data.gradeMax,
        locale: data.locale,
        prompt: data.prompt,
        choices: JSON.stringify(data.choices),
        correct: data.correct,
        explanation: data.explanation,
        format: data.format,
        tags: JSON.stringify(data.tags),
        version: data.version,
        contentHash,
        validated: true, // Newly created via API are validated
      },
    });

    res.status(201).json({
      ...question,
      choices: JSON.parse(question.choices),
      tags: JSON.parse(question.tags),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Questions API] Create error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// ==================== PUT /api/questions/:id ====================

/**
 * Update question (ADMIN ONLY)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = UpdateQuestionSchema.parse(req.body);

    // Check if question exists
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // If skillId changed, validate new skill
    if (data.skillId && data.skillId !== existing.skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: data.skillId },
      });

      if (!skill) {
        return res.status(400).json({
          error: 'Invalid skillId',
          message: `Skill "${data.skillId}" does not exist`,
        });
      }
    }

    // Recalculate content hash if content changed
    let contentHash = existing.contentHash;
    if (data.prompt || data.choices || data.correct) {
      const prompt = data.prompt || existing.prompt;
      const choices = data.choices || JSON.parse(existing.choices);
      const correct = data.correct || existing.correct;
      contentHash = generateContentHash(prompt, choices, correct);
    }

    // Update question
    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(data.skillId && { skillId: data.skillId }),
        ...(data.domain && { domain: data.domain }),
        ...(data.topic && { topic: data.topic }),
        ...(data.subtopic !== undefined && { subtopic: data.subtopic }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.ageMin && { ageMin: data.ageMin }),
        ...(data.ageMax && { ageMax: data.ageMax }),
        ...(data.gradeMin && { gradeMin: data.gradeMin }),
        ...(data.gradeMax && { gradeMax: data.gradeMax }),
        ...(data.locale && { locale: data.locale }),
        ...(data.prompt && { prompt: data.prompt }),
        ...(data.choices && { choices: JSON.stringify(data.choices) }),
        ...(data.correct && { correct: data.correct }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.format && { format: data.format }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.version && { version: data.version }),
        contentHash,
      },
    });

    res.json({
      ...question,
      choices: JSON.parse(question.choices),
      tags: JSON.parse(question.tags),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('[Questions API] Update error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// ==================== DELETE /api/questions/:id ====================

/**
 * Delete question (ADMIN ONLY)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const existing = await prisma.question.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete question
    await prisma.question.delete({
      where: { id },
    });

    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('[Questions API] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ==================== GET /api/questions/stats/count ====================

/**
 * Get question count statistics
 */
router.get('/stats/count', async (req, res) => {
  try {
    const total = await prisma.question.count();

    const byDomain = await prisma.question.groupBy({
      by: ['domain'],
      _count: true,
    });

    const byDifficulty = await prisma.question.groupBy({
      by: ['difficulty'],
      _count: true,
      orderBy: { difficulty: 'asc' },
    });

    const validated = await prisma.question.count({
      where: { validated: true },
    });

    res.json({
      total,
      validated,
      byDomain,
      byDifficulty,
    });
  } catch (error) {
    console.error('[Questions API] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
