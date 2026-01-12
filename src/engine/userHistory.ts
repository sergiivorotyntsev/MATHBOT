/**
 * 📊 User History Store - Persist and manage user progress
 */

import {
  UserHistory,
  QuestionHistory,
  SkillHistory,
  GradeLevel
} from './types';

const STORAGE_KEY = 'mathbot_user_history_v1';

// ==================== DEFAULT FACTORIES ====================

function createDefaultQuestionHistory(questionId: string): QuestionHistory {
  return {
    questionId,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
    lastResult: 'incorrect',
    seenCount: 0,
    avgTimeSeconds: 0,
    fastestTimeSeconds: Infinity,
    easeFactor: 2.5,              // SuperMemo default
    nextReviewDue: 0,
    intervalDays: 1
  };
}

function createDefaultSkillHistory(skillId: string): SkillHistory {
  return {
    skillId,
    totalAttempts: 0,
    correctCount: 0,
    currentAccuracy: 0,
    mastery: 0,
    level: 0,
    streak: 0,
    bestStreak: 0,
    lastPracticed: 0,
    nextReviewDue: 0,
    decayRate: 0.02,              // 2% decay per day
    questionsAttempted: [],
    questionsmastered: []
  };
}

function createDefaultUserHistory(userId: string): UserHistory {
  return {
    userId,
    questionHistory: new Map(),
    skillHistory: new Map(),
    totalSessions: 0,
    totalQuestionsAttempted: 0,
    totalCorrect: 0,
    lastActive: Date.now(),
    createdAt: Date.now(),
    version: 1
  };
}

// ==================== USER HISTORY MANAGER ====================

export class UserHistoryManager {
  private history: UserHistory;

  constructor(userId: string) {
    this.history = this.load(userId);
  }

  // ==================== PERSISTENCE ====================

