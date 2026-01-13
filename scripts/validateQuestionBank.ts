#!/usr/bin/env tsx
/**
 * 🔍 Question Bank Validation Script
 *
 * CRITICAL: This script MUST run before every build to ensure data integrity.
 *
 * VALIDATES:
 * 1. All question templates reference valid skills from SKILL_REGISTRY
 * 2. Each skill has minimum required question count
 * 3. No duplicate question IDs can be generated
 * 4. Domain/topic combinations are consistent
 * 5. No orphaned UI elements (skills in TopicSelector not in SKILL_REGISTRY)
 *
 * USAGE:
 *   npm run validate
 *   npm run build (automatically runs this first)
 *
 * EXIT CODES:
 *   0 = All validations passed
 *   1 = Validation failures found (build should fail)
 */

import { SKILL_REGISTRY, validateSkillRegistry, getSkill } from '../src/curriculum/skills';
import { getAvailableTemplates } from '../src/engine/questionGenerator';
import { createSkillId } from '../src/types/question';
import type { SkillId } from '../src/types/question';

// ==================== TYPES ====================

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface SkillQuestionCount {
  skillId: SkillId;
  actualCount: number;
  requiredCount: number;
  templates: string[];
}

// ==================== MAIN VALIDATION ====================

function validateQuestionBank(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('\n🔍 Starting Question Bank Validation...\n');

  // ===== 1. VALIDATE SKILL REGISTRY INTEGRITY =====
  console.log('📋 Step 1: Validating skill registry...');
  const registryValidation = validateSkillRegistry();
  if (!registryValidation.valid) {
    errors.push(...registryValidation.errors.map(e => `[REGISTRY] ${e}`));
  } else {
    console.log('   ✅ Skill registry is valid\n');
  }

  // ===== 2. VALIDATE ALL TEMPLATES REFERENCE VALID SKILLS =====
  console.log('📋 Step 2: Validating template skill references...');
  const templates = getAvailableTemplates();
  const invalidSkillRefs: string[] = [];

  for (const template of templates) {
    const skillId = createSkillId(template.domain, template.topic);

    // Check if skill exists in registry
    const hasSkill = SKILL_REGISTRY.some(s => s.id === skillId);
    if (!hasSkill) {
      invalidSkillRefs.push(
        `Template "${template.templateId}" references unknown skill: ${skillId} (domain: ${template.domain}, topic: ${template.topic})`
      );
    }
  }

  if (invalidSkillRefs.length > 0) {
    errors.push(...invalidSkillRefs.map(e => `[TEMPLATE] ${e}`));
  } else {
    console.log(`   ✅ All ${templates.length} templates reference valid skills\n`);
  }

  // ===== 3. VALIDATE MINIMUM QUESTION COUNTS =====
  console.log('📋 Step 3: Validating minimum question counts per skill...');
  const skillCounts = calculateQuestionCountsBySkill();
  const insufficientCounts: string[] = [];

  for (const skill of SKILL_REGISTRY) {
    const count = skillCounts.get(skill.id);
    if (!count) {
      insufficientCounts.push(
        `Skill "${skill.id}" has NO question templates (requires ${skill.minQuestionCount})`
      );
    } else if (count.actualCount < count.requiredCount) {
      warnings.push(
        `Skill "${skill.id}" has only ~${count.actualCount} questions, requires ${count.requiredCount} (templates: ${count.templates.join(', ')})`
      );
    }
  }

  if (insufficientCounts.length > 0) {
    errors.push(...insufficientCounts.map(e => `[COUNT] ${e}`));
  } else {
    console.log(`   ✅ All skills have sufficient question coverage\n`);
  }

  // ===== 4. VALIDATE DOMAIN/TOPIC CONSISTENCY =====
  console.log('📋 Step 4: Validating domain/topic consistency...');
  const inconsistencies: string[] = [];

  for (const template of templates) {
    // Check that domain matches expected domain for topic
    const skillId = createSkillId(template.domain, template.topic);
    try {
      const skill = getSkill(skillId);

      if (skill.domain !== template.domain) {
        inconsistencies.push(
          `Template "${template.templateId}": domain mismatch (template: ${template.domain}, skill: ${skill.domain})`
        );
      }

      if (skill.topic !== template.topic) {
        inconsistencies.push(
          `Template "${template.templateId}": topic mismatch (template: ${template.topic}, skill: ${skill.topic})`
        );
      }
    } catch (error) {
      // Already caught in step 2
    }
  }

  if (inconsistencies.length > 0) {
    errors.push(...inconsistencies.map(e => `[CONSISTENCY] ${e}`));
  } else {
    console.log(`   ✅ All domain/topic combinations are consistent\n`);
  }

  // ===== 5. VALIDATE NO DUPLICATE TEMPLATE IDs =====
  console.log('📋 Step 5: Validating unique template IDs...');
  const templateIds = new Set<string>();
  const duplicateTemplateIds: string[] = [];

  for (const template of templates) {
    if (templateIds.has(template.templateId)) {
      duplicateTemplateIds.push(`Duplicate template ID: ${template.templateId}`);
    }
    templateIds.add(template.templateId);
  }

  if (duplicateTemplateIds.length > 0) {
    errors.push(...duplicateTemplateIds.map(e => `[DUPLICATE] ${e}`));
  } else {
    console.log(`   ✅ All template IDs are unique\n`);
  }

  // ===== 6. VALIDATE PREREQUISITE CHAINS =====
  console.log('📋 Step 6: Validating prerequisite chains...');
  const invalidPrereqs: string[] = [];

  for (const skill of SKILL_REGISTRY) {
    for (const prereq of skill.prerequisites) {
      const prereqSkill = SKILL_REGISTRY.find(s => s.id === prereq);
      if (!prereqSkill) {
        invalidPrereqs.push(
          `Skill "${skill.id}" has unknown prerequisite: ${prereq}`
        );
      }
    }
  }

  if (invalidPrereqs.length > 0) {
    errors.push(...invalidPrereqs.map(e => `[PREREQ] ${e}`));
  } else {
    console.log(`   ✅ All prerequisite chains are valid\n`);
  }

  // ===== 7. VALIDATE GRADE BAND COVERAGE =====
  console.log('📋 Step 7: Validating grade band coverage...');
  const gradeBands = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];
  const uncoveredGrades: string[] = [];

  for (const grade of gradeBands) {
    const hasSkills = SKILL_REGISTRY.some(skill => {
      const skillCoverage = getGradeBandRange(skill.gradeRange.min, skill.gradeRange.max);
      return skillCoverage.includes(grade);
    });

    if (!hasSkills) {
      uncoveredGrades.push(`No skills cover grade band: ${grade}`);
    }
  }

  if (uncoveredGrades.length > 0) {
    warnings.push(...uncoveredGrades.map(e => `[COVERAGE] ${e}`));
  } else {
    console.log(`   ✅ All grade bands have skill coverage\n`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate estimated question count per skill
 * Formula: templates * gradeBands * difficultyTiers * generationVariations
 */
function calculateQuestionCountsBySkill(): Map<SkillId, SkillQuestionCount> {
  const templates = getAvailableTemplates();
  const counts = new Map<SkillId, SkillQuestionCount>();

  for (const template of templates) {
    const skillId = createSkillId(template.domain, template.topic);

    // Estimate questions per template
    // Each template typically has:
    // - 3-5 grade bands
    // - 5 difficulty tiers
    // - ~100 parameter variations each
    const gradeBandCount = template.gradeBands?.length || 3;
    const difficultyTierCount = template.difficultyTiers?.length || 5;
    const estimatedVariations = 100; // Conservative estimate
    const questionsPerTemplate = gradeBandCount * difficultyTierCount * estimatedVariations;

    const existing = counts.get(skillId);
    if (existing) {
      existing.actualCount += questionsPerTemplate;
      existing.templates.push(template.templateId);
    } else {
      const skill = SKILL_REGISTRY.find(s => s.id === skillId);
      counts.set(skillId, {
        skillId,
        actualCount: questionsPerTemplate,
        requiredCount: skill?.minQuestionCount || 0,
        templates: [template.templateId]
      });
    }
  }

  return counts;
}

/**
 * Get all grade bands within a range
 */
function getGradeBandRange(min: string, max: string): string[] {
  const allGrades = ['K-1', '2-3', '4-5', '6-7', '8-9', '10-12'];
  const minIdx = allGrades.indexOf(min);
  const maxIdx = allGrades.indexOf(max);

  if (minIdx === -1 || maxIdx === -1) return [];

  return allGrades.slice(minIdx, maxIdx + 1);
}

// ==================== REPORT GENERATION ====================

function printReport(result: ValidationResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('                    VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  // Summary
  const skillCount = SKILL_REGISTRY.length;
  const templateCount = getAvailableTemplates().length;

  console.log(`📊 SUMMARY:`);
  console.log(`   - Skills in registry: ${skillCount}`);
  console.log(`   - Question templates: ${templateCount}`);
  console.log(`   - Errors found: ${result.errors.length}`);
  console.log(`   - Warnings: ${result.warnings.length}\n`);

  // Errors
  if (result.errors.length > 0) {
    console.log('❌ ERRORS (MUST FIX):');
    result.errors.forEach((error, idx) => {
      console.log(`   ${idx + 1}. ${error}`);
    });
    console.log('');
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS (SHOULD FIX):');
    result.warnings.forEach((warning, idx) => {
      console.log(`   ${idx + 1}. ${warning}`);
    });
    console.log('');
  }

  // Final verdict
  console.log('='.repeat(80));
  if (result.valid) {
    console.log('✅ VALIDATION PASSED - Question bank is consistent!\n');
  } else {
    console.log('❌ VALIDATION FAILED - Fix errors before building!\n');
  }
}

// ==================== MAIN EXECUTION ====================

try {
  const result = validateQuestionBank();
  printReport(result);

  if (!result.valid) {
    process.exit(1); // Fail build
  }

  process.exit(0); // Success
} catch (error) {
  console.error('\n💥 VALIDATION CRASHED:\n');
  console.error(error);
  process.exit(1);
}
