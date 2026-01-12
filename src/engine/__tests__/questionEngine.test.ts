/**
 * 🧪 Question Engine Tests
 */

import './setup'; // Mock localStorage
import { describe, it, expect, beforeEach } from 'vitest';
import { QuestionEngine } from '../questionEngine';
import { UserHistoryManager } from '../userHistory';
import { QuestionTemplate, GeneratorParams } from '../types';
import { createTemplate } from '../generators/baseGenerators';

// Mock template for testing
const mockTemplate: QuestionTemplate = createTemplate('test-addition', {
  name: 'Test Addition',
  description: 'Simple addition for testing',
  gradeRange: ['1', '3'],
  domains: ['OA'],
  standards: ['1.OA.A.1'],
  generator: (params: GeneratorParams) => {
    const a = 5;
    const b = 3;
    const answer = a + b;

    return {
      metadata: {
        questionId: `test-addition-${params.seed}`,
        templateId: 'test-addition',
        topic: 'Addition',
        gradeRange: ['1', '3'],
        domains: ['OA'],
        standards: ['1.OA.A.1'],
        difficulty: params.difficulty,
        cognitiveComplexity: 'application',
        skills: ['addition'],
        prerequisites: ['counting'],
        tags: ['arithmetic', 'addition']
      },
      content: {
        prompt: `${a} + ${b} = ?`,
        choices: ['7', '8', '9', '10'],
        correctAnswer: answer,
        explanation: `${a} + ${b} = ${answer}`,
        hint: 'Count on from 5'
      },
      generationParams: { a, b },
      generatedAt: Date.now()
    };
  },
  maxVariations: 100,
  estimatedCount: 100
});

describe('QuestionEngine', () => {
  let engine: QuestionEngine;
  let historyManager: UserHistoryManager;

  beforeEach(() => {
    historyManager = new UserHistoryManager('test-user');
    historyManager.clearHistory();
    engine = new QuestionEngine([mockTemplate], historyManager);
  });

  describe('Question Selection', () => {
    it('should select a question', () => {
      const selection = engine.selectNextQuestion({
        sessionId: 'test-session',
        mode: 'training',
        grade: '2',
        seenQuestionIds: new Set(),
        currentQuestion: undefined,
        questionsAnswered: 0,
        questionsCorrect: 0,
        startedAt: Date.now(),
        currentQuestionStartedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false
      });

      expect(selection).toBeDefined();
      expect(selection?.question).toBeDefined();
      expect(selection?.question.metadata.templateId).toBe('test-addition');
      expect(selection?.reason).toBe('new');
    });

    it('should not repeat questions in the same session', () => {
      const seenIds = new Set<string>();

      // Select first question
      const selection1 = engine.selectNextQuestion({
        sessionId: 'test-session',
        mode: 'training',
        grade: '2',
        seenQuestionIds: seenIds,
        currentQuestion: undefined,
        questionsAnswered: 0,
        questionsCorrect: 0,
        startedAt: Date.now(),
        currentQuestionStartedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false
      });

      expect(selection1).toBeDefined();
      seenIds.add(selection1!.question.metadata.questionId);

      // Select second question with different seed
      const selection2 = engine.selectNextQuestion({
        sessionId: 'test-session-2',
        mode: 'training',
        grade: '2',
        seenQuestionIds: seenIds,
        currentQuestion: undefined,
        questionsAnswered: 1,
        questionsCorrect: 1,
        startedAt: Date.now(),
        currentQuestionStartedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false
      });

      expect(selection2).toBeDefined();
      expect(selection2!.question.metadata.questionId).not.toBe(selection1!.question.metadata.questionId);
    });

    it('should filter by grade', () => {
      const selectionGrade1 = engine.selectNextQuestion({
        sessionId: 'test-session',
        mode: 'training',
        grade: '1',
        seenQuestionIds: new Set(),
        currentQuestion: undefined,
        questionsAnswered: 0,
        questionsCorrect: 0,
        startedAt: Date.now(),
        currentQuestionStartedAt: Date.now(),
        appSwitches: 0,
        suspiciousActivity: false
      });

      expect(selectionGrade1).toBeDefined();
      expect(selectionGrade1?.question.metadata.gradeRange[0]).toBe('1');
    });
  });

  // Note: Adaptive difficulty and batch selection features are not yet implemented in QuestionEngine
});

