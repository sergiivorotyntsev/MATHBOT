/**
 * 🎯 Question Engine - Smart question selection with anti-repeat & personalization
 */

import {
  Question,
  QuestionSelection,
  SessionState,
  GradeLevel
} from './types';
import { UserHistoryManager } from './userHistory';
import { isGradeInRange } from './curriculumMap';

export interface QuestionEngineConfig {
  userHistory: UserHistoryManager;
  sessionState: SessionState;

  // Question pool
  availableQuestions: Question[];

  // Selection weights
  weights?: {
    neverSeen: number;        // Default: 5.0
    reviewDue: number;        // Default: 4.0
    incorrectBefore: number;  // Default: 3.0
    weakSkill: number;        // Default: 2.5
    random: number;           // Default: 1.0
  };
}

export class QuestionEngine {
  private config: QuestionEngineConfig;
  private weights: Required<QuestionEngineConfig['weights']>;

  constructor(config: QuestionEngineConfig) {
    this.config = config;

    // Set default weights
    this.weights = {
      neverSeen: config.weights?.neverSeen ?? 5.0,
      reviewDue: config.weights?.reviewDue ?? 4.0,
      incorrectBefore: config.weights?.incorrectBefore ?? 3.0,
      weakSkill: config.weights?.weakSkill ?? 2.5,
      random: config.weights?.random ?? 1.0
    };
  }

  // ==================== MAIN SELECTION METHOD ====================

  selectNextQuestion(): QuestionSelection | null {
    const { sessionState, userHistory, availableQuestions } = this.config;

    // Filter questions
    const eligibleQuestions = this.filterQuestions(availableQuestions, sessionState);

    if (eligibleQuestions.length === 0) {
      return null; // No more questions
    }

    // Score each question
    const scoredQuestions = eligibleQuestions.map(q => ({
      question: q,
      score: this.scoreQuestion(q, userHistory, sessionState),
      reason: this.getSelectionReason(q, userHistory, sessionState)
    }));

    // Sort by score (descending)
    scoredQuestions.sort((a, b) => b.score - a.score);

    // Take top question
    const best = scoredQuestions[0];

    return {
      question: best.question,
      reason: best.reason,
      confidence: best.score / this.weights.neverSeen // Normalize 0-1
    };
  }

  // ==================== FILTERING ====================

  private filterQuestions(
    questions: Question[],
    sessionState: SessionState
  ): Question[] {
    return questions.filter(q => {
      // 1. Not seen in current session
      if (sessionState.seenQuestionIds.has(q.metadata.questionId)) {
        return false;
      }

      // 2. Grade range check
      const [minGrade, maxGrade] = q.metadata.gradeRange;
      if (!isGradeInRange(sessionState.grade, minGrade, maxGrade)) {
        return false;
      }

      // 3. Difficulty band check
      if (sessionState.difficultyBand) {
        const [minDiff, maxDiff] = sessionState.difficultyBand;
        if (q.metadata.difficulty < minDiff || q.metadata.difficulty > maxDiff) {
          return false;
        }
      }

      // 4. Topic filter check
      if (sessionState.topicFilter) {
        if (q.metadata.topic !== sessionState.topicFilter) {
          return false;
        }
      }

      // 5. Subtopic filter check
      if (sessionState.subtopicFilter) {
        if (q.metadata.subtopic !== sessionState.subtopicFilter) {
          return false;
        }
      }

      return true;
    });
  }

  // ==================== SCORING ====================

  private scoreQuestion(
    question: Question,
    userHistory: UserHistoryManager,
    sessionState: SessionState
  ): number {
    const qid = question.metadata.questionId;
    let score = 0;

    // Check if never seen
    const qh = userHistory.getQuestionHistory(qid);
    if (qh.attempts === 0) {
      score += this.weights.neverSeen;
    }

    // Check if review due (spaced repetition)
    const now = Date.now();
    if (qh.attempts > 0 && qh.nextReviewDue <= now) {
      score += this.weights.reviewDue;
    }

    // Check if incorrect before
    if (qh.incorrect > qh.correct) {
      score += this.weights.incorrectBefore;
    }

    // Check if related to weak skills
    const hasWeakSkill = question.metadata.skills.some(skillId => {
      const sh = userHistory.getSkillHistory(skillId);
      return sh.mastery < 50 && sh.totalAttempts >= 3;
    });

    if (hasWeakSkill) {
      score += this.weights.weakSkill;
    }

    // Penalize frequently seen questions
    if (qh.seenCount > 2) {
      score -= qh.seenCount * 0.5;
    }

    // Penalize recently seen
    const hoursSinceLastSeen = (now - qh.lastSeen) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 24) {
      score -= (24 - hoursSinceLastSeen) * 0.1;
    }

