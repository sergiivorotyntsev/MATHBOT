/**
 * 🔌 Question Service - Integration Layer
 *
 * Bridges the new question/stats system with existing MathBotArena code.
 * Provides a clean API for the UI to interact with questions and stats.
 */

import {
  Question,
  QuestionLanguage,
  SkillId,
  ageToGradeBand
} from '../types/question';
import {
  SkillStatsStore,
  AnswerEvent,
  recordAnswer as recordAnswerToStore,
  createInitialStatsStore,
  serializeStatsStore,
  deserializeStatsStore,
  getWeakSkills,
  getSkillsDueForReview,
  getRecommendedSkills,
  isSkillMastered,
  getOrCreateSkillStats
} from '../types/skillStats';
import {
  buildSession,
  buildRecommendedSession,
  buildGradeSession,
  validateSession,
  SessionPlan
} from './sessionBuilder';
import { generateQuestionBank } from './questionGenerator';
import { validateAndLog, assertTopicFidelity } from './questionValidator';

// ==================== STORAGE KEYS ====================

const STATS_STORAGE_KEY = 'mathbot_skill_stats_v1';
const QUESTION_BANK_KEY = 'mathbot_question_bank_v1';
const MASTERED_SKILLS_KEY = 'mathbot_mastered_skills_v1';

// ==================== SINGLETON SERVICE ====================