describe('UserHistoryManager', () => {
  let manager: UserHistoryManager;

  beforeEach(() => {
    manager = new UserHistoryManager('test-user');
    manager.clearHistory();
  });

  describe('Question History', () => {
    it('should record question attempts', () => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);

      const history = manager.getQuestionHistory('q1');
      expect(history.attempts).toBe(1);
      expect(history.correct).toBe(1);
      expect(history.incorrect).toBe(0);
      expect(history.lastResult).toBe('correct');
    });

    it('should track incorrect answers', () => {
      manager.recordQuestionAttempt('q1', false, 10, ['addition']);

      const history = manager.getQuestionHistory('q1');
      expect(history.attempts).toBe(1);
      expect(history.correct).toBe(0);
      expect(history.incorrect).toBe(1);
      expect(history.lastResult).toBe('incorrect');
    });

    it('should update spaced repetition schedule', () => {
      const beforeReview = manager.getQuestionHistory('q1').nextReviewDue;
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      const afterReview = manager.getQuestionHistory('q1').nextReviewDue;

      expect(afterReview).toBeGreaterThan(beforeReview);
    });
  });

  describe('Skill History', () => {
    it('should track skill mastery', () => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      manager.recordQuestionAttempt('q2', true, 5, ['addition']);
      manager.recordQuestionAttempt('q3', true, 5, ['addition']);

      const skillHistory = manager.getSkillHistory('addition');
      expect(skillHistory.totalAttempts).toBe(3);
      expect(skillHistory.correctCount).toBe(3);
      expect(skillHistory.currentAccuracy).toBe(100);
      expect(skillHistory.mastery).toBeGreaterThan(0);
    });

    it('should update streak on consecutive correct answers', () => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      manager.recordQuestionAttempt('q2', true, 5, ['addition']);
      manager.recordQuestionAttempt('q3', true, 5, ['addition']);

      const skillHistory = manager.getSkillHistory('addition');
      expect(skillHistory.streak).toBe(3);
    });

    it('should reset streak on incorrect answer', () => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      manager.recordQuestionAttempt('q2', true, 5, ['addition']);
      manager.recordQuestionAttempt('q3', false, 10, ['addition']);

      const skillHistory = manager.getSkillHistory('addition');
      expect(skillHistory.streak).toBe(0);
    });

    it('should calculate mastery with accuracy and streak', () => {
      // High accuracy, high streak = high mastery
      for (let i = 0; i < 5; i++) {
        manager.recordQuestionAttempt(`q${i}`, true, 5, ['addition']);
      }

      const skillHistory = manager.getSkillHistory('addition');
      expect(skillHistory.mastery).toBeGreaterThan(50);
    });
  });

  describe('Queries', () => {
    beforeEach(() => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      manager.recordQuestionAttempt('q2', false, 10, ['addition']);
      manager.recordQuestionAttempt('q2', false, 10, ['addition']);
    });

    it('should return never seen questions', () => {
      const allQuestions = ['q1', 'q2', 'q3', 'q4'];
      const neverSeen = manager.getNeverSeenQuestions(allQuestions);

      expect(neverSeen).toContain('q3');
      expect(neverSeen).toContain('q4');
      expect(neverSeen).not.toContain('q1');
      expect(neverSeen).not.toContain('q2');
    });

    it('should return incorrect questions', () => {
      const incorrect = manager.getIncorrectQuestions();

      expect(incorrect).toContain('q2');
      expect(incorrect).not.toContain('q1');
    });
  });

  describe('Persistence', () => {
    it('should export and import history', () => {
      manager.recordQuestionAttempt('q1', true, 5, ['addition']);
      manager.recordQuestionAttempt('q2', false, 10, ['subtraction']);

      const exported = manager.exportHistory();
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const newManager = new UserHistoryManager('test-user-2');
      newManager.clearHistory();
      const imported = newManager.importHistory(exported);

      expect(imported).toBe(true);
      expect(newManager.getQuestionHistory('q1').attempts).toBe(1);
      expect(newManager.getQuestionHistory('q2').incorrect).toBe(1);
    });
  });
});