    // Random component (prevents staleness)
    score += Math.random() * this.weights.random;

    return Math.max(0, score);
  }

  // ==================== REASON DETECTION ====================

  private getSelectionReason(
    question: Question,
    userHistory: UserHistoryManager,
    sessionState: SessionState
  ): QuestionSelection['reason'] {
    const qid = question.metadata.questionId;
    const qh = userHistory.getQuestionHistory(qid);

    // Priority order
    if (qh.attempts === 0) {
      return 'new';
    }

    const now = Date.now();
    if (qh.nextReviewDue <= now) {
      return 'spaced-repetition';
    }

    if (qh.incorrect > qh.correct) {
      return 'review';
    }

    const hasWeakSkill = question.metadata.skills.some(skillId => {
      const sh = userHistory.getSkillHistory(skillId);
      return sh.mastery < 50 && sh.totalAttempts >= 3;
    });

    if (hasWeakSkill) {
      return 'weak-skill';
    }

    return 'random';
  }

  // ==================== ADAPTIVE DIFFICULTY ====================

  /**
   * Suggest difficulty band based on current session performance
   */
  static suggestDifficultyBand(
    currentBand: [number, number] | undefined,
    recentAccuracy: number
  ): [number, number] {
    const [currentMin, currentMax] = currentBand || [2, 3];

    // If accuracy > 80%, increase difficulty
    if (recentAccuracy > 0.8) {
      return [
        Math.min(5, currentMin + 1) as 1 | 2 | 3 | 4 | 5,
        Math.min(5, currentMax + 1) as 1 | 2 | 3 | 4 | 5
      ];
    }

    // If accuracy < 50%, decrease difficulty
    if (recentAccuracy < 0.5) {
      return [
        Math.max(1, currentMin - 1) as 1 | 2 | 3 | 4 | 5,
        Math.max(1, currentMax - 1) as 1 | 2 | 3 | 4 | 5
      ];
    }

    // Otherwise, keep current
    return [currentMin, currentMax];
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Mark question as seen in current session
   */
  markQuestionSeen(questionId: string): void {
    this.config.sessionState.seenQuestionIds.add(questionId);
  }

  /**
   * Record answer result
   */
  recordAnswer(
    questionId: string,
    isCorrect: boolean,
    timeSeconds: number,
    skills: string[]
  ): void {
    this.config.userHistory.recordQuestionAttempt(
      questionId,
      isCorrect,
      timeSeconds,
      skills
    );

    this.config.sessionState.questionsAnswered++;
    if (isCorrect) {
      this.config.sessionState.questionsCorrect++;
    }
  }

  /**
   * Get current session accuracy
   */
  getSessionAccuracy(): number {
    const { questionsAnswered, questionsCorrect } = this.config.sessionState;
    if (questionsAnswered === 0) return 0;
    return questionsCorrect / questionsAnswered;
  }

  // ==================== BATCH SELECTION ====================

  /**
   * Select multiple questions at once (for pre-generation)
   */
  selectQuestions(count: number): QuestionSelection[] {
    const selections: QuestionSelection[] = [];

    for (let i = 0; i < count; i++) {
      const selection = this.selectNextQuestion();
      if (!selection) break;

      selections.push(selection);

      // Mark as seen to avoid duplicates
      this.markQuestionSeen(selection.question.metadata.questionId);
    }

    return selections;
  }

  // ==================== DIAGNOSTICS ====================

  /**
   * Get pool statistics
   */
  getPoolStats(): {
    total: number;
    eligible: number;
    neverSeen: number;
    reviewDue: number;
    weak: number;
  } {
    const { availableQuestions, sessionState, userHistory } = this.config;

    const eligible = this.filterQuestions(availableQuestions, sessionState);

    let neverSeen = 0;
    let reviewDue = 0;
    let weak = 0;
    const now = Date.now();

    for (const q of eligible) {
      const qh = userHistory.getQuestionHistory(q.metadata.questionId);

      if (qh.attempts === 0) neverSeen++;
      if (qh.nextReviewDue <= now) reviewDue++;

      const hasWeakSkill = q.metadata.skills.some(skillId => {
        const sh = userHistory.getSkillHistory(skillId);
        return sh.mastery < 50 && sh.totalAttempts >= 3;
      });

      if (hasWeakSkill) weak++;
    }

    return {
      total: availableQuestions.length,
      eligible: eligible.length,
      neverSeen,
      reviewDue,
      weak
    };
  }
}

console.log('🎯 Question Engine loaded');
