/**
 * Session Builder Service
 *
 * Intelligent question selection for training sessions with:
 * - Spaced repetition prioritization (SM-2)
 * - Strict filter enforcement (domain/skill/grade/difficulty)
 * - No duplicates within session
 * - Template variety balancing
 */

import { PrismaClient, Question, Mastery } from '@prisma/client';

export interface SessionBuilderParams {
  userId: string;
  mode: string; // 'training', 'bot', 'learning'

  // Filters
  domain?: string;
  skillIds?: string[];
  gradeBand?: string; // e.g., 'K-1', '2-3', '4-5'

  // Configuration
  count?: number; // Default: 10
  targetDifficulty?: number; // 1-10, default: based on user mastery
  seed?: number; // For reproducible randomization

  // Advanced
  allowedDifficulties?: number[]; // Override difficulty range
}

export interface SessionBuilderResult {
  sessionId: string;
  questions: Question[];
  metadata: {
    dueCount: number; // Questions from spaced repetition
    newCount: number; // New questions
    avgDifficulty: number;
    skillCoverage: string[]; // Skills represented
  };
}

interface QuestionCandidate extends Question {
  priority: number; // Higher = more priority
  isDue: boolean;
  lastSeenDaysAgo: number | null;
}

/**
 * Session Builder Service
 */
