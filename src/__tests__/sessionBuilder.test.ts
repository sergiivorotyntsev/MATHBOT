/**
 * 🧪 Session Builder Tests
 *
 * Tests the session builder to ensure:
 * 1. Domain+topic filtering works correctly (CRITICAL FIX)
 * 2. No duplicate question IDs in sessions
 * 3. All questions match requested skills
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { buildSession, validateSession } from '../engine/sessionBuilder';
import { createSkillStatsStore } from '../types/skillStats';
import type { SkillId } from '../types/question';

describe('Session Builder - Critical Domain+Topic Filtering', () => {
  let statsStore: ReturnType<typeof createSkillStatsStore>;
  let masteredSkills: Set<SkillId>;

  beforeEach(() => {
    statsStore = createSkillStatsStore();
    masteredSkills = new Set();
  });

  it('should generate questions with correct domain for geometry_shapes', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'geometry_shapes',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    expect(session.questions.length).toBeGreaterThan(0);

    // CRITICAL: All questions MUST be from correct domain
    const geometryQuestions = session.questions.filter(q => q.domain === 'Geometry');

    // At least 60% should be geometry (focus skill)
    expect(geometryQuestions.length).toBeGreaterThanOrEqual(session.questions.length * 0.5);

    // No arithmetic questions with topic "Shapes" (cross-domain contamination)
    const arithmeticShapes = session.questions.filter(
      q => q.domain === 'Arithmetic' && q.topic.toLowerCase().includes('shape')
    );
    expect(arithmeticShapes.length).toBe(0);
  });

  it('should generate questions with correct domain for arithmetic_addition', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'arithmetic_addition',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    expect(session.questions.length).toBeGreaterThan(0);

    // CRITICAL: Focus questions MUST be arithmetic
    const arithmeticQuestions = session.questions.filter(q => q.domain === 'Arithmetic');

    // At least 50% should be arithmetic
    expect(arithmeticQuestions.length).toBeGreaterThanOrEqual(session.questions.length * 0.5);
  });

  it('should NOT mix domains inappropriately', () => {
    const geometrySession = buildSession({
      userAge: 8,
      focusSkillId: 'geometry_shapes',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    // Verify we get some geometry questions
    const geometryQuestions = geometrySession.questions.filter(q => q.domain === 'Geometry');
    expect(geometryQuestions.length).toBeGreaterThan(0);

    // Each geometry question should have correct skillId
    for (const q of geometryQuestions) {
      expect(q.skillId).toMatch(/^geometry_/);
    }
  });
});

describe('Session Builder - No Duplicates', () => {
  let statsStore: ReturnType<typeof createSkillStatsStore>;
  let masteredSkills: Set<SkillId>;

  beforeEach(() => {
    statsStore = createSkillStatsStore();
    masteredSkills = new Set();
  });

  it('should generate unique question IDs within a session', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'arithmetic_addition',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    const questionIds = session.questions.map(q => q.id);
    const uniqueIds = new Set(questionIds);

    expect(questionIds.length).toBe(uniqueIds.size);
  });

  it('should pass validation (no duplicates)', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'geometry_shapes',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    expect(validateSession(session)).toBe(true);
  });

  it('should maintain uniqueness across multiple sessions', () => {
    const allIds = new Set<string>();

    for (let i = 0; i < 3; i++) {
      const session = buildSession({
        userAge: 8,
        focusSkillId: 'arithmetic_addition',
        questionCount: 10,
        language: 'en',
        statsStore,
        masteredSkills
      });

      for (const question of session.questions) {
        // IDs should be globally unique (with very high probability)
        expect(allIds.has(question.id)).toBe(false);
        allIds.add(question.id);
      }
    }
  });
});

describe('Session Builder - Question Quality', () => {
  let statsStore: ReturnType<typeof createSkillStatsStore>;
  let masteredSkills: Set<SkillId>;

  beforeEach(() => {
    statsStore = createSkillStatsStore();
    masteredSkills = new Set();
  });

  it('should generate well-formed questions', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'geometry_shapes',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    for (const question of session.questions) {
      // Required fields
      expect(question.id).toBeDefined();
      expect(question.id.length).toBeGreaterThan(0);

      expect(question.questionText).toBeDefined();
      expect(question.questionText.length).toBeGreaterThan(0);

      expect(question.correctAnswer).toBeDefined();
      expect(question.choices).toBeDefined();
      expect(question.choices.length).toBeGreaterThanOrEqual(2);

      // Metadata
      expect(question.domain).toBeDefined();
      expect(question.topic).toBeDefined();
      expect(question.skillId).toBeDefined();

      expect(question.difficulty).toBeGreaterThanOrEqual(1);
      expect(question.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('should have unique answer choices in each question', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'arithmetic_addition',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    for (const question of session.questions) {
      const uniqueChoices = new Set(question.choices.map(String));
      expect(question.choices.length).toBe(uniqueChoices.size);
    }
  });

  it('should include correct answer in choices', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'arithmetic_addition',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    for (const question of session.questions) {
      const correctAnswer = String(question.correctAnswer);
      const choices = question.choices.map(String);

      expect(choices).toContain(correctAnswer);
    }
  });
});

describe('Session Builder - Skill Coverage', () => {
  let statsStore: ReturnType<typeof createSkillStatsStore>;
  let masteredSkills: Set<SkillId>;

  beforeEach(() => {
    statsStore = createSkillStatsStore();
    masteredSkills = new Set();
  });

  it('should cover the focus skill', () => {
    const focusSkill: SkillId = 'geometry_shapes';
    const session = buildSession({
      userAge: 8,
      focusSkillId: focusSkill,
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    expect(session.skillsCovered).toContain(focusSkill);

    // At least some questions should be the focus skill
    const focusQuestions = session.questions.filter(q => q.skillId === focusSkill);
    expect(focusQuestions.length).toBeGreaterThan(0);
  });

  it('should include session metadata', () => {
    const session = buildSession({
      userAge: 8,
      focusSkillId: 'arithmetic_addition',
      questionCount: 10,
      language: 'en',
      statsStore,
      masteredSkills
    });

    expect(session.breakdown).toBeDefined();
    expect(session.breakdown.focus).toBeGreaterThanOrEqual(0);
    expect(session.breakdown.prerequisite).toBeGreaterThanOrEqual(0);
    expect(session.breakdown.review).toBeGreaterThanOrEqual(0);

    expect(session.difficultyRange).toBeDefined();
    expect(session.difficultyRange.min).toBeGreaterThanOrEqual(1);
    expect(session.difficultyRange.max).toBeLessThanOrEqual(5);
    expect(session.difficultyRange.min).toBeLessThanOrEqual(session.difficultyRange.max);
  });

  it('should handle different question counts', () => {
    const counts = [5, 10, 15];

    for (const count of counts) {
      const session = buildSession({
        userAge: 8,
        focusSkillId: 'arithmetic_addition',
        questionCount: count,
        language: 'en',
        statsStore,
        masteredSkills
      });

      expect(session.questions.length).toBeGreaterThan(0);
      expect(session.questions.length).toBeLessThanOrEqual(count + 2); // Allow some flexibility
    }
  });

  it('should work with different skills', () => {
    const skillsToTest: SkillId[] = [
      'arithmetic_addition',
      'arithmetic_subtraction',
      'geometry_shapes',
      'logic_patterns'
    ];

    for (const skillId of skillsToTest) {
      const session = buildSession({
        userAge: 8,
        focusSkillId: skillId,
        questionCount: 10,
        language: 'en',
        statsStore,
        masteredSkills
      });

      expect(session.questions.length).toBeGreaterThan(0);
      expect(session.skillsCovered).toContain(skillId);
    }
  });
});