class QuestionService {
  private statsStore: SkillStatsStore;
  private questionBank: Question[] = [];
  private masteredSkills: Set<SkillId> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.statsStore = createInitialStatsStore();
  }

  /**
   * Initialize service (load from storage)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load stats
      const statsJson = localStorage.getItem(STATS_STORAGE_KEY);
      if (statsJson) {
        this.statsStore = deserializeStatsStore(statsJson);
      }

      // Load mastered skills
      const masteredJson = localStorage.getItem(MASTERED_SKILLS_KEY);
      if (masteredJson) {
        this.masteredSkills = new Set(JSON.parse(masteredJson));
      }

      // Update mastered skills based on current stats
      this.updateMasteredSkills();

      // Generate question bank (or load from cache)
      this.loadOrGenerateQuestionBank();

      this.initialized = true;
      console.log('[QuestionService] Initialized successfully');
      console.log(`[QuestionService] ${this.questionBank.length} questions available`);
      console.log(`[QuestionService] ${this.masteredSkills.size} skills mastered`);
    } catch (error) {
      console.error('[QuestionService] Initialization error:', error);
      this.initialized = true; // Continue anyway
    }
  }

  /**
   * Load or generate question bank
   */
  private loadOrGenerateQuestionBank(): void {
    try {
      const cached = localStorage.getItem(QUESTION_BANK_KEY);
      if (cached) {
        this.questionBank = JSON.parse(cached);
        console.log(`[QuestionService] Loaded ${this.questionBank.length} questions from cache`);
        return;
      }
    } catch (error) {
      console.warn('[QuestionService] Failed to load question bank from cache');
    }

    // Generate fresh bank
    console.log('[QuestionService] Generating question bank...');
    this.questionBank = generateQuestionBank(100, 'en'); // 100 variants per config

    // Validate question bank (dev mode only)
    validateAndLog(this.questionBank);

    // Cache it
    try {
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(this.questionBank));
    } catch (error) {
      console.warn('[QuestionService] Failed to cache question bank (storage full?)');
    }
  }

  /**
   * Save stats to storage
   */
  private saveStats(): void {
    try {
      const json = serializeStatsStore(this.statsStore);
      localStorage.setItem(STATS_STORAGE_KEY, json);
    } catch (error) {
      console.error('[QuestionService] Failed to save stats:', error);
    }
  }

  /**
   * Save mastered skills
   */
  private saveMasteredSkills(): void {
    try {
      const json = JSON.stringify(Array.from(this.masteredSkills));
      localStorage.setItem(MASTERED_SKILLS_KEY, json);
    } catch (error) {
      console.error('[QuestionService] Failed to save mastered skills:', error);
    }
  }

  /**
   * Update mastered skills based on current stats
   */
  private updateMasteredSkills(): void {
    for (const [skillId, stats] of this.statsStore.skills) {
      if (isSkillMastered(stats)) {
        this.masteredSkills.add(skillId);
      }
    }
  }

  /**
   * Create a training session
   */
  async createSession(
    userAge: number,
    focusSkillId: SkillId,
    questionCount: number = 10,
    language: QuestionLanguage = 'en'
  ): Promise<SessionPlan> {
    await this.initialize();

    const plan = buildSession({
      userAge,
      focusSkillId,
      questionCount,
      language,
      statsStore: this.statsStore,
      masteredSkills: this.masteredSkills
    });

    if (!validateSession(plan)) {
      console.error('[QuestionService] Session validation failed!');
    }

    // Dev-only: Validate topic fidelity for focused sessions
    if (import.meta.env.DEV && plan.questions.length > 0) {
      // Extract expected domain/topic from skillId (format: domain_topic or domain_topic_subtopic)
      const parts = focusSkillId.split('_');
      if (parts.length >= 2) {
        const expectedDomain = (parts[0].charAt(0).toUpperCase() + parts[0].slice(1)) as any;
        const fidelity = assertTopicFidelity(plan.questions, expectedDomain);
        if (!fidelity.valid) {
          console.warn(`[QuestionService] Topic fidelity violations for ${focusSkillId}:`, fidelity.violations);
        }
      }
    }

    return plan;
  }

  /**
   * Create a recommended session (adaptive)
   */
  async createRecommendedSession(
    userAge: number,
    questionCount: number = 10,
    language: QuestionLanguage = 'en'
  ): Promise<SessionPlan> {
    await this.initialize();

    return buildRecommendedSession(
      userAge,
      this.statsStore,
      this.masteredSkills,
      questionCount,
      language
    );
  }

  /**
   * Create a grade-aligned session
   */
  async createGradeSession(
    userAge: number,
    grade: number,
    questionCount: number = 10,
    language: QuestionLanguage = 'en'
  ): Promise<SessionPlan> {
    await this.initialize();

    return buildGradeSession(
      userAge,
      grade,
      this.statsStore,
      this.masteredSkills,
      questionCount,
      language
    );
  }

  /**
   * Record an answer
   */
  async recordAnswer(event: AnswerEvent): Promise<void> {
    await this.initialize();

    // Update stats
    recordAnswerToStore(this.statsStore, event);

    // Check if skill was just mastered
    const stats = this.statsStore.skills.get(event.skillId);
    if (stats && isSkillMastered(stats)) {
      if (!this.masteredSkills.has(event.skillId)) {
        this.masteredSkills.add(event.skillId);
        console.log(`[QuestionService] Skill mastered: ${event.skillId}`);
      }
    }

    // Save to storage
    this.saveStats();
    this.saveMasteredSkills();
  }

  /**
   * Get weak skills
   */
  async getWeakSkills(limit: number = 5): Promise<SkillId[]> {
    await this.initialize();
    return getWeakSkills(this.statsStore, limit);
  }

  /**
   * Get skills due for review
   */
  async getReviewSkills(limit: number = 5): Promise<SkillId[]> {
    await this.initialize();
    return getSkillsDueForReview(this.statsStore, limit);
  }

  /**
   * Get recommended skills
   */
  async getRecommendedSkills(): Promise<SkillId[]> {
    await this.initialize();
    return getRecommendedSkills(this.statsStore, this.masteredSkills);
  }

  /**
   * Get stats for a skill
   */
  async getSkillStats(skillId: SkillId) {
    await this.initialize();
    return getOrCreateSkillStats(this.statsStore, skillId);
  }

  /**
   * Get all stats
   */
  async getAllStats() {
    await this.initialize();
    return this.statsStore;
  }

  /**
   * Get mastered skills count
   */
  async getMasteredSkillsCount(): Promise<number> {
    await this.initialize();
    return this.masteredSkills.size;
  }

  /**
   * Check if skill is mastered
   */
  async isSkillMastered(skillId: SkillId): Promise<boolean> {
    await this.initialize();
    return this.masteredSkills.has(skillId);
  }

  /**
   * Get total questions attempted
   */
  async getTotalQuestionsAttempted(): Promise<number> {
    await this.initialize();
    let total = 0;
    for (const stats of this.statsStore.skills.values()) {
      total += stats.attempts;
    }
    return total;
  }

  /**
   * Get total correct answers
   */
  async getTotalCorrectAnswers(): Promise<number> {
    await this.initialize();
    let total = 0;
    for (const stats of this.statsStore.skills.values()) {
      total += stats.correct;
    }
    return total;
  }

  /**
   * Get overall accuracy
   */
  async getOverallAccuracy(): Promise<number> {
    await this.initialize();
    const attempted = await this.getTotalQuestionsAttempted();
    const correct = await this.getTotalCorrectAnswers();
    return attempted > 0 ? (correct / attempted) * 100 : 0;
  }

  /**
   * Clear all data (for debugging/testing)
   */
  async clearAllData(): Promise<void> {
    localStorage.removeItem(STATS_STORAGE_KEY);
    localStorage.removeItem(MASTERED_SKILLS_KEY);
    localStorage.removeItem(QUESTION_BANK_KEY);
    this.statsStore = createInitialStatsStore();
    this.masteredSkills = new Set();
    this.questionBank = [];
    this.initialized = false;
    console.log('[QuestionService] All data cleared');
  }

  /**
   * Export stats for debugging
   */
  async exportStats(): Promise<any> {
    await this.initialize();
    const skills = Array.from(this.statsStore.skills.entries()).map(([id, stats]) => ({
      skillId: id,
      ...stats,
      isMastered: this.masteredSkills.has(id)
    }));

    return {
      totalAttempted: await this.getTotalQuestionsAttempted(),
      totalCorrect: await this.getTotalCorrectAnswers(),
      overallAccuracy: await this.getOverallAccuracy(),
      masteredSkills: Array.from(this.masteredSkills),
      skills
    };
  }
}

// ==================== SINGLETON INSTANCE ====================

export const questionService = new QuestionService();

// ==================== CONVENIENCE EXPORTS ====================

export type {
  Question,
  SkillId,
  QuestionLanguage
} from '../types/question';

export type { SessionPlan } from './sessionBuilder';
export type { AnswerEvent } from '../types/skillStats';
