/**
 * 🔌 Question Engine Adapter - Bridges new Question Engine with existing Task system
 */

import { Question, GradeLevel, GeneratorParams } from './types';
import { QuestionEngine } from './questionEngine';
import { UserHistoryManager } from './userHistory';
import { ALL_TEMPLATES } from './generators';
import { Task, SkillType } from '../data/taskBank';
import { MathSkillKey } from '../types/mathSkills';

// ==================== AGE TO GRADE MAPPING ====================

export function ageToGrade(age: number): GradeLevel {
  if (age <= 5) return 'K';
  if (age === 6) return '1';
  if (age === 7) return '2';
  if (age === 8) return '3';
  if (age === 9) return '4';
  if (age === 10) return '5';
  if (age === 11) return '6';
  if (age === 12) return '7';
  return '8';
}

// ==================== SKILLTYPE TO DOMAIN MAPPING ====================

const SKILLTYPE_TO_TOPICS: Record<SkillType, string[]> = {
  arithmetic: ['Сложение', 'Вычитание', 'Умножение', 'Деление', 'Дроби', 'Десятичные дроби'],
  geometry: ['Геометрия', 'Фигуры', 'Площадь', 'Периметр', 'Объём', 'Измерения'],
  logic: ['Логика', 'Паттерны', 'Последовательности', 'Текстовые задачи', 'Задачи на сравнение', 'Многошаговые задачи']
};

// ==================== QUESTION TO TASK CONVERTER ====================

/**
 * Converts a Question from the engine to a Task for the legacy system
 */
export function questionToTask(question: Question): Task {
  const { metadata, content } = question;

  // Extract numeric answer from choices if needed
  let numericAnswer: number;
  if (typeof content.correctAnswer === 'number') {
    numericAnswer = content.correctAnswer;
  } else {
    // Try to parse as number
    const parsed = parseFloat(content.correctAnswer);
    numericAnswer = isNaN(parsed) ? 0 : parsed;
  }

  // Map difficulty 1-5 to 1-6 range (legacy system uses 1-6)
  const legacyDifficulty = Math.min(6, metadata.difficulty + 1);

  // Calculate time limit based on difficulty and topic
  const baseTime = 30;
  const timeMultiplier = metadata.difficulty * 10;
  const timeLimit = baseTime + timeMultiplier;

  // Calculate XP reward
  const baseXP = 10;
  const xpReward = baseXP * metadata.difficulty;

  return {
    q: content.prompt,
    a: numericAnswer,
    t: metadata.subtopic || metadata.topic,
    e: content.explanation,
    d: legacyDifficulty,
    time: timeLimit,
    xp: xpReward,
    hint: content.hint,
    skillType: inferSkillType(metadata.topic)
  };
}

/**
 * Infer SkillType from topic name
 */
function inferSkillType(topic: string): SkillType {
  const topicLower = topic.toLowerCase();

  if (topicLower.includes('геометр') || topicLower.includes('фигур') ||
      topicLower.includes('площад') || topicLower.includes('объём') ||
      topicLower.includes('периметр') || topicLower.includes('измер')) {
    return 'geometry';
  }

  if (topicLower.includes('логик') || topicLower.includes('паттерн') ||
      topicLower.includes('последовательност') || topicLower.includes('текстов') ||
      topicLower.includes('задач') || topicLower.includes('сравнен')) {
    return 'logic';
  }

  return 'arithmetic';
}

// ==================== QUESTION ENGINE ADAPTER ====================

export class QuestionEngineAdapter {
  private engine: QuestionEngine;
  private historyManager: UserHistoryManager;
  private userId: string;
  private userAge: number;

  constructor(userId: string, userAge: number) {
    this.userId = userId;
    this.userAge = userAge;
    this.historyManager = new UserHistoryManager(userId);
    this.engine = new QuestionEngine(ALL_TEMPLATES, this.historyManager);

    // Apply skill decay on initialization
    this.historyManager.applySkillDecay();
  }

  /**
   * Get tasks for a training session
   */
  getTasksForTraining(
    skillType: SkillType,
    count: number,
    options?: {
      topic?: string;
      subtopic?: string;
      difficulty?: number;
    }
  ): Task[] {
    const grade = ageToGrade(this.userAge);
    const topics = SKILLTYPE_TO_TOPICS[skillType];

    const tasks: Task[] = [];
    const seenQuestionIds = new Set<string>();

    // Generate questions using the engine
    for (let i = 0; i < count; i++) {
      const selection = this.engine.selectNextQuestion({
        sessionId: `training-${Date.now()}`,
        mode: 'training',
        grade,
        topicFilter: options?.topic,
        subtopicFilter: options?.subtopic,
        difficultyBand: options?.difficulty ? [options.difficulty, options.difficulty] : undefined,
        seenQuestionIds,
        currentQuestion: undefined,
        questionsAnswered: i,
        questionsCorrect: 0,
        startedAt: Date.now(),
        currentQuestionStartedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false
      });

      if (!selection) {
        console.warn(`Could not generate question ${i + 1} for ${skillType}`);
        continue;
      }

      // Convert to Task format
      const task = questionToTask(selection.question);
      tasks.push(task);

      // Track as seen
      seenQuestionIds.add(selection.question.metadata.questionId);
    }

    return tasks;
  }

  /**
   * Record answer result and update history
   */
  recordAnswer(
    questionId: string,
    isCorrect: boolean,
    timeSeconds: number,
    skills: string[]
  ): void {
    this.historyManager.recordQuestionAttempt(
      questionId,
      isCorrect,
      timeSeconds,
      skills
    );
  }

  /**
   * Get skill mastery for display
   */
  getSkillMastery(skillId: string): number {
    return this.historyManager.getSkillMastery(skillId);
  }

  /**
   * Get all skill masteries
   */
  getAllSkillMasteries(): Map<string, number> {
    return this.historyManager.getAllSkillMasteries();
  }

  /**
   * Increment session count
   */
  incrementSession(): void {
    this.historyManager.incrementSessionCount();
  }

  /**
   * Export history for backup
   */
  exportHistory(): string {
    return this.historyManager.exportHistory();
  }

  /**
   * Import history from backup
   */
  importHistory(jsonData: string): boolean {
    return this.historyManager.importHistory(jsonData);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.historyManager.clearHistory();
  }

  /**
   * Get statistics for UI
   */
  getStatistics() {
    const history = this.historyManager['history']; // Access private property

    return {
      totalQuestionsAttempted: history.totalQuestionsAttempted,
      totalCorrect: history.totalCorrect,
      accuracy: history.totalQuestionsAttempted > 0
        ? (history.totalCorrect / history.totalQuestionsAttempted) * 100
        : 0,
      totalSessions: history.totalSessions,
      uniqueQuestionsAttempted: history.questionHistory.size,
      skillsMastered: Array.from(history.skillHistory.values()).filter(sh => sh.mastery >= 80).length,
      totalSkills: history.skillHistory.size
    };
  }
}

// ==================== SINGLETON INSTANCE ====================

let adapterInstance: QuestionEngineAdapter | null = null;

/**
 * Get or create the adapter instance
 */
export function getQuestionEngineAdapter(userId: string, userAge: number): QuestionEngineAdapter {
  if (!adapterInstance || adapterInstance['userId'] !== userId) {
    adapterInstance = new QuestionEngineAdapter(userId, userAge);
  }
  return adapterInstance;
}

/**
 * Reset the adapter instance (useful for tests or user change)
 */
export function resetQuestionEngineAdapter(): void {
  adapterInstance = null;
}

console.log('🔌 Question Engine Adapter loaded');