export class SessionBuilderService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Build a training session with intelligent question selection
   */
  async buildSession(params: SessionBuilderParams): Promise<SessionBuilderResult> {
    const {
      userId,
      mode,
      domain,
      skillIds,
      gradeBand,
      count = 10,
      targetDifficulty,
      seed,
    } = params;

    // 1. Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // 2. Determine target difficulty (if not provided)
    const finalTargetDifficulty = targetDifficulty ||
      await this.calculateTargetDifficulty(userId, skillIds);

    // 3. Get mastery data for prioritization
    const masteryMap = await this.getMasteryMap(userId, skillIds);

    // 4. Build question pool with filters
    const candidates = await this.getQuestionCandidates({
      userId,
      domain,
      skillIds,
      gradeBand,
      targetDifficulty: finalTargetDifficulty,
      userAge: user.age,
      masteryMap,
    });

    if (candidates.length === 0) {
      throw new Error('No questions found matching criteria');
    }

    // 5. Select questions with priority and variety
    const selectedQuestions = this.selectQuestionsWithPriority(
      candidates,
      count,
      seed
    );

    if (selectedQuestions.length === 0) {
      throw new Error('Could not select enough questions');
    }

    // 6. Create session and session questions
    const session = await this.prisma.session.create({
      data: {
        userId,
        mode,
        selectedSkillIds: JSON.stringify(skillIds || []),
        targetDifficulty: finalTargetDifficulty,
        questionCount: selectedQuestions.length,
      },
    });

    // 7. Create SessionQuestion records (enforces uniqueness)
    await this.prisma.sessionQuestion.createMany({
      data: selectedQuestions.map((q, index) => ({
        sessionId: session.id,
        questionId: q.id,
        orderIndex: index,
      })),
      skipDuplicates: true,
    });

    // 8. Calculate metadata
    const dueCount = selectedQuestions.filter(q => q.isDue).length;
    const newCount = selectedQuestions.length - dueCount;
    const avgDifficulty = selectedQuestions.reduce((sum, q) => sum + q.difficulty, 0) / selectedQuestions.length;
    const skillCoverage = [...new Set(selectedQuestions.map(q => q.skillId))];

    return {
      sessionId: session.id,
      questions: selectedQuestions,
      metadata: {
        dueCount,
        newCount,
        avgDifficulty,
        skillCoverage,
      },
    };
  }

  /**
   * Calculate target difficulty based on user's average mastery
   */
  private async calculateTargetDifficulty(
    userId: string,
    skillIds?: string[]
  ): Promise<number> {
    const where = skillIds && skillIds.length > 0
      ? { userId, skillId: { in: skillIds } }
      : { userId };

    const masteryRecords = await this.prisma.mastery.findMany({
      where,
    });

    if (masteryRecords.length === 0) {
      return 3; // Default for new users
    }

    // Average current difficulty across skills
    const avgDifficulty = masteryRecords.reduce(
      (sum, m) => sum + m.currentDifficulty,
      0
    ) / masteryRecords.length;

    return Math.round(avgDifficulty);
  }

  /**
   * Get mastery map for prioritization
   */
  private async getMasteryMap(
    userId: string,
    skillIds?: string[]
  ): Promise<Map<string, Mastery>> {
    const where = skillIds && skillIds.length > 0
      ? { userId, skillId: { in: skillIds } }
      : { userId };

    const masteryRecords = await this.prisma.mastery.findMany({
      where,
    });

    const map = new Map<string, Mastery>();
    for (const m of masteryRecords) {
      map.set(m.skillId, m);
    }

    return map;
  }

  /**
   * Get question candidates with filters and priority scoring
   */
  private async getQuestionCandidates(params: {
    userId: string;
    domain?: string;
    skillIds?: string[];
    gradeBand?: string;
    targetDifficulty: number;
    userAge: number;
    masteryMap: Map<string, Mastery>;
  }): Promise<QuestionCandidate[]> {
    const {
      userId,
      domain,
      skillIds,
      gradeBand,
      targetDifficulty,
      userAge,
      masteryMap,
    } = params;

    // Build query filters
    const where: any = {
      validated: true, // Only validated questions
    };

    if (domain) {
      where.domain = domain;
    }

    if (skillIds && skillIds.length > 0) {
      where.skillId = { in: skillIds };
    }

    if (gradeBand) {
      // Match questions that overlap with user's grade band
      where.OR = [
        { gradeMin: gradeBand },
        { gradeMax: gradeBand },
      ];
    }

    // Age filters
    where.ageMin = { lte: userAge };
    where.ageMax = { gte: userAge };

    // Difficulty filter: target ± 1
    const minDiff = Math.max(1, targetDifficulty - 1);
    const maxDiff = Math.min(10, targetDifficulty + 1);
    where.difficulty = { gte: minDiff, lte: maxDiff };

    // Fetch questions
    const questions = await this.prisma.question.findMany({
      where,
      take: 200, // Fetch pool of candidates
    });

    // Get recent attempts to avoid recently seen questions
    const recentAttempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        questionId: true,
        createdAt: true,
      },
    });

    const recentQuestionMap = new Map<string, Date>();
    for (const attempt of recentAttempts) {
      const existing = recentQuestionMap.get(attempt.questionId);
      if (!existing || attempt.createdAt > existing) {
        recentQuestionMap.set(attempt.questionId, attempt.createdAt);
      }
    }

    // Score candidates
    const now = Date.now();
    const candidates: QuestionCandidate[] = questions.map(q => {
      const mastery = masteryMap.get(q.skillId);
      const lastSeen = recentQuestionMap.get(q.id);
      const lastSeenDaysAgo = lastSeen
        ? (now - lastSeen.getTime()) / (24 * 60 * 60 * 1000)
        : null;

      // Calculate priority
      let priority = 0;

      // 1. Spaced repetition: highest priority for due questions
      if (mastery?.dueAt && mastery.dueAt <= new Date()) {
        priority += 1000; // Very high priority
        const daysOverdue = (now - mastery.dueAt.getTime()) / (24 * 60 * 60 * 1000);
        priority += Math.min(daysOverdue * 10, 100); // +10 per day overdue (max 100)
      }

      // 2. Never seen questions: medium-high priority
      if (!lastSeen) {
        priority += 500;
      }

      // 3. Not seen recently: medium priority
      if (lastSeenDaysAgo !== null && lastSeenDaysAgo > 3) {
        priority += 100 + lastSeenDaysAgo * 5; // +5 per day since last seen
      }

      // 4. Difficulty match: prefer exact match
      const diffDelta = Math.abs(q.difficulty - targetDifficulty);
      priority -= diffDelta * 10; // -10 per difficulty step away

      // 5. Low mastery skills: slightly higher priority
      if (mastery && mastery.masteryScore < 0.5) {
        priority += 50;
      }

      return {
        ...q,
        priority,
        isDue: mastery?.dueAt ? mastery.dueAt <= new Date() : false,
        lastSeenDaysAgo,
      };
    });

    return candidates;
  }

  /**
   * Select questions with priority-based selection and variety balancing
   */
  private selectQuestionsWithPriority(
    candidates: QuestionCandidate[],
    count: number,
    seed?: number
  ): QuestionCandidate[] {
    // Sort by priority (descending)
    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);

    const selected: QuestionCandidate[] = [];
    const usedQuestionIds = new Set<string>();
    const templateCounts = new Map<string, number>();
    const recentTemplates: string[] = []; // Track last 2 templates

    for (const candidate of sorted) {
      if (selected.length >= count) break;

      // 1. No duplicates
      if (usedQuestionIds.has(candidate.id)) continue;

      // 2. Template variety: don't use same template 3 times in a row
      const templateId = this.extractTemplateId(candidate.prompt);

      if (recentTemplates.length >= 2) {
        const [prev1, prev2] = recentTemplates.slice(-2);
        if (templateId === prev1 && templateId === prev2) {
          // Skip if same template 2 times already
          continue;
        }
      }

      // 3. Template limit: max 2 per template per session
      const templateCount = templateCounts.get(templateId) || 0;
      if (templateCount >= 2) {
        // Try to skip, but allow if we're running out of options
        const remaining = sorted.length - sorted.indexOf(candidate);
        const needed = count - selected.length;
        if (remaining > needed * 2) {
          continue; // Skip, we have enough alternatives
        }
      }

      // Select this question
      selected.push(candidate);
      usedQuestionIds.add(candidate.id);
      templateCounts.set(templateId, templateCount + 1);
      recentTemplates.push(templateId);
      if (recentTemplates.length > 2) {
        recentTemplates.shift();
      }
    }

    return selected;
  }

  /**
   * Extract template ID from question prompt (simple heuristic)
   */
  private extractTemplateId(prompt: string): string {
    // Simple pattern matching for templates
    // E.g., "5 + 3" -> "addition"
    // E.g., "Сколько здесь яблок?" -> "counting"

    if (/^\d+\s*[+]\s*\d+/.test(prompt)) return 'addition';
    if (/^\d+\s*[-−]\s*\d+/.test(prompt)) return 'subtraction';
    if (/^\d+\s*[×*]\s*\d+/.test(prompt)) return 'multiplication';
    if (/^\d+\s*[÷/]\s*\d+/.test(prompt)) return 'division';
    if (/Сколько/.test(prompt)) return 'counting';
    if (/фигур/.test(prompt)) return 'shapes';
    if (/периметр/.test(prompt)) return 'perimeter';
    if (/площадь/.test(prompt)) return 'area';
    if (/паттерн/.test(prompt)) return 'pattern';

    // Default: use first 20 chars as template
    return prompt.substring(0, 20);
  }
}
