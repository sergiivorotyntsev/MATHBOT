/**
 * 🧪 Question Bank Validation Tests
 *
 * Tests the validation pipeline that runs at build time.
 */

import { describe, it, expect } from 'vitest';
import { SKILL_REGISTRY, validateSkillRegistry, getSkill } from '../curriculum/skills';
import { getAvailableTemplates } from '../engine/questionGenerator';
import { createSkillId } from '../types/question';
import type { SkillId } from '../types/question';

describe('Skill Registry Validation', () => {
  it('should have a valid skill registry with no errors', () => {
    const result = validateSkillRegistry();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should have at least 14 core skills', () => {
    expect(SKILL_REGISTRY.length).toBeGreaterThanOrEqual(14);
  });

  it('should have no duplicate skill IDs', () => {
    const ids = SKILL_REGISTRY.map(s => s.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should have valid prerequisites (no circular dependencies)', () => {
    for (const skill of SKILL_REGISTRY) {
      const visited = new Set<SkillId>();
      const checkPrereqs = (currentId: SkillId) => {
        if (visited.has(currentId)) {
          throw new Error(`Circular dependency detected: ${currentId}`);
        }
        visited.add(currentId);

        const currentSkill = SKILL_REGISTRY.find(s => s.id === currentId);
        if (currentSkill) {
          currentSkill.prerequisites.forEach(checkPrereqs);
        }
      };

      expect(() => checkPrereqs(skill.id)).not.toThrow();
    }
  });

  it('should have valid grade ranges', () => {
    const validGrades = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];

    for (const skill of SKILL_REGISTRY) {
      expect(validGrades).toContain(skill.gradeRange.min);
      expect(validGrades).toContain(skill.gradeRange.max);

      const minIdx = validGrades.indexOf(skill.gradeRange.min);
      const maxIdx = validGrades.indexOf(skill.gradeRange.max);
      expect(minIdx).toBeLessThanOrEqual(maxIdx);
    }
  });

  it('should have positive minimum question counts', () => {
    for (const skill of SKILL_REGISTRY) {
      expect(skill.minQuestionCount).toBeGreaterThan(0);
    }
  });

  it('should have valid priority levels (1, 2, or 3)', () => {
    for (const skill of SKILL_REGISTRY) {
      expect([1, 2, 3]).toContain(skill.priority);
    }
  });
});

describe('Template Validation', () => {
  const templates = getAvailableTemplates();

  it('should have at least 14 question templates', () => {
    expect(templates.length).toBeGreaterThanOrEqual(14);
  });

  it('should have unique template IDs', () => {
    const ids = templates.map(t => t.templateId);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should reference only valid skills', () => {
    for (const template of templates) {
      const skillId = createSkillId(template.domain, template.topic);

      expect(() => getSkill(skillId)).not.toThrow();
    }
  });

  it('should have consistent domain/topic combinations', () => {
    for (const template of templates) {
      const skillId = createSkillId(template.domain, template.topic);
      const skill = getSkill(skillId);

      expect(skill.domain).toBe(template.domain);
      expect(skill.topic).toBe(template.topic);
    }
  });

  it('should have valid difficulty ranges (1-5)', () => {
    for (const template of templates) {
      if (template.difficultyTiers) {
        for (const tier of template.difficultyTiers) {
          expect(tier).toBeGreaterThanOrEqual(1);
          expect(tier).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});

describe('Question Count Validation', () => {
  it('should have sufficient questions for each skill', () => {
    const templates = getAvailableTemplates();
    const skillQuestionCounts = new Map<SkillId, number>();

    // Count templates per skill
    for (const template of templates) {
      const skillId = createSkillId(template.domain, template.topic);
      const current = skillQuestionCounts.get(skillId) || 0;

      // Estimate: each template can generate ~1500 questions
      // (3 grade bands × 5 difficulty tiers × 100 variations)
      const estimatedQuestions = 1500;
      skillQuestionCounts.set(skillId, current + estimatedQuestions);
    }

    // Verify each skill has minimum questions
    for (const skill of SKILL_REGISTRY) {
      const count = skillQuestionCounts.get(skill.id) || 0;
      expect(count).toBeGreaterThanOrEqual(skill.minQuestionCount);
    }
  });
});

describe('Coverage Validation', () => {
  it('should cover all three main categories', () => {
    const categories = new Set(SKILL_REGISTRY.map(s => s.category));

    expect(categories.has('arithmetic')).toBe(true);
    expect(categories.has('geometry')).toBe(true);
    expect(categories.has('logic')).toBe(true);
  });

  it('should have skills for K-8 grade range', () => {
    const k8Grades = ['K-1', '2-3', '4-5', '6-7', '8-9'];

    for (const grade of k8Grades) {
      const hasSkills = SKILL_REGISTRY.some(skill => {
        const validGrades = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];
        const minIdx = validGrades.indexOf(skill.gradeRange.min);
        const maxIdx = validGrades.indexOf(skill.gradeRange.max);
        const gradeIdx = validGrades.indexOf(grade);

        return gradeIdx >= minIdx && gradeIdx <= maxIdx;
      });

      expect(hasSkills).toBe(true);
    }
  });

  it('should have balanced skill distribution across categories', () => {
    const categoryCounts = {
      arithmetic: 0,
      geometry: 0,
      logic: 0
    };

    for (const skill of SKILL_REGISTRY) {
      categoryCounts[skill.category]++;
    }

    // Each category should have at least 3 skills
    expect(categoryCounts.arithmetic).toBeGreaterThanOrEqual(3);
    expect(categoryCounts.geometry).toBeGreaterThanOrEqual(3);
    expect(categoryCounts.logic).toBeGreaterThanOrEqual(3);
  });
});