  private load(userId: string): UserHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return createDefaultUserHistory(userId);
      }

      const data = JSON.parse(stored);

      // Reconstruct Maps
      const history: UserHistory = {
        ...data,
        questionHistory: new Map(Object.entries(data.questionHistory || {})),
        skillHistory: new Map(Object.entries(data.skillHistory || {}))
      };

      return history;
    } catch (error) {
      console.error('Failed to load user history:', error);
      return createDefaultUserHistory(userId);
    }
  }

  save(): void {
    try {
      const data = {
        ...this.history,
        questionHistory: Object.fromEntries(this.history.questionHistory),
        skillHistory: Object.fromEntries(this.history.skillHistory),
        lastActive: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user history:', error);
    }
  }

  // ==================== QUESTION HISTORY ====================

  getQuestionHistory(questionId: string): QuestionHistory {
    if (!this.history.questionHistory.has(questionId)) {
      const newHistory = createDefaultQuestionHistory(questionId);
      this.history.questionHistory.set(questionId, newHistory);
    }
    return this.history.questionHistory.get(questionId)!;
  }

  recordQuestionAttempt(
    questionId: string,
    isCorrect: boolean,
    timeSeconds: number,
    skills: string[]
  ): void {
    const qh = this.getQuestionHistory(questionId);
    const now = Date.now();

    // Update question stats
    qh.attempts++;
    qh.seenCount++;
    qh.lastSeen = now;
    qh.lastResult = isCorrect ? 'correct' : 'incorrect';

    if (isCorrect) {
      qh.correct++;
    } else {
      qh.incorrect++;
    }

    // Update timing
    if (qh.avgTimeSeconds === 0) {
      qh.avgTimeSeconds = timeSeconds;
    } else {
      qh.avgTimeSeconds = (qh.avgTimeSeconds * (qh.attempts - 1) + timeSeconds) / qh.attempts;
    }

    if (timeSeconds < qh.fastestTimeSeconds) {
      qh.fastestTimeSeconds = timeSeconds;
    }

    // Update spaced repetition (SuperMemo SM-2 inspired)
    this.updateSpacedRepetition(qh, isCorrect);

    // Update skill histories
    for (const skillId of skills) {
      this.recordSkillAttempt(skillId, questionId, isCorrect);
    }

    // Update totals
    this.history.totalQuestionsAttempted++;
    if (isCorrect) {
      this.history.totalCorrect++;
    }

    this.save();
  }

  private updateSpacedRepetition(qh: QuestionHistory, isCorrect: boolean): void {
    const now = Date.now();

    if (isCorrect) {
      // Increase interval
      if (qh.intervalDays === 1) {
        qh.intervalDays = 6;
      } else {
        qh.intervalDays = Math.round(qh.intervalDays * qh.easeFactor);
      }

      // Increase ease factor
      qh.easeFactor = Math.min(2.5, qh.easeFactor + 0.1);

    } else {
      // Reset interval
      qh.intervalDays = 1;

      // Decrease ease factor
      qh.easeFactor = Math.max(1.3, qh.easeFactor - 0.2);
    }

    qh.nextReviewDue = now + (qh.intervalDays * 24 * 60 * 60 * 1000);
  }

  // ==================== SKILL HISTORY ====================

  getSkillHistory(skillId: string): SkillHistory {
    if (!this.history.skillHistory.has(skillId)) {
      const newHistory = createDefaultSkillHistory(skillId);
      this.history.skillHistory.set(skillId, newHistory);
    }
    return this.history.skillHistory.get(skillId)!;
  }

  recordSkillAttempt(skillId: string, questionId: string, isCorrect: boolean): void {
    const sh = this.getSkillHistory(skillId);
    const now = Date.now();

    sh.totalAttempts++;
    if (isCorrect) {
      sh.correctCount++;
      sh.streak++;
      if (sh.streak > sh.bestStreak) {
        sh.bestStreak = sh.streak;
      }
    } else {
      sh.streak = 0;
    }

    // Update accuracy
    sh.currentAccuracy = (sh.correctCount / sh.totalAttempts) * 100;

    // Update mastery (weighted: 70% accuracy, 30% streak)
    const accuracyComponent = sh.currentAccuracy * 0.7;
    const streakComponent = Math.min(100, sh.streak * 5) * 0.3;
    sh.mastery = Math.min(100, Math.round(accuracyComponent + streakComponent));

    // Update level (mastery / 10)
    sh.level = Math.floor(sh.mastery / 10);

    // Track questions
    if (!sh.questionsAttempted.includes(questionId)) {
      sh.questionsAttempted.push(questionId);
    }

    if (isCorrect && sh.mastery >= 80 && !sh.questionsmastered.includes(questionId)) {
      sh.questionsmastered.push(questionId);
    }

    sh.lastPracticed = now;
    sh.nextReviewDue = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    this.save();
  }

  applySkillDecay(): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (const [skillId, sh] of this.history.skillHistory) {
      if (sh.lastPracticed === 0) continue;

      const daysSinceLastPractice = (now - sh.lastPracticed) / oneDayMs;

      if (daysSinceLastPractice > 1) {
        // Apply exponential decay
        const decayAmount = sh.mastery * sh.decayRate * daysSinceLastPractice;
        sh.mastery = Math.max(0, sh.mastery - decayAmount);
        sh.level = Math.floor(sh.mastery / 10);
      }
    }

    this.save();
  }

  // ==================== QUERIES ====================

  getNeverSeenQuestions(allQuestionIds: string[]): string[] {
    return allQuestionIds.filter(qid => !this.history.questionHistory.has(qid));
  }

  getIncorrectQuestions(): string[] {
    const incorrect: string[] = [];

    for (const [qid, qh] of this.history.questionHistory) {
      if (qh.incorrect > qh.correct) {
        incorrect.push(qid);
      }
    }

    return incorrect;
  }

  getQuestionsForReview(): string[] {
    const now = Date.now();
    const review: string[] = [];

    for (const [qid, qh] of this.history.questionHistory) {
      if (qh.nextReviewDue <= now && qh.correct > 0) {
        review.push(qid);
      }
    }

    return review;
  }

  getWeakSkills(threshold: number = 50): string[] {
    const weak: string[] = [];

    for (const [skillId, sh] of this.history.skillHistory) {
      if (sh.mastery < threshold && sh.totalAttempts >= 3) {
        weak.push(skillId);
      }
    }

    return weak;
  }

  getSkillMastery(skillId: string): number {
    const sh = this.history.skillHistory.get(skillId);
    return sh ? sh.mastery : 0;
  }

  getAllSkillMasteries(): Map<string, number> {
    const masteries = new Map<string, number>();

    for (const [skillId, sh] of this.history.skillHistory) {
      masteries.set(skillId, sh.mastery);
    }

    return masteries;
  }

  // ==================== SESSION TRACKING ====================

  incrementSessionCount(): void {
    this.history.totalSessions++;
    this.save();
  }

  // ==================== EXPORT/IMPORT ====================

  exportHistory(): string {
    return JSON.stringify({
      ...this.history,
      questionHistory: Object.fromEntries(this.history.questionHistory),
      skillHistory: Object.fromEntries(this.history.skillHistory)
    });
  }

  importHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.history = {
        ...data,
        questionHistory: new Map(Object.entries(data.questionHistory || {})),
        skillHistory: new Map(Object.entries(data.skillHistory || {}))
      };
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  clearHistory(): void {
    this.history = createDefaultUserHistory(this.history.userId);
    this.save();
  }
}

console.log('📊 User History Manager loaded');
