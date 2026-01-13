/**
 * Zod validation schemas for API requests
 *
 * All API endpoints should validate input using these schemas.
 */

import { z } from 'zod';

// ==================== COMMON SCHEMAS ====================

export const GradeBandSchema = z.enum(['K-1', '2-3', '4-5', '6-7', '8-9', '10-12']);

export const DomainSchema = z.enum(['Arithmetic', 'Geometry', 'Logic']);

export const QuestionFormatSchema = z.enum(['mcq', 'input', 'drag-drop']);

export const SessionModeSchema = z.enum(['training', 'bot', 'learning']);

// ==================== SKILL SCHEMAS ====================

export const CreateSkillSchema = z.object({
  id: z.string().regex(/^[a-z]+_[a-z_]+$/, 'Must be lowercase with underscores (e.g., arithmetic_addition)'),
  domain: DomainSchema,
  topic: z.string().min(1),
  subtopic: z.string().optional(),
  displayName: z.string().min(1),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  gradeMin: GradeBandSchema,
  gradeMax: GradeBandSchema,
  estimatedMinutes: z.number().int().positive().default(30),
  priority: z.enum(['1', '2', '3']).transform(Number).default(2),
  ccssStandards: z.array(z.string()).default([]),
});

export const UpdateSkillSchema = CreateSkillSchema.partial().omit({ id: true });

// ==================== QUESTION SCHEMAS ====================

export const CreateQuestionSchema = z.object({
  skillId: z.string(),
  domain: DomainSchema,
  topic: z.string().min(1),
  subtopic: z.string().optional(),

  difficulty: z.number().int().min(1).max(10),
  ageMin: z.number().int().min(4).max(18),
  ageMax: z.number().int().min(4).max(18),
  gradeMin: GradeBandSchema,
  gradeMax: GradeBandSchema,

  locale: z.string().length(2).default('en'),
  prompt: z.string().min(1),
  choices: z.array(z.string()).min(2),
  correct: z.string(),
  explanation: z.string().optional(),

  format: QuestionFormatSchema.default('mcq'),
  tags: z.array(z.string()).default([]),
  version: z.number().int().positive().default(1),
}).refine((data) => data.choices.includes(data.correct), {
  message: 'Correct answer must be one of the choices',
  path: ['correct'],
}).refine((data) => data.ageMin <= data.ageMax, {
  message: 'ageMin must be <= ageMax',
  path: ['ageMin'],
});

export const UpdateQuestionSchema = CreateQuestionSchema.partial();

export const BulkImportQuestionSchema = z.array(CreateQuestionSchema);

// ==================== SESSION SCHEMAS ====================

export const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
  mode: SessionModeSchema,
  selectedSkillIds: z.array(z.string()).min(1),
  targetDifficulty: z.number().int().min(1).max(10).default(5),
  questionCount: z.number().int().min(1).max(50).default(10),
});

export const UpdateSessionSchema = z.object({
  endedAt: z.date().optional(),
  questionsCompleted: z.number().int().min(0).optional(),
  correctCount: z.number().int().min(0).optional(),
  totalTimeMs: z.number().int().min(0).optional(),
});

// ==================== ATTEMPT SCHEMAS ====================

export const CreateAttemptSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  isCorrect: z.boolean(),
  selected: z.string(),
  timeMs: z.number().int().min(0),
  difficultyAtTime: z.number().int().min(1).max(10),
});

// ==================== USER SCHEMAS ====================

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(4).max(18),
  gradeBand: GradeBandSchema,
  email: z.string().email().optional(),
  role: z.enum(['student', 'admin']).default('student'),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// ==================== QUERY SCHEMAS ====================

export const QuestionQuerySchema = z.object({
  skillId: z.string().optional(),
  domain: DomainSchema.optional(),
  topic: z.string().optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  ageMin: z.number().int().min(4).max(18).optional(),
  ageMax: z.number().int().min(4).max(18).optional(),
  gradeMin: GradeBandSchema.optional(),
  gradeMax: GradeBandSchema.optional(),
  locale: z.string().length(2).optional(),
  validated: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const SessionQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  mode: SessionModeSchema.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// ==================== CSV IMPORT SCHEMA ====================

export const CSVQuestionRowSchema = z.object({
  id: z.string().optional(),
  domain: z.string(),
  skillId: z.string(),
  topic: z.string(),
  subtopic: z.string().optional(),
  difficulty: z.string().transform(Number),
  ageMin: z.string().transform(Number),
  ageMax: z.string().transform(Number),
  gradeMin: z.string(),
  gradeMax: z.string(),
  locale: z.string(),
  prompt: z.string(),
  choiceA: z.string(),
  choiceB: z.string(),
  choiceC: z.string(),
  choiceD: z.string().optional(),
  correctChoice: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().optional(),
  tags: z.string().optional(), // semicolon-separated
  version: z.string().optional().transform(v => v ? Number(v) : 1),
}).transform((data) => ({
  id: data.id,
  domain: data.domain as any,
  skillId: data.skillId,
  topic: data.topic,
  subtopic: data.subtopic,
  difficulty: data.difficulty,
  ageMin: data.ageMin,
  ageMax: data.ageMax,
  gradeMin: data.gradeMin as any,
  gradeMax: data.gradeMax as any,
  locale: data.locale,
  prompt: data.prompt,
  choices: [data.choiceA, data.choiceB, data.choiceC, data.choiceD].filter(Boolean),
  correct: ({ A: data.choiceA, B: data.choiceB, C: data.choiceC, D: data.choiceD })[data.correctChoice],
  explanation: data.explanation,
  format: 'mcq' as const,
  tags: data.tags ? data.tags.split(';').map(t => t.trim()) : [],
  version: data.version,
}));
